/**
 * Initial SUPER_ADMIN provisioning CLI.
 *
 * Usage (from server/):
 *   npm run provision:super-admin
 *
 * Credentials are supplied through environment variables or interactive
 * prompts (never through command-line arguments, which would leak the
 * password into the process list / shell history):
 *   SUPER_ADMIN_EMAIL      - the email for the first SUPER_ADMIN account
 *   SUPER_ADMIN_PASSWORD   - the password (hidden when prompted)
 *   SUPER_ADMIN_NAME       - optional display name (defaults to "Super Admin")
 *
 * When stdin is a terminal, any missing piece is prompted for; the password
 * prompt runs with echo disabled. In a non-interactive shell (CI, scripts) all
 * credentials must come from the environment - the command fails safely
 * instead of hanging on a prompt that can never be answered.
 *
 * Output policy: the password, its hash, JWT secrets and the MongoDB URI are
 * never printed. Only the normalized email and role/status of the created
 * account are reported.
 */
import { createInterface } from 'node:readline';
import { stdin, stdout } from 'node:process';
import { connectToDatabase, disconnectFromDatabase } from '../config/database.js';
import { APP_NAME } from '../constants/index.js';
import {
  DEFAULT_SUPER_ADMIN_NAME,
  provisionInitialSuperAdmin,
} from '../services/superAdmin.service.js';

const SUPER_ADMIN_EMAIL_ENV = 'SUPER_ADMIN_EMAIL';
const SUPER_ADMIN_PASSWORD_ENV = 'SUPER_ADMIN_PASSWORD';
const SUPER_ADMIN_NAME_ENV = 'SUPER_ADMIN_NAME';

const EXIT_FAILURE = 1;

/** Strips ANSI escape sequences (arrow keys, Home/End, ...) from raw-mode input. */
function stripEscapeSequences(text: string): string {
  // The ESC control character (U+001B) is intentional here: raw-mode terminals
  // deliver arrow keys as escape sequences, and they must not corrupt the password.
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*[A-Za-z]|\x1b./g, '');
}

/**
 * Prompts for a value with normal echo (used for the email/name).
 * Falls back to a plain line read when stdin is not a TTY.
 */
function prompt(query: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: stdin, output: stdout });
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Prompts for a password with echo disabled (raw mode), so the value never
 * appears on screen and cannot be logged. Ctrl+C / Ctrl+D abort cleanly.
 */
function promptHidden(query: string): Promise<string> {
  return new Promise((resolve, reject) => {
    stdout.write(query);

    // Non-TTY stdin has nothing to hide - read a plain line.
    if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
      const rl = createInterface({ input: stdin, output: stdout });
      rl.question('', (answer) => {
        rl.close();
        resolve(answer);
      });
      return;
    }

    const previousRawMode = stdin.isRaw;
    stdin.setRawMode(true);
    stdin.resume();

    let value = '';
    const onData = (chunk: Buffer): void => {
      for (const char of stripEscapeSequences(chunk.toString('utf8'))) {
        if (char === '\r' || char === '\n') {
          stdin.off('data', onData);
          stdin.setRawMode(previousRawMode);
          stdin.pause();
          stdout.write('\n');
          resolve(value);
          return;
        }
        if (char === '\u0003' || char === '\u0004') {
          // Ctrl+C / Ctrl+D - abort without echoing anything.
          stdin.off('data', onData);
          stdin.setRawMode(previousRawMode);
          stdin.pause();
          stdout.write('\n');
          reject(new Error('Provisioning aborted.'));
          return;
        }
        if (char === '\u007f' || char === '\b') {
          value = value.slice(0, -1);
          continue;
        }
        value += char;
      }
    };
    stdin.on('data', onData);
  });
}

interface ResolvedCredentials {
  email: string;
  password: string;
  name: string;
}

/**
 * Resolves credentials from the environment, prompting interactively for any
 * missing piece when stdin is a terminal. Fails safely (no DB work) with a
 * clear message when a credential is still missing afterwards.
 */
async function resolveCredentials(): Promise<ResolvedCredentials> {
  const envEmail = process.env[SUPER_ADMIN_EMAIL_ENV];
  const envPassword = process.env[SUPER_ADMIN_PASSWORD_ENV];
  const envName = process.env[SUPER_ADMIN_NAME_ENV]?.trim();
  const name = envName && envName.length > 0 ? envName : DEFAULT_SUPER_ADMIN_NAME;

  let email = envEmail;
  let password = envPassword;

  if (stdin.isTTY === true) {
    if (email === undefined || email.trim().length === 0) {
      email = await prompt('SUPER_ADMIN email: ');
    }
    if (password === undefined || password.trim().length === 0) {
      password = await promptHidden('SUPER_ADMIN password: ');
    }
  }

  if (email === undefined || email.trim().length === 0) {
    throw new Error(
      `Missing SUPER_ADMIN email. Set ${SUPER_ADMIN_EMAIL_ENV} (and ${SUPER_ADMIN_PASSWORD_ENV}), or run interactively in a terminal.`,
    );
  }
  if (password === undefined || password.trim().length === 0) {
    throw new Error(
      `Missing SUPER_ADMIN password. Set ${SUPER_ADMIN_PASSWORD_ENV}, or run interactively in a terminal.`,
    );
  }

  return { email, password, name };
}

async function main(): Promise<void> {
  const { email, password, name } = await resolveCredentials();

  console.log(`[${APP_NAME}] connecting to MongoDB...`);
  await connectToDatabase();
  console.log(`[${APP_NAME}] connected to MongoDB`);

  try {
    const user = await provisionInitialSuperAdmin(email, password, name);
    console.log(`[${APP_NAME}] SUPER_ADMIN provisioned successfully.`);
    console.log(`  email:  ${user.email}`);
    console.log(`  role:   ${user.role}`);
    console.log(`  status: ${user.status}`);
    console.log('Keep the password safe - it can never be recovered or shown again.');
  } finally {
    // Always release the connection, on success and on failure.
    await disconnectFromDatabase();
    console.log(`[${APP_NAME}] MongoDB connection closed`);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[${APP_NAME}] SUPER_ADMIN provisioning failed: ${message}`);
  process.exitCode = EXIT_FAILURE;
});
