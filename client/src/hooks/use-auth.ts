import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "@/providers/auth-provider";

/**
 * Access the current authentication state and methods.
 *
 * Must be used inside an `<AuthProvider>`.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
