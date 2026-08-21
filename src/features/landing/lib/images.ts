const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

/** Editorial photography — couples and portraits, not wedding-catalog poses. */
export const editorial = {
  hero: {
    src: u("photo-1514846528774-8de9d4a07023", 2400),
    alt: "A couple walking together outdoors",
  },
  conversation: {
    src: u("photo-1667290942551-3743113d22a4", 1600),
    alt: "Two people walking a quiet path",
  },
  quiet: {
    src: u("photo-1672919404810-2faba0549ddc", 1600),
    alt: "A shared walk through trees",
  },
  city: {
    src: u("photo-1759661659302-63af620677c4", 1600),
    alt: "A couple walking near a harbour garden",
  },
  you: {
    src: u("photo-1579451742069-2df7ad133328", 800),
    alt: "Illustrative portrait",
  },
  partner: {
    src: u("photo-1601573264089-a394270c4323", 800),
    alt: "Illustrative portrait",
  },
  profiles: [
    {
      src: u("photo-1601573264089-a394270c4323", 900),
      name: "Aarav",
      age: 29,
      city: "Mumbai",
      profession: "Product design",
      headline: "Wants a household that is calm, curious, and close to family.",
      score: 94,
    },
    {
      src: u("photo-1487412720507-e7ab37603c6f", 900),
      name: "Meera",
      age: 27,
      city: "Pune",
      profession: "Architecture",
      headline: "Building a life that can hold work, travel, and parents in the same week.",
      score: 91,
    },
    {
      src: u("photo-1758883425480-7f6309f983d5", 900),
      name: "Sana",
      age: 30,
      city: "London",
      profession: "Research",
      headline: "Looking for someone who takes conversation as seriously as ambition.",
      score: 89,
    },
    {
      src: u("photo-1676374024436-17a9c2f4d7d1", 900),
      name: "Kabir",
      age: 32,
      city: "Singapore",
      profession: "Strategy",
      headline: "Open to relocation if the values and the timing both make sense.",
      score: 92,
    },
  ],
  vedic: {
    sky: {
      src: u("photo-1475274047050-1d0c0975c63e", 1400),
      alt: "Star field in a clear night sky",
    },
    milkyWay: {
      src: u("photo-1773760008651-2ba4060dfddf", 1400),
      alt: "The Milky Way above a dark landscape",
    },
    moon: {
      src: u("photo-1507502707541-f369a3b18502", 1400),
      alt: "The Moon in a night sky",
    },
    horizon: {
      src: u("photo-1465101162946-4377e57745c3", 1400),
      alt: "Galaxy over a mountain horizon",
    },
    lake: {
      src: u("photo-1766044531659-a4798add094a", 1400),
      alt: "Stars reflected over still water",
    },
  },
} as const;
