import type { ContentIcon, ContentImageSide } from '../constants/content.js';

/**
 * Rich page content for the CMS seed.
 *
 * Every paragraph, figure and call to action below is reproduced from the
 * live smwelfare.charity pages (and the curated client copy where the live
 * page was an empty category archive). This is what the public detail page
 * renders once it is wired to the API, and it is exactly what the admin
 * editor prefills when editing a program or a project.
 *
 * IMAGES: entries reference files in `client/public/images` by name only —
 * the seed uploads them to Cloudinary and stores the resulting URL/publicId
 * on the document, so no URL is ever hardcoded here.
 *
 * KEYING: content is keyed by the page URL slug. Several projects reuse their
 * parent program's page content (the live site reuses the same page for both),
 * so `seedData.ts` points each record at the right key rather than duplicating
 * the copy.
 */

export interface SeedImageRef {
  /** File name inside client/public/images. */
  file: string;
  alt: string;
}

export interface SeedSection {
  kicker?: string;
  title?: string;
  body?: string;
  image?: SeedImageRef;
  imageSide?: ContentImageSide;
}

export interface SeedHighlight {
  icon: ContentIcon;
  title: string;
  description: string;
}

export interface SeedFact {
  icon: ContentIcon;
  label: string;
  value: string;
}

export interface SeedCta {
  title?: string;
  body?: string;
  buttonLabel?: string;
  buttonHref?: string;
}

export interface SeedPageContent {
  /** Hero subtitle shown under the page title. */
  tagline: string;
  cover: SeedImageRef;
  sections: SeedSection[];
  highlights: SeedHighlight[];
  facts: SeedFact[];
  cta: SeedCta;
}

export const PAGE_CONTENT: Record<string, SeedPageContent> = {
  'hunarmand-beti-project': {
    tagline: 'Skilled Girls, A Promise for a Brighter Future!',
    cover: {
      file: 'project-hunarmand-beti.jpg',
      alt: 'Young women learning stitching and tailoring at the Hunarmand Beti Project',
    },
    sections: [
      {
        kicker: 'The challenge',
        title: 'Skilled Girls, A Promise for a Brighter Future!',
        body: 'In Pakistan, nearly 75% of women lack vocational training or practical skills, which is significantly higher than in neighboring countries. This alarming gap not only affects women\u2019s economic independence but also slows down the overall development of the nation. When half the population is left without skills and unable to contribute to the economy, poverty increases, and the economic system weakens. Empowering women with skills is no longer a choice; it is a national need.',
      },
      {
        kicker: 'The centre',
        title: 'Sirat-e-Mustaqeem Vocational Training Center',
        body: 'Under the Sirat-e-Mustaqeem Welfare Trust, the Sirat-e-Mustaqeem Vocational Training Center has been established in Orangi Town, Liaquat Chowk (Karachi). Here, underprivileged girls are being trained in useful skills such as henna application, sewing, and beautician courses, all at affordable fees. These skill-building programs are designed to help young women become self-reliant and earn a respectable livelihood with dignity.',
      },
      {
        kicker: 'Our dream',
        title: 'A skilled daughter becomes a beacon of change',
        body: 'We dream of a Pakistan where every woman has a skill in her hands, where every daughter, sister, and mother is respected, confident, and has a dignified role in society. A skilled daughter can support her family, raise strong future generations, and become a beacon of change. Join hands with us in this mission. Let\u2019s empower more deserving women and girls with skills and build a stronger, self-reliant society together.',
      },
    ],
    highlights: [
      {
        icon: 'paint-brush',
        title: 'Henna application',
        description:
          'Mehndi design and application taught step by step, ready for paid work at weddings and events.',
      },
      {
        icon: 'scissors',
        title: 'Sewing',
        description:
          'Stitching and tailoring on real machines \u2014 from taking measurements to finishing a wearable garment.',
      },
      {
        icon: 'sparkles',
        title: 'Beautician courses',
        description:
          'Salon and beautician skills that let graduates earn from home or join a local salon with confidence.',
      },
    ],
    facts: [
      {
        icon: 'map-pin',
        label: 'Location',
        value: 'Liaquat Chowk, Gulshan-e-Zia, Orangi Town, Karachi.',
      },
      { icon: 'clock', label: 'Timing', value: '12:00 PM to 6:00 PM' },
    ],
    cta: {
      title: "Let's build a stronger, self-reliant society",
      body: 'Join hands with us in this mission. Let\u2019s empower more deserving women and girls with skills and build a stronger, self-reliant society together.',
      buttonLabel: 'Donate now',
      buttonHref: '/donate',
    },
  },

  'free-schooling-system': {
    tagline: "Education is every child's basic right!",
    cover: {
      file: 'project-free-schooling.jpg',
      alt: 'Children studying in a classroom supported by the Free Schooling System',
    },
    sections: [
      {
        kicker: 'The challenge',
        title: "Education is every child's basic right!",
        body: 'According to UNICEF and the Government of Pakistan\u2019s Economic Survey 2024\u20132025, over 25 million children in Pakistan are still deprived of education. The national literacy rate stands at only 61%, which is significantly lower than many other South Asian countries. In such circumstances, providing education is not just a necessity, it is a national responsibility. In response to this crisis, Sirat-e-Mustaqeem Welfare Trust launched a Free Schooling System back in 2018 in the underserved area of Raees Amrohi, Orangi Town, Karachi.',
      },
      {
        kicker: 'Our school',
        title: 'Activity-Based Learning, pre-primary to primary',
        body: 'Currently, our school offers education from pre-primary to primary levels, fully based on an Activity-Based Learning system. We also plan to expand to secondary-level education in the near future, so that these children can continue their academic journey without interruption. To promote cognitive and creative growth, we also offer computer classes, ensuring that students stay aligned with the demands of the modern era. At present, over 170 children are enrolled in our school. These children not only receive classroom education, but are also provided with free stationery, notebooks, school bags, and other educational supplies. Additionally, we organize annual picnics and educational trips to help children learn through observation and real-world experiences.',
      },
      {
        kicker: 'Our promise',
        title: 'We have promised to open the doors of learning',
        body: 'These are the same children who were once kept away from education by poverty, deprivation, and lack of opportunity. But we have made a promise to open the doors of learning for them. Join us in this noble cause so we can reach even more children with the light of education. Because education is the power that can erase the darkness of poverty, ignorance, and hopelessness.',
      },
    ],
    highlights: [
      {
        icon: 'graduation',
        title: '25M+ children',
        description: 'Children in Pakistan deprived of education (UNICEF).',
      },
      {
        icon: 'book-open',
        title: '61% literacy',
        description: 'National literacy rate \u2014 below many South Asian countries.',
      },
      {
        icon: 'academic-cap',
        title: 'Since 2018',
        description: 'Free Schooling System launched in Raees Amrohi, Orangi Town.',
      },
      {
        icon: 'users',
        title: '170+ enrolled',
        description: 'Children currently enrolled in our school.',
      },
    ],
    facts: [
      {
        icon: 'map-pin',
        label: 'Address',
        value: 'Gali No. 11, Raees Amrohi, Sadiqabad, Orangi Town, Karachi.',
      },
      { icon: 'clock', label: 'Levels', value: 'Pre-primary to primary (secondary planned)' },
    ],
    cta: {
      title: "Let's reach even more children with the light of education",
      body: 'Join us in this noble cause so we can reach even more children with the light of education.',
      buttonLabel: 'Donate now',
      buttonHref: '/donate',
    },
  },

  'health-care-services': {
    tagline: 'Your Health, Our Priority',
    cover: {
      file: 'project-health-care.jpg',
      alt: 'Medical camp staff treating patients at a SM Welfare Trust health care service',
    },
    sections: [
      {
        kicker: 'Our healthcare centre',
        title: 'Low-cost treatment for families who cannot afford it',
        body: 'Our healthcare centre offers low-cost OPD services, essential medicines and regular free medical camps for families who cannot afford treatment. Patients are examined by qualified doctors for a nominal fee, and essential medicines are provided free of cost.',
      },
      {
        kicker: 'Supporting services',
        title: 'Ambulance Services and Heat Stroke Camps',
        body: 'Healthcare does not stop at the clinic. Our Ambulance Services transport patients to hospital in a timely and dignified manner where government or private services are limited or unavailable, and our seasonal Heat Stroke Camps provide cold water, wet towels, shade and first aid during peak heat days in Orangi Town.',
      },
    ],
    highlights: [
      {
        icon: 'stethoscope',
        title: 'Low-cost OPD',
        description: 'Doctor consultations at a nominal fee for those who cannot afford private care.',
      },
      {
        icon: 'medical',
        title: 'Free medicines',
        description: 'Essential medicines provided free of cost to patients in need.',
      },
      {
        icon: 'ambulance',
        title: 'Ambulance Services',
        description: 'Timely, dignified transport to hospital \u2014 free for the extremely needy.',
      },
      {
        icon: 'sun',
        title: 'Heat Stroke Camps',
        description: 'Cold water, wet towels and first aid during Orangi Town\u2019s peak heat days.',
      },
    ],
    facts: [
      { icon: 'map-pin', label: 'Location', value: 'Liaquat Chowk, Gulshan-e-Zia, Orangi Town, Karachi.' },
      { icon: 'clock', label: 'Timing', value: '6:00 PM to 11:00 PM' },
    ],
    cta: {
      title: 'Help us keep healthcare within everyone\u2019s reach',
      body: 'Your support keeps the clinic open and medicines free for families who cannot afford treatment.',
      buttonLabel: 'Donate now',
      buttonHref: '/donate',
    },
  },

  'sirat-ul-quran-academy': {
    tagline: 'The Light of Islamic Knowledge, A Guarantee for a Better Generation.',
    cover: {
      file: 'sirat-ul-quran-academy.jpg',
      alt: 'Sirat ul Quran Academy \u2014 children learning the Holy Quran with Tajweed in Orangi Town, Karachi',
    },
    sections: [
      {
        kicker: 'The challenge',
        title: 'When the race for worldly education leaves faith behind',
        body: 'Religious education is the light that guides a person through every stage of life. It\u2019s not just about teaching prayers and rituals, it\u2019s a complete code of life that shapes our character, ethics, dealings, and social behavior. In today\u2019s world, where there is a constant race for worldly education, delivering authentic Islamic education remains our true responsibility. To fulfill this important duty, Sirat-e-Mustaqeem Welfare Trust has launched a remarkable initiative called \u201cSirat-ul-Quran Academy\u201d \u2014 a non-profit welfare institution working on various projects related to education, employment, health, and welfare for the underprivileged segments of society.',
      },
      {
        kicker: 'Our academy',
        title: 'Sirat-ul-Quran Academy',
        body: 'At Sirat-ul-Quran Academy, children are taught the Holy Quran with proper Tajweed. In addition, weekly Islamic lessons, celebrations of Islamic festivals, and special programs based on the Seerat-un-Nabi \u0635\u0644\u06cc \u0627\u0644\u0644\u0647 \u0639\u0644\u06cc\u0647 \u0648\u0633\u0644\u0645 are regularly organized. For women, a dedicated Adult Islamic Education Program is offered, where they learn solutions to everyday life issues through the Quran and Hadith, along with moral and social training. Keeping in view the modern needs of children, the academy also provides basic secular education, enabling them to progress confidently in both religious and worldly fields.',
      },
      {
        kicker: 'Affordable for everyone',
        title: 'Every child can benefit from this light of knowledge',
        body: 'All of this education and training is offered for just a monthly fee of Rs. 50, ensuring that every child can benefit from this light of knowledge. Come forward and make your children part of this beautiful journey of Islamic and moral education.',
      },
    ],
    highlights: [
      {
        icon: 'book-open',
        title: 'Quran with Tajweed',
        description: 'Children are taught the Holy Quran with proper Tajweed.',
      },
      {
        icon: 'star',
        title: 'Weekly Islamic lessons',
        description: 'Weekly Islamic lessons that strengthen faith and understanding.',
      },
      {
        icon: 'sparkles',
        title: 'Festivals & Seerat programs',
        description: 'Islamic festival celebrations and programs based on the Seerat-un-Nabi (\u0635\u0644\u06cc \u0627\u0644\u0644\u0647 \u0639\u0644\u06cc\u0647 \u0648\u0633\u0644\u0645).',
      },
      {
        icon: 'users',
        title: 'Adult Islamic Education',
        description:
          'A dedicated program for women \u2014 everyday life solutions from the Quran and Hadith.',
      },
      {
        icon: 'academic-cap',
        title: 'Basic secular education',
        description: 'Modern education so children progress in both religious and worldly fields.',
      },
    ],
    facts: [
      { icon: 'currency', label: 'Monthly fee', value: 'Just Rs. 50 \u2014 every child can benefit' },
      { icon: 'clock', label: 'Timings', value: '2:00 PM to 5:00 PM' },
      {
        icon: 'map-pin',
        label: 'Location',
        value: 'Liaquat Chowk, Gulshan-e-Zia, Orangi Town, Karachi.',
      },
    ],
    cta: {
      title: 'Make your children part of this beautiful journey',
      body: 'Come forward and make your children part of this beautiful journey of Islamic and moral education.',
      buttonLabel: 'Donate now',
      buttonHref: '/donate',
    },
  },

  'sasta-khana-project': {
    tagline: 'Affordable, hygienic meals for everyone',
    cover: {
      file: 'project-sasta-khana.jpg',
      alt: 'Subsidised daily meals prepared for the Sasta Khana Project kitchen in Orangi Town',
    },
    sections: [
      {
        kicker: 'The challenge',
        title: 'No worker should choose between transport fare and dinner',
        body: 'Daily wage workers and needy families in Orangi Town often struggle to afford basic food. The Sasta Khana Project runs a subsidised kitchen serving freshly cooked, hygienic meals every day so that no worker has to choose between transport fare and dinner.',
      },
      {
        kicker: 'More than a kitchen',
        title: 'Iftaar Dastarkhawan and the Monthly Raashan Support Program',
        body: 'Beyond the kitchen, the project runs the Ramadan Iftaar Dastarkhawan \u2014 daily Iftar gatherings for hundreds of deserving families \u2014 and the Monthly Raashan Support Program, which provides monthly ration packages to around 70 deserving families with dignity and self-respect preserved.',
      },
    ],
    highlights: [
      {
        icon: 'utensils',
        title: 'Subsidised daily meals',
        description: 'Freshly cooked, hygienic meals served every day at affordable rates.',
      },
      {
        icon: 'users',
        title: 'Iftaar Dastarkhawan',
        description: '250 to 300 people join our Iftar every day during Ramadan.',
      },
      {
        icon: 'gift',
        title: 'Monthly Raashan Support',
        description: 'Monthly ration packages for around 70 deserving families.',
      },
      {
        icon: 'hand-heart',
        title: 'Dignity preserved',
        description: 'Support given so families never feel like a burden on society.',
      },
    ],
    facts: [
      { icon: 'map-pin', label: 'Location', value: 'Orangi Town, Karachi' },
      { icon: 'utensils', label: 'Serving', value: 'Freshly cooked meals every day' },
    ],
    cta: {
      title: 'Help us keep every kitchen warm',
      body: 'Your donation becomes a hot meal for a worker, a family, a child.',
      buttonLabel: 'Donate now',
      buttonHref: '/donate',
    },
  },

  'rozgar-project': {
    tagline: 'A Step Towards Self-Reliance!',
    cover: {
      file: 'rozgar-project.jpg',
      alt: 'Rozgar Project \u2014 a beneficiary earning a dignified living from a fruit and vegetable cart',
    },
    sections: [
      {
        kicker: 'The challenge',
        title: 'A large portion of Pakistan is in dire need of employment',
        body: 'Unemployment in Pakistan is becoming more serious with each passing day. According to recent reports, nearly 5.5% of people in the country are unemployed, actively seeking jobs but struggling due to a lack of opportunities. The most affected group is the youth, where the unemployment rate has crossed 11%. These statistics clearly show that a large portion of Pakistan\u2019s population is in dire need of employment, skills, and opportunities. The \u201cRozgar Project\u201d by Sirat-e-Mustaqeem Welfare Trust is a ray of hope for those deserving and hardworking individuals who are unable to earn a living due to lack of resources. Our goal is not just financial aid, but to provide dignified employment that helps people move towards self-dependence.',
      },
      {
        kicker: 'How we create livelihoods',
        title: 'Respectable work, matched to every person',
        body: 'Under this project, we provide individuals with various sources of respectable employment based on their skills, interests, and circumstances. Some people are assisted in starting small businesses such as selling potato chips, while some women are provided with sewing machines so they can earn from home. Many beneficiaries have received fruit or vegetable carts, helping them support their families through hard work. Similarly, those who possess any skill or professional expertise are provided with suitable work opportunities that align with their capabilities, so they can achieve financial independence.',
      },
      {
        kicker: 'Our impact',
        title: 'More than 170 individuals now live respectful lives',
        body: 'Alhamdulillah! So far, Sirat-e-Mustaqeem Welfare Trust has successfully provided employment to more than 170 individuals, who are now living respectful lives and have become an inspiration for others. Join us in this journey of goodness, so we can provide even more dignified jobs to those in need, and together, build a prosperous, self-sufficient, and peaceful society.',
      },
    ],
    highlights: [
      {
        icon: 'briefcase',
        title: 'Small businesses',
        description: 'Assistance in starting small businesses \u2014 such as selling potato chips.',
      },
      {
        icon: 'scissors',
        title: 'Sewing machines',
        description: 'Women are provided with sewing machines so they can earn from home.',
      },
      {
        icon: 'truck',
        title: 'Fruit & vegetable carts',
        description: 'Beneficiaries receive carts to support their families through hard work.',
      },
      {
        icon: 'shield',
        title: 'Skilled work opportunities',
        description: 'Those with a skill are matched to work that fits their capabilities.',
      },
    ],
    facts: [
      { icon: 'users', label: 'Employed so far', value: '170+ individuals' },
      { icon: 'shield', label: 'Youth unemployment', value: '11%+ \u2014 the group most affected' },
    ],
    cta: {
      title: 'Build a prosperous, self-sufficient and peaceful society',
      body: 'Join us in this journey of goodness, so we can provide even more dignified jobs to those in need.',
      buttonLabel: 'Donate now',
      buttonHref: '/donate',
    },
  },

  'marriage-support-program': {
    tagline: "A Dignified Marriage is Every Daughter's Right!",
    cover: {
      file: 'marriage-support.jpg',
      alt: "Marriage Support Program \u2014 a daughter's wedding arranged with dignity by Sirat-e-Mustaqeem Welfare Trust",
    },
    sections: [
      {
        kicker: 'The challenge',
        title: 'When poverty turns a sacred duty into a heavy burden',
        body: 'When a large portion of society is deprived of necessities, even the dreams of happiness can become a heavy burden. According to recent reports by United Nations development experts, nearly 40% of Pakistan\u2019s population lives below the poverty line. In such harsh economic conditions, fulfilling the sacred duty of marriage has become an extremely difficult challenge for countless families. The Marriage Support Program by Sirat-e-Mustaqeem Welfare Trust serves as a ray of hope for such deserving families. By easing this social burden, the program helps them begin a new chapter of life with dignity and respect.',
      },
      {
        kicker: 'Our program',
        title: 'Helping families begin a new chapter with dignity',
        body: 'Many poor parents are unable to bear the basic costs of their daughters\u2019 weddings or arrange even modest dowries. This charitable marriage program assists eligible families by providing essential wedding support, especially focusing on orphan girls whose fathers are no longer alive and whose families are financially incapable of arranging their weddings. We strongly believe that marriage is a sacred blessing and should never become a financial burden. Our mission is to ensure that no daughter\u2019s wedding is delayed just because of poverty.',
      },
      {
        kicker: 'Our impact',
        title: 'Dignified marriages for nearly 15 families\u2019 daughters',
        body: 'Alhamdulillah, with the generous support of our donors and the tireless efforts of our team, Sirat-e-Mustaqeem Welfare Trust has successfully arranged dignified marriages for nearly 15 families\u2019 daughters so far.',
      },
    ],
    highlights: [
      {
        icon: 'sparkles',
        title: 'Essential wedding support',
        description: 'Eligible families are assisted with the essential costs of the wedding.',
      },
      {
        icon: 'users',
        title: 'Focus on orphan girls',
        description:
          'Especially orphan girls whose fathers are no longer alive and whose families cannot afford a wedding.',
      },
      {
        icon: 'hand-heart',
        title: 'Dignity, care and respect',
        description: 'Support given with compassion and honour \u2014 easing a social burden, never adding to it.',
      },
    ],
    facts: [
      {
        icon: 'currency',
        label: 'The burden',
        value: 'Many parents cannot bear even the basic costs of a wedding or a modest dowry.',
      },
      {
        icon: 'users',
        label: 'Who we help',
        value: 'Deserving families \u2014 especially orphan girls whose fathers are no longer alive.',
      },
    ],
    cta: {
      title: 'Help someone begin a new life with dignity',
      body: 'Join us in this noble cause. Your small contribution can help someone begin a new life with dignity.',
      buttonLabel: 'Donate now',
      buttonHref: '/donate',
    },
  },

  'free-eid-shopping': {
    tagline: 'Bringing Eid Joy to Every Home!',
    cover: {
      file: 'free-eid-shopping.jpg',
      alt: 'Free Eid Shopping \u2014 families choosing Eid clothes, shoes and gifts for just Rs. 10',
    },
    sections: [
      {
        kicker: 'The challenge',
        title: 'For many families, Eid feels more like a burden',
        body: 'Eid is not just a religious celebration, it is a festival of happiness, love, and togetherness. New clothes, shiny shoes, jewelry, perfumes, and gifts are desires found in every heart. But sadly, there are faces around us that remain deprived of these joys. For widows, orphaned children, and financially struggling families, Eid can feel more like a burden than a celebration.',
      },
      {
        kicker: 'Our initiative',
        title: 'Complete Eid shopping for just Rs. 10',
        body: 'Feeling this silent pain, Sirat-e-Mustaqeem Welfare Trust launched a heartwarming initiative called \u201cFree Eid Shopping\u201d. Under this program, widows, orphans, and deserving individuals are invited to do their complete Eid shopping for just Rs. 10, preserving their dignity and self-respect, while allowing them to celebrate Eid with pride and joy.',
      },
      {
        kicker: 'A valued guest, not a receiver',
        title: 'Sharing happiness with respect and compassion',
        body: 'This is not merely about distributing items, it is a beautiful experience of sharing happiness with respect and compassion. Eligible women, children, and families walk through a specially arranged shopping space where they can freely choose Eid clothes, shoes, sandals, bangles, jewelry, mehndi (henna), and other essentials just like regular shoppers. Everything is thoughtfully organized to make sure no one feels like a receiver, but rather a valued guest, smiling with real Eid cheer and a heart full of self-worth.',
      },
    ],
    highlights: [
      {
        icon: 'gift',
        title: 'Eid clothes & footwear',
        description: 'Eid clothes, shoes and sandals to choose from freely, just like regular shoppers.',
      },
      {
        icon: 'sparkles',
        title: 'Bangles & jewelry',
        description: 'Bangles, jewelry and accessories that make the day feel like a real celebration.',
      },
      {
        icon: 'heart',
        title: 'Mehndi & essentials',
        description: 'Mehndi (henna) and other essentials to complete every Eid preparation.',
      },
      {
        icon: 'building',
        title: 'A real shopping space',
        description: 'A specially arranged space where eligible families choose for themselves.',
      },
    ],
    facts: [
      {
        icon: 'currency',
        label: 'Complete Eid shopping',
        value: 'For just Rs. 10 \u2014 dignity and self-respect preserved',
      },
      { icon: 'users', label: 'Who is invited', value: 'Widows, orphans and deserving individuals' },
    ],
    cta: {
      title: 'Be the reason someone truly celebrates Eid.',
      body: 'This project is made possible through the support of generous donors like you. Let\u2019s spread Eid joy together.',
      buttonLabel: 'Donate now',
      buttonHref: '/donate',
    },
  },

  'flood-relief-mission': {
    tagline: 'Standing Together in Crisis is True Humanity!',
    cover: {
      file: 'flood-relief-mission.jpg',
      alt: 'Flood Relief Mission \u2014 volunteers delivering rations, tents and water to flood-affected families',
    },
    sections: [
      {
        kicker: 'The challenge',
        title: 'The 2022 floods \u2014 one of Pakistan\u2019s most devastating chapters',
        body: 'The 2022 floods in Pakistan marked one of the most devastating chapters in the country\u2019s history. Torrential rains and overflowing rivers submerged thousands of villages, leaving millions homeless. Crops were destroyed, livestock washed away, and normal life turned into a painful struggle for survival. Remote regions such as South Punjab (Rajanpur), Interior Sindh, and Balochistan (Okari) were among the hardest hit areas where immediate emergency relief was nearly impossible to deliver.',
      },
      {
        kicker: 'Our response',
        title: 'Reaching the neglected communities first',
        body: 'In response to this national crisis, Sirat-e-Mustaqeem Welfare Trust stepped forward and focused on reaching neglected and underserved communities. Our volunteers stood by the flood victims even in the harshest conditions, delivering essential flood relief supplies including food rations, tents, clean drinking water, clothing, and medicines. This was not just a relief effort; it was a true act of loyalty to humanity.',
      },
      {
        kicker: 'Beyond emergency aid',
        title: 'A long-term commitment to rebuild lives',
        body: 'We believe that real service goes beyond temporary assistance. It\u2019s about offering a long-term commitment that helps victims rebuild their lives with dignity and hope. Our mission continues to this day, moving from emergency aid to rehabilitation, skill development, and eventually, self-reliance programs that empower flood-affected families to stand on their feet again. Flood relief in Pakistan is not a one-time response; it\u2019s a continuous journey of recovery, compassion, and community rebuilding.',
      },
    ],
    highlights: [
      { icon: 'utensils', title: 'Food rations', description: 'Essential food rations delivered to families who lost everything.' },
      { icon: 'home', title: 'Tents', description: 'Tents providing shelter where homes were submerged by the floods.' },
      { icon: 'water', title: 'Clean drinking water', description: 'Clean water to prevent disease in the aftermath of the floods.' },
      { icon: 'gift', title: 'Clothing', description: 'Clothing for families left with nothing after the waters rose.' },
      { icon: 'medical', title: 'Medicines', description: 'Medicines for victims in the hardest-to-reach areas.' },
    ],
    facts: [
      {
        icon: 'hand-heart',
        label: 'The crisis',
        value: 'The 2022 floods \u2014 thousands of villages submerged, millions left homeless',
      },
      {
        icon: 'map-pin',
        label: 'Hardest-hit regions',
        value: 'South Punjab (Rajanpur), Interior Sindh and Balochistan (Okari)',
      },
    ],
    cta: {
      title: 'Bring shelter, stability and strength to those still recovering',
      body: 'Join hands with Sirat-e-Mustaqeem Welfare Trust to support disaster victims.',
      buttonLabel: 'Donate now',
      buttonHref: '/donate',
    },
  },

  'home-masjid-renovation': {
    tagline: 'A Safe Roof and a Peaceful Place to Pray!',
    cover: {
      file: 'masjid.jpg',
      alt: 'Home & Masjid Renovation \u2014 a repaired home alongside a renovated mosque in Karachi',
    },
    sections: [
      {
        kicker: 'The challenge',
        title: 'Self-respecting families living under fragile roofs',
        body: 'In a vast and fast-paced city like Karachi, there are countless neighborhoods where hardworking and self-respecting families live under challenging conditions. Areas like Orangi Town are home to many low-income, white-collar households who may never ask for help, but whose homes are in urgent need of repair and restoration. When rains, floods, or the wear of time strike these fragile houses, life becomes even more difficult.',
      },
      {
        kicker: 'Our project',
        title: 'Repairing homes and renovating mosques',
        body: 'To address this serious yet often overlooked issue, Sirat-e-Mustaqeem Welfare Trust initiated the \u201cHome and Mosque Renovation Project.\u201d This blessed initiative focuses on repairing and rebuilding damaged or flood-affected homes, ensuring that families can live under a safe, secure, and dignified roof. Respecting the self-esteem of white-collar families, the support is provided quietly and respectfully, without compromising their pride. Alongside home restoration, the project also includes renovation and maintenance of mosques, aiming to provide a clean, peaceful, and spiritually uplifting environment for worshippers.',
      },
      {
        kicker: 'Our impact',
        title: 'Over 12 homes rebuilt in Qaim Khani, Baldia Town',
        body: 'Alhamdulillah! In the Qaim Khani area of Baldia Town, we\u2019ve already rebuilt over 12 homes, transforming unsafe, crumbling shelters into secure, grateful homes filled with peace and protection. Let\u2019s rebuild more than just walls, let\u2019s rebuild lives.',
      },
    ],
    highlights: [
      {
        icon: 'home',
        title: 'Home repair & rebuilding',
        description: 'Damaged homes are repaired and rebuilt so families live under a safe, dignified roof.',
      },
      {
        icon: 'hand-heart',
        title: 'Quiet, respectful support',
        description: 'Given peacefully and respectfully, without compromising the pride of families.',
      },
      {
        icon: 'mosque',
        title: 'Mosque renovation',
        description: 'Renovation and maintenance of mosques for a clean and peaceful praying environment.',
      },
      {
        icon: 'sparkles',
        title: 'Restoring dignity at home',
        description: 'Unsafe, crumbling shelters become secure homes filled with peace and protection.',
      },
    ],
    facts: [
      { icon: 'home', label: 'Homes rebuilt', value: 'Over 12 \u2014 and counting' },
      { icon: 'map-pin', label: 'Where', value: 'Qaim Khani area, Baldia Town, Karachi' },
    ],
    cta: {
      title: 'Let\u2019s rebuild more than just walls, let\u2019s rebuild lives',
      body: 'Your small donation can offer a roof to a struggling family or provide a tranquil prayer space for worshippers.',
      buttonLabel: 'Donate now',
      buttonHref: '/donate',
    },
  },

  'qurbani-barae-waqaf': {
    tagline: 'Waqf Qurbani for the Deserving.',
    cover: {
      file: 'qurbani-barae-waqaf.jpg',
      alt: 'Qurbani Barae Waqaf \u2014 Waqf Qurbani meat packed and delivered door-to-door',
    },
    sections: [
      {
        kicker: 'The challenge',
        title: 'Countless people long for a blessing as basic as meat',
        body: 'Qurbani (sacrifice) is one of the greatest acts of worship in Islam. It teaches us the values of selflessness, compassion, and devotion. On this blessed occasion of Eid-ul-Adha, while we celebrate happiness in our homes, countless people around us are longing for a blessing as basic as meat, which they haven\u2019t been able to eat for years. This is especially true for those living in informal settlements, rural villages, and underprivileged areas, where poverty keeps kitchen stoves cold and families hungry.',
      },
      {
        kicker: 'Our service',
        title: 'Waqf Qurbani for the Deserving',
        body: 'To support such deserving individuals, Sirat-e-Mustaqeem Welfare Trust has launched a purposeful and dignified service called \u201cWaqf Qurbani for the Deserving.\u201d The primary goal is to allow generous people to donate financially for Qurbani, and then ensure that 100% of the meat is delivered to those who truly deserve it. In Orangi Town, a densely populated area filled with educated, hardworking, and talented individuals, volunteers have worked in an organized manner, delivering meat door-to-door, reaching the most needy families.',
      },
      {
        kicker: 'Our mission',
        title: 'Include the hearts left behind in the joys of Eid',
        body: 'We do this not for show or fame, but purely for the pleasure of Allah and with the spirit of serving humanity, regardless of race, religion, or background. Our mission is not just to distribute meat, but to include the hearts that have been left behind in the joys of Eid. We believe every person in society deserves to live with dignity, equality, and love.',
      },
    ],
    highlights: [
      { icon: 'currency', title: 'Donate for Qurbani', description: 'Generous people donate financially \u2014 the Trust handles the rest.' },
      { icon: 'heart', title: '100% of the meat delivered', description: 'Every part of the meat reaches those who truly deserve it.' },
      { icon: 'truck', title: 'Door-to-door delivery', description: 'Volunteers reach the most needy families in Orangi Town.' },
      { icon: 'hand-heart', title: 'For the pleasure of Allah', description: 'Not for show or fame \u2014 serving humanity regardless of background.' },
    ],
    facts: [
      { icon: 'heart', label: 'Every share', value: '100% of the meat is delivered to those who truly deserve it' },
      { icon: 'map-pin', label: 'Where', value: 'Orangi Town \u2014 delivered door-to-door' },
    ],
    cta: {
      title: 'Let your sacrifice reach hearts waiting for your kindness',
      body: 'Join us in this noble cause of Waqf Qurbani.',
      buttonLabel: 'Donate now',
      buttonHref: '/donate',
    },
  },

  'tree-for-tomorrow-plantation-compaign': {
    tagline: 'Green Earth, Healthy Life.',
    cover: {
      file: 'tree-for-tomorrow.jpg',
      alt: 'Tree for Tomorrow plantation campaign \u2014 saplings planted by volunteers in Karachi',
    },
    sections: [
      {
        kicker: 'The challenge',
        title: 'Planting trees is no longer a choice \u2014 it is a responsibility',
        body: '\u201cWhoever plants a tree and looks after it until it bears fruit, it becomes a Sadaqah Jariyah for him.\u201d (Musnad Ahmad) Islam not only teaches us acts of worship but also encourages us to beautify the earth, love nature, and protect the environment. Today, as the world faces climate change, environmental pollution, and rising heat, planting trees has become not just an act but a responsibility. Karachi\u2019s vast and densely populated area Orangi Town experiences intense heat every year, with temperatures exceeding 40\u00b0C. Unfortunately, there is a severe shortage of trees in this area.',
      },
      {
        kicker: 'Our campaign',
        title: 'More than 1,000 trees planted since 2020',
        body: 'Sensing this urgent need, Sirat-e-Mustaqeem Welfare Trust launched its Plantation Campaign in 2020. Over the past five years, we have planted more than 1,000 trees, laying the foundation for a greener environment and sending a message of hope for future generations. Every plant is a new beginning\u2014a shade that can protect the days to come. Trees have been planted in various areas of Karachi, especially Altaf Nagar, Khairabad, Safed Chowk, Haq Bahoo Chowk, Muhajir Chowk, Disco Mor, Aman Chowk, Sector 14-C, Bismillah Chowk, Islam Chowk, Liaquat Chowk, North Karachi and several important locations in North Nazimabad.',
      },
      {
        kicker: 'Sadaqah Jariyah',
        title: 'A way to gain the pleasure of Allah',
        body: 'Tree plantation is not just a campaign; it is a way to gain the pleasure of Allah. It is an action that can bring benefit both in this world and in the Hereafter. Come! Join us in this journey of Sadaqah Jariyah so we can work together to make our city greener and more beautiful.',
      },
    ],
    highlights: [
      { icon: 'tree', title: 'Planting since 2020', description: 'The Plantation Campaign answers Orangi Town\u2019s urgent need for trees.' },
      { icon: 'leaf', title: 'More than 1,000 trees', description: 'Over five years of plantation work across Karachi.' },
      { icon: 'sparkles', title: 'A shade for the days to come', description: 'Every plant is a new beginning \u2014 hope for future generations.' },
    ],
    facts: [
      { icon: 'tree', label: 'Trees planted', value: 'More than 1,000 since 2020' },
      { icon: 'map-pin', label: 'Where', value: 'Altaf Nagar, Khairabad, Liaquat Chowk, North Karachi, North Nazimabad and more' },
    ],
    cta: {
      title: 'Join this journey of Sadaqah Jariyah',
      body: 'Work with us to make our city greener and more beautiful.',
      buttonLabel: 'Donate now',
      buttonHref: '/donate',
    },
  },

  'winter-relief': {
    tagline: 'Warmth for families during the cold season.',
    cover: {
      file: 'winter-relief.jpg',
      alt: 'Winter Relief \u2014 blankets and warm clothing distributed to families facing the cold season',
    },
    sections: [
      {
        kicker: 'The need',
        title: 'Facing the cold season without warmth',
        body: 'Winter clothing and relief for families during the cold season. Winter Relief 2025, in collaboration with Alamgir Welfare Trust, brings warm clothing, blankets and seasonal support to families facing the harsh cold season.',
      },
      {
        kicker: 'In collaboration',
        title: 'With Alamgir Welfare Trust',
        body: 'Together with Alamgir Welfare Trust, Sirat-e-Mustaqeem Welfare Trust delivers warm clothing, blankets and timely seasonal support to families who cannot afford protection from the cold.',
      },
    ],
    highlights: [
      { icon: 'snowflake', title: 'Blankets', description: 'Blankets to keep families warm through the coldest months.' },
      { icon: 'gift', title: 'Warm clothing', description: 'Warm clothing for families who cannot afford protection from the cold.' },
      { icon: 'sparkles', title: 'Seasonal support', description: 'Timely support while the harsh cold season lasts.' },
    ],
    facts: [
      { icon: 'hand-heart', label: 'In collaboration with', value: 'Alamgir Welfare Trust' },
      { icon: 'snowflake', label: 'Season', value: 'Winter 2025 \u2014 blankets, warm clothing and relief' },
    ],
    cta: {
      title: 'Help a family stay warm this winter',
      body: 'Your donation becomes a blanket, a warm coat, a night of comfort for a family in the cold.',
      buttonLabel: 'Donate now',
      buttonHref: '/donate',
    },
  },

  'ambulance-services': {
    tagline: 'Every Breath is Precious!',
    cover: {
      file: 'ambulance-banner.jpg',
      alt: 'Ambulance Services banner \u2014 Sirat-e-Mustaqeem Welfare Trust',
    },
    sections: [
      {
        kicker: 'The challenge',
        title: 'Dozens lose their lives because an ambulance arrives too late',
        body: 'In a large city like Karachi, where modern hospitals and medical facilities are available in some areas, there are still densely populated and underprivileged areas like Orangi Town, where thousands of people are deprived of timely medical treatment. Research and local observations reveal that in these areas, dozens of patients lose their lives simply because an ambulance fails to arrive on time or there\u2019s no way to get to the hospital quickly. In such situations, immediate medical assistance and safe transportation can mean the difference between life and death.',
      },
      {
        kicker: 'Our service',
        title: 'Timely and dignified transport to hospital',
        body: 'Keeping this basic human need in mind, Sirat-e-Mustaqeem Welfare Trust launched its Ambulance Service, specifically operating in areas where government or private ambulance services are either limited or completely unavailable. Our goal is to ensure that every person in need is transported to the hospital in a timely and dignified manner. Under this service, we charge only the necessary minimal expenses, and that too only from those who can afford it. For the extremely needy and poor, this service is provided completely free of cost (Fi Sabeelillah).',
      },
      {
        kicker: 'Our fleet',
        title: 'Expanding a life-saving service',
        body: 'Currently, Sirat-e-Mustaqeem operates with only two ambulances, and we aim to expand this life-saving service to more areas so that more lives can be saved. We earnestly request your prayers, support, and donations to help us continue and grow this noble mission.',
      },
    ],
    highlights: [
      { icon: 'ambulance', title: '2 ambulances in service', description: 'Operating where government or private services are limited or unavailable.' },
      { icon: 'heart', title: 'Free for the extremely needy', description: 'Provided completely free of cost \u2014 Fi Sabeelillah.' },
      { icon: 'currency', title: 'Minimal expenses', description: 'Only necessary minimal expenses, and only from those who can afford.' },
      { icon: 'map-pin', title: 'Orangi Town', description: 'Serving the areas where timely medical transport is missing.' },
    ],
    facts: [
      { icon: 'ambulance', label: 'Fleet', value: '2 ambulances currently in service' },
      { icon: 'heart', label: 'Charging', value: 'Free for the extremely needy \u2014 minimal expenses otherwise' },
    ],
    cta: {
      title: 'Saving one life is like saving all of humanity',
      body: 'We earnestly request your prayers, support, and donations to help us continue and grow this noble mission.',
      buttonLabel: 'Donate now',
      buttonHref: '/donate',
    },
  },

  'heat-stroke-camp': {
    tagline: "Be the Shade, Be Someone's Breath of Life!",
    cover: {
      file: 'heat-stroke-camp.jpg',
      alt: 'Heat Stroke Camp \u2014 cold water and first aid in Orangi Town, Karachi',
    },
    sections: [
      {
        kicker: 'The challenge',
        title: 'When the summer heat becomes unbearable',
        body: 'In a bustling and sprawling city like Karachi, when the sun blazes in full force and the summer heat becomes unbearable, even the fastest pace of life comes to a halt. Orangi Town, one of the city\u2019s largest and most diverse areas, is home to people from varying economic and social backgrounds. While some enjoy full access to urban amenities, there are still neighborhoods where clean drinking water, shaded areas, and even basic first aid remain out of reach. During such extreme weather, laborers, pedestrians, elderly citizens, and small children are directly exposed to the sun\u2019s wrath, making them vulnerable to life-threatening heatstroke and dehydration.',
      },
      {
        kicker: 'Our camps',
        title: 'Heatstroke Relief Camps in Orangi Town\u2019s critical zones',
        body: 'Recognizing these urgent needs, Sirat-e-Mustaqeem Welfare Trust organizes \u201cHeatstroke Relief Camps\u201d every summer during peak heat days. These camps are set up in critical zones of Orangi Town, including busy intersections, major bus stops, and crowded market areas where the sun hits hardest and facilities are scarce. At these camps, passersby, workers, women, children, and the elderly are offered free cold drinking water, refreshing beverages, wet towels, cloth to cover their heads, and immediate first aid.',
      },
      {
        kicker: 'A life-saving mission',
        title: 'No one should lose their life for want of water or shade',
        body: 'This initiative isn\u2019t just about temporary relief, it\u2019s a life-saving mission. Sometimes, a cold bottle of water, a wet towel, or a piece of cloth to shield from the sun can mean the difference between life and death. Sirat-e-Mustaqeem\u2019s goal is simple yet vital: no one should lose their life just because they couldn\u2019t find water or shade in time. If you wish to be the reason someone finds shade in this brutal heat, join hands with us. Your donation could become someone\u2019s source of life, comfort, and survival.',
      },
    ],
    highlights: [
      { icon: 'water', title: 'Free cold drinking water', description: 'Chilled drinking water handed to passersby to beat the heat.' },
      { icon: 'sun', title: 'Refreshing beverages', description: 'Cool drinks that help the body recover from the blazing sun.' },
      { icon: 'sparkles', title: 'Wet towels', description: 'Wet towels for instant relief from heat and exhaustion.' },
      { icon: 'shield', title: 'Cloth to cover heads', description: 'Cloth to shield heads from the sun while out on the road.' },
      { icon: 'medical', title: 'Immediate first aid', description: 'First aid for heat exhaustion at the camp itself.' },
    ],
    facts: [
      { icon: 'clock', label: 'When', value: 'Every summer, during peak heat days' },
      {
        icon: 'map-pin',
        label: 'Where',
        value: 'Critical zones of Orangi Town \u2014 busy intersections, bus stops and crowded markets',
      },
    ],
    cta: {
      title: 'Be the shade, be someone\u2019s breath of life',
      body: 'If you wish to be the reason someone finds shade in this brutal heat, join hands with us.',
      buttonLabel: 'Donate now',
      buttonHref: '/donate',
    },
  },

  'iftaar-dastarkhawan': {
    tagline: 'Ramadan Iftar Dastarkhawan',
    cover: {
      file: 'iftaar-dastarkhawan.jpg',
      alt: 'Ramadan Iftar Dastarkhawan \u2014 daily Iftar gatherings for hundreds of deserving families',
    },
    sections: [
      {
        kicker: 'Our iftar',
        title: 'Daily Iftar gatherings for hundreds of families',
        body: 'Sirat-e-Mustaqeem Welfare Trust is hosting daily Iftar gatherings for hundreds of deserving families. Every day, 250 to 300 people join our Iftar, sharing moments of spiritual peace and community togetherness.',
      },
    ],
    highlights: [
      { icon: 'users', title: '250\u2013300 people daily', description: 'People join our Iftar every day during Ramadan.' },
      { icon: 'utensils', title: 'Hundreds of families', description: 'Deserving families hosted for Iftar.' },
      { icon: 'sparkles', title: 'Daily gatherings', description: 'Iftar gatherings held every day through Ramadan.' },
    ],
    facts: [
      { icon: 'users', label: 'Daily turnout', value: '250 to 300 people' },
      { icon: 'utensils', label: 'Families hosted', value: 'Hundreds of deserving families' },
    ],
    cta: {
      title: 'Share the blessings of Ramadan',
      body: 'Your donation becomes an Iftar meal for a family breaking their fast with dignity.',
      buttonLabel: 'Donate now',
      buttonHref: '/donate',
    },
  },

  'monthly-raashan-support-program': {
    tagline: 'True Help is What Opens the Doors to Self-Reliance!',
    cover: {
      file: 'monthly-raashan-support.jpg',
      alt: 'Monthly Raashan Support Program \u2014 ration packages distributed to deserving families',
    },
    sections: [
      {
        kicker: 'The challenge',
        title: 'Families crushed by inflation, illness and unemployment',
        body: 'Orangi Town in Karachi, one of the largest densely populated areas in Asia, is home to people from all walks of life. While some live comfortably, many others struggle severely to meet their daily expenses. Rising inflation, illness, and unemployment have taken away the happiness of countless households. To support these families under economic pressure, Sirat-e-Mustaqeem Welfare Trust launched the \u201cMonthly Rashan Program,\u201d a meaningful and dignified effort that goes beyond short-term relief to offer sustainable support.',
      },
      {
        kicker: 'Our program',
        title: 'Around 70 families receive monthly ration packages',
        body: 'Through this platform, around 70 deserving families receive monthly ration packages, including widows, the sick, and extremely poor individuals. Alongside the ration, their dignity and self-respect are carefully preserved so they never feel like a burden on society. Our aim is not just temporary aid but to guide these families toward financial independence.',
      },
      {
        kicker: 'To self-reliance',
        title: 'From food support to a source of income',
        body: 'After a few months, the same beneficiaries are provided with employment resources such as carts, stalls, sewing machines, or financial assistance for small businesses. This initiative is not limited to just food support. It is a comprehensive program, the first step toward poverty eradication and a life of dignity. Our mission is not just to feed the hungry, but to empower them for life.',
      },
    ],
    highlights: [
      { icon: 'gift', title: 'Monthly ration packages', description: 'Around 70 deserving families receive a full ration package every month.' },
      { icon: 'heart', title: 'Widows', description: 'Widows who carry their households alone are supported with dignity.' },
      { icon: 'users', title: 'The sick', description: 'Families set back by illness keep food on the table while they recover.' },
      { icon: 'currency', title: 'Extremely poor individuals', description: 'Those under the harshest economic pressure are reached first.' },
      { icon: 'truck', title: 'Carts and stalls', description: 'A pushcart or stall becomes a daily source of halal income.' },
      { icon: 'scissors', title: 'Sewing machines', description: 'A sewing machine turns a skill into steady work from home.' },
      { icon: 'briefcase', title: 'Small-business support', description: 'Financial assistance helps a family start a small business.' },
    ],
    facts: [
      { icon: 'users', label: 'Families reached', value: 'Around 70 deserving families \u2014 every month' },
      { icon: 'heart', label: 'Who is helped', value: 'Widows, the sick and extremely poor individuals' },
      { icon: 'map-pin', label: 'Where', value: 'Orangi Town, Karachi' },
      { icon: 'briefcase', label: 'The next step', value: 'Employment resources for the same beneficiaries' },
    ],
    cta: {
      title: 'Your small donation can light up someone\u2019s kitchen',
      body: 'Join hands with Sirat-e-Mustaqeem Welfare Trust to make this mission more impactful with your generous support.',
      buttonLabel: 'Donate now',
      buttonHref: '/donate',
    },
  },
};
