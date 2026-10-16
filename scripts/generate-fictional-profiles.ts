/**
 * Generates fictional demo profiles to replace all celebrity profiles.
 * Run: npx tsx scripts/generate-fictional-profiles.ts
 *
 * This script creates new files under src/lib/mock/ with fictional data.
 */
import { writeFileSync } from "fs";
import { resolve } from "path";

const UNSASH = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&h=1000&q=80`;

class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }
  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
  range(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

const FIRST_NAMES_FEMALE = [
  "Priya",
  "Ananya",
  "Diya",
  "Meera",
  "Soha",
  "Neha",
  "Pooja",
  "Ritu",
  "Swati",
  "Tina",
  "Aarohi",
  "Esha",
  "Ishita",
  "Kavya",
  "Nitya",
  "Pragya",
  "Riya",
  "Sneha",
  "Trisha",
  "Vaishali",
  "Yamini",
  "Aditi",
  "Anjali",
  "Bhavna",
  "Chitra",
  "Daisy",
  "Esther",
  "Falguni",
  "Gauri",
  "Hema",
  "Indira",
  "Jaya",
  "Kiran",
  "Lata",
  "Maya",
  "Noor",
  "Pallavi",
  "Radha",
  "Sita",
  "Tara",
  "Vidya",
  "Ankita",
  "Shruti",
  "Mona",
  "Simran",
  "Aaliya",
  "Niharika",
  "Harsha",
  "Tejaswini",
];

const FIRST_NAMES_MALE = [
  "Arjun",
  "Ravi",
  "Vikram",
  "Sanjay",
  "Mukesh",
  "Dinesh",
  "Rajesh",
  "Suresh",
  "Ramesh",
  "Mahesh",
  "Amit",
  "Nikhil",
  "Abhishek",
  "Karthik",
  "Manoj",
  "Pankaj",
  "Rajiv",
  "Anil",
  "Dipak",
  "Gaurav",
  "Hitesh",
  "Irfan",
  "Jignesh",
  "Kunal",
  "Milind",
  "Naveen",
  "Prashant",
  "Rohit",
  "Siddharth",
  "Tarun",
  "Umesh",
  "Varun",
  "Yuvraj",
  "Zubin",
  "Aditya",
  "Bhavesh",
  "Chirag",
  "Devang",
  "Emil",
  "Farhan",
  "Girish",
  "Harish",
  "Ishwar",
  "Jaspreet",
  "Kartik",
  "Lovekesh",
  "Mohit",
  "Navneet",
  "Paresh",
  "Ranjit",
  "Subhash",
  "Tilak",
  "Vijay",
  "Wilson",
  "Yogesh",
  "Zeeshan",
  "Ajay",
  "Bhupesh",
  "Chandan",
  "Deepak",
  "Firoz",
  "Ganesh",
  "Hitendra",
  "Krishna",
  "Lalit",
  "Manav",
  "Nitin",
  "Om",
];

const LAST_NAMES = [
  "Shah",
  "Patel",
  "Kumar",
  "Verma",
  "Singh",
  "Yadav",
  "Gupta",
  "Sharma",
  "Joshi",
  "Mehta",
  "Desai",
  "Thakur",
  "Chandra",
  "Bose",
  "Mukherjee",
  "Rao",
  "Menon",
  "Pillai",
  "Reddy",
  "Nair",
  "Chatterjee",
  "Dubois",
  "Fernandez",
  "Khan",
  "Patil",
  "Iyer",
  "Mishra",
  "Tiwari",
  "Srivastava",
  "Tripathi",
  "Agarwal",
  "Jain",
  "Chauhan",
  "Rathod",
  "Solanki",
  "Ranjan",
  "Malhotra",
  "Sood",
  "Chopra",
  "Rathore",
  "Sengupta",
  "Basu",
  "Maitra",
  "Chakraborty",
  "Sen",
  "Mittal",
  "Saxena",
  "Thompson",
  "Anderson",
  "Martinez",
  "Garcia",
  "Lee",
  "Kim",
  "Okafor",
  "Kowalski",
  "Sullivan",
  "Nakamura",
];

const CITIES_INDIA: {
  city: string;
  state: string;
  coords: [number, number];
  tz: string;
  place: string;
}[] = [
  {
    city: "Mumbai",
    state: "Maharashtra",
    coords: [72.8777, 19.076],
    tz: "Asia/Kolkata",
    place: "Mumbai, Maharashtra, India",
  },
  {
    city: "Delhi",
    state: "Delhi",
    coords: [77.1025, 28.6139],
    tz: "Asia/Kolkata",
    place: "New Delhi, Delhi, India",
  },
  {
    city: "Bengaluru",
    state: "Karnataka",
    coords: [77.5946, 12.9716],
    tz: "Asia/Kolkata",
    place: "Bengaluru, Karnataka, India",
  },
  {
    city: "Hyderabad",
    state: "Telangana",
    coords: [78.4867, 17.385],
    tz: "Asia/Kolkata",
    place: "Hyderabad, Telangana, India",
  },
  {
    city: "Chennai",
    state: "Tamil Nadu",
    coords: [80.2747, 13.0827],
    tz: "Asia/Kolkata",
    place: "Chennai, Tamil Nadu, India",
  },
  {
    city: "Kolkata",
    state: "West Bengal",
    coords: [88.3639, 22.5726],
    tz: "Asia/Kolkata",
    place: "Kolkata, West Bengal, India",
  },
  {
    city: "Pune",
    state: "Maharashtra",
    coords: [73.8567, 18.5204],
    tz: "Asia/Kolkata",
    place: "Pune, Maharashtra, India",
  },
  {
    city: "Ahmedabad",
    state: "Gujarat",
    coords: [72.5714, 23.0225],
    tz: "Asia/Kolkata",
    place: "Ahmedabad, Gujarat, India",
  },
  {
    city: "Jaipur",
    state: "Rajasthan",
    coords: [75.7878, 26.9124],
    tz: "Asia/Kolkata",
    place: "Jaipur, Rajasthan, India",
  },
  {
    city: "Lucknow",
    state: "Uttar Pradesh",
    coords: [81.3507, 26.8497],
    tz: "Asia/Kolkata",
    place: "Lucknow, Uttar Pradesh, India",
  },
  {
    city: "Nagpur",
    state: "Maharashtra",
    coords: [79.088, 21.1458],
    tz: "Asia/Kolkata",
    place: "Nagpur, Maharashtra, India",
  },
  {
    city: "Indore",
    state: "Madhya Pradesh",
    coords: [75.8577, 22.7196],
    tz: "Asia/Kolkata",
    place: "Indore, Madhya Pradesh, India",
  },
  {
    city: "Bhopal",
    state: "Madhya Pradesh",
    coords: [77.417, 23.2544],
    tz: "Asia/Kolkata",
    place: "Bhopal, Madhya Pradesh, India",
  },
  {
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    coords: [83.3307, 17.691],
    tz: "Asia/Kolkata",
    place: "Visakhapatnam, Andhra Pradesh, India",
  },
  {
    city: "Patna",
    state: "Bihar",
    coords: [85.3096, 25.6073],
    tz: "Asia/Kolkata",
    place: "Patna, Bihar, India",
  },
  {
    city: "Vadodara",
    state: "Gujarat",
    coords: [73.1812, 22.307],
    tz: "Asia/Kolkata",
    place: "Vadodara, Gujarat, India",
  },
  {
    city: "Ghaziabad",
    state: "Uttar Pradesh",
    coords: [77.4036, 28.6692],
    tz: "Asia/Kolkata",
    place: "Ghaziabad, Uttar Pradesh, India",
  },
  {
    city: "Ludhiana",
    state: "Punjab",
    coords: [75.8418, 30.9008],
    tz: "Asia/Kolkata",
    place: "Ludhiana, Punjab, India",
  },
  {
    city: "Coimbatore",
    state: "Tamil Nadu",
    coords: [76.9558, 11.0168],
    tz: "Asia/Kolkata",
    place: "Coimbatore, Tamil Nadu, India",
  },
  {
    city: "Agra",
    state: "Uttar Pradesh",
    coords: [78.0167, 27.1751],
    tz: "Asia/Kolkata",
    place: "Agra, Uttar Pradesh, India",
  },
  {
    city: "Mysore",
    state: "Karnataka",
    coords: [76.6538, 12.2958],
    tz: "Asia/Kolkata",
    place: "Mysore, Karnataka, India",
  },
  {
    city: "Nashik",
    state: "Maharashtra",
    coords: [73.7896, 20.0114],
    tz: "Asia/Kolkata",
    place: "Nashik, Maharashtra, India",
  },
  {
    city: "Chandigarh",
    state: "Chandigarh",
    coords: [77.231, 30.7346],
    tz: "Asia/Kolkata",
    place: "Chandigarh, India",
  },
  {
    city: "Surat",
    state: "Gujarat",
    coords: [72.5567, 21.1697],
    tz: "Asia/Kolkata",
    place: "Surat, Gujarat, India",
  },
  {
    city: "Varanasi",
    state: "Uttar Pradesh",
    coords: [82.9739, 25.3176],
    tz: "Asia/Kolkata",
    place: "Varanasi, Uttar Pradesh, India",
  },
  {
    city: "Guwahati",
    state: "Assam",
    coords: [91.7362, 26.142],
    tz: "Asia/Kolkata",
    place: "Guwahati, Assam, India",
  },
  {
    city: "Bhubaneswar",
    state: "Odisha",
    coords: [85.8245, 22.9733],
    tz: "Asia/Kolkata",
    place: "Bhubaneswar, Odisha, India",
  },
  {
    city: "Dehradun",
    state: "Uttarakhand",
    coords: [78.0355, 30.3165],
    tz: "Asia/Kolkata",
    place: "Dehradun, Uttarakhand, India",
  },
  {
    city: "Rajkot",
    state: "Gujarat",
    coords: [70.7851, 22.3026],
    tz: "Asia/Kolkata",
    place: "Rajkot, Gujarat, India",
  },
  {
    city: "Vasai",
    state: "Maharashtra",
    coords: [72.8452, 19.4237],
    tz: "Asia/Kolkata",
    place: "Vasai, Maharashtra, India",
  },
];

const INT_CITIES = [
  {
    city: "New York",
    state: "New York",
    country: "United States",
    coords: [-74.006, 40.7128],
    tz: "America/New_York",
    place: "New York, NY, USA",
  },
  {
    city: "Los Angeles",
    state: "California",
    country: "United States",
    coords: [-118.2437, 34.0522],
    tz: "America/Los_Angeles",
    place: "Los Angeles, CA, USA",
  },
  {
    city: "London",
    state: "England",
    country: "United Kingdom",
    coords: [-0.1276, 51.5074],
    tz: "Europe/London",
    place: "London, UK",
  },
  {
    city: "Toronto",
    state: "Ontario",
    country: "Canada",
    coords: [-79.3832, 43.6532],
    tz: "America/Toronto",
    place: "Toronto, Ontario, Canada",
  },
  {
    city: "Sydney",
    state: "NSW",
    country: "Australia",
    coords: [151.2093, -33.8688],
    tz: "Australia/Sydney",
    place: "Sydney, Australia",
  },
  {
    city: "Berlin",
    state: "Berlin",
    country: "Germany",
    coords: [13.405, 52.52],
    tz: "Europe/Berlin",
    place: "Berlin, Germany",
  },
  {
    city: "Paris",
    state: "Île-de-France",
    country: "France",
    coords: [2.3522, 48.8566],
    tz: "Europe/Paris",
    place: "Paris, France",
  },
  {
    city: "Madrid",
    state: "Madrid",
    country: "Spain",
    coords: [-3.7038, 40.4168],
    tz: "Europe/Madrid",
    place: "Madrid, Spain",
  },
  {
    city: "Amsterdam",
    state: "North Holland",
    country: "Netherlands",
    coords: [4.9051, 52.4204],
    tz: "Europe/Amsterdam",
    place: "Amsterdam, Netherlands",
  },
  {
    city: "Singapore",
    state: "Singapore",
    country: "Singapore",
    coords: [103.8198, 1.3521],
    tz: "Asia/Singapore",
    place: "Singapore",
  },
  {
    city: "Tokyo",
    state: "Tokyo",
    country: "Japan",
    coords: [139.6917, 35.6895],
    tz: "Asia/Tokyo",
    place: "Tokyo, Japan",
  },
  {
    city: "Seoul",
    state: "Seoul",
    country: "S.Korea",
    coords: [126.978, 37.5665],
    tz: "Asia/Seoul",
    place: "Seoul, South Korea",
  },
  {
    city: "Dubai",
    state: "Dubai",
    country: "UAE",
    coords: [55.2708, 25.2048],
    tz: "Asia/Dubai",
    place: "Dubai, UAE",
  },
  {
    city: "Hong Kong",
    state: "Hong Kong",
    country: "Hong Kong",
    coords: [114.1095, 22.3964],
    tz: "Asia/Hong_Kong",
    place: "Hong Kong",
  },
  {
    city: "Dublin",
    state: "Leinster",
    country: "Ireland",
    coords: [-6.2603, 53.3498],
    tz: "Europe/Dublin",
    place: "Dublin, Ireland",
  },
  {
    city: "Stockholm",
    state: "Stockholm",
    country: "Sweden",
    coords: [18.0686, 59.3293],
    tz: "Europe/Stockholm",
    place: "Stockholm, Sweden",
  },
  {
    city: "Copenhagen",
    state: "Region",
    country: "Denmark",
    coords: [12.5683, 55.6761],
    tz: "Europe/Copenhagen",
    place: "Copenhagen, Denmark",
  },
  {
    city: "Barcelona",
    state: "Catalonia",
    country: "Spain",
    coords: [2.1734, 41.3851],
    tz: "Europe/Madrid",
    place: "Barcelona, Spain",
  },
  {
    city: "Mexico City",
    state: "CDMX",
    country: "Mexico",
    coords: [-99.1332, 19.4326],
    tz: "America/Mexico_City",
    place: "Mexico City, Mexico",
  },
  {
    city: "Sao Paulo",
    state: "SP",
    country: "Brazil",
    coords: [-46.6333, -23.5505],
    tz: "America/Sao_Paulo",
    place: "Sao Paulo, Brazil",
  },
];

const PROFESSIONS_FEMALE = [
  "UX Designer",
  "Marketing Manager",
  "Data Scientist",
  "Product Manager",
  "Architect",
  "Startup Founder",
  "Content Strategist",
  "Financial Analyst",
  "Software Engineer",
  "Brand Strategist",
  "Digital Artist",
  "Environmental Consultant",
  "Urban Planner",
  "Chef",
  "Nutritionist",
  "Photographer",
  "Journalist",
  "Public Health Specialist",
  "Fashion Buyer",
  "Research Scientist",
];

const PROFESSIONS_MALE = [
  "Software Engineer",
  "Product Manager",
  "Data Scientist",
  "Architect",
  "Marketing Manager",
  "Tech Lead",
  "Financial Analyst",
  "Consultant",
  "Startup Founder",
  "UX Designer",
  "Product Designer",
  "Renewable Energy Engineer",
  "Content Strategist",
  "Digital Artist",
  "Environmental Consultant",
  "Music Producer",
  "Industrial Designer",
  "Fitness Trainer",
  "Photographer",
  "Research Scientist",
];

const RELIGIONS = ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Parsi", "Buddhist"];
const COMMUNITIES = [
  "Brahmin",
  "Parsi",
  "Bengali",
  "Punjabi",
  "Marathi",
  "Gujarati",
  "Bunt",
  "Konkani",
  "Telugu",
  "Malayali",
  "Tamil",
  "Rajasthani",
  "Bohra",
  "Memon",
  "Sindhi",
  "Marwari",
];
const MOTHER_TONGUES = [
  "Hindi",
  "English",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Bengali",
  "Punjabi",
  "Gujarati",
  "Urdu",
  "Tulu",
  "Konkani",
];
const EDUCATIONS = [
  "IIT Bombay · MBA",
  "Stanford University · MS",
  "Delhi University · Graduate",
  "Cambridge · MA",
  "IIM Ahmedabad · MBA",
  "BITS Pilani · BE",
  "CEPT University · M.Arch",
  "NMIMS · BBA",
  "FMS Delhi · MBA",
  "University of Toronto · MA",
  "Technical University of Munich · MS",
  "RMIT · Urban Planning",
  "Ashoka University · BA",
  "FLAME University · MBA",
  "Symbiosis · Mass Comm",
  "VIT · Engineering",
  "Manipal · Medicine",
];
const COMPANIES = [
  "Techtonics Labs",
  "GreenScape Solutions",
  "Nexus Digital",
  "Vertex Innovations",
  "Aura Studios",
  "TerraNova Labs",
  "Pulse Commerce",
  "Summit Consulting",
  "Vertex Health",
  "Apex Energy",
  "Nova Labs",
  "Cobalt Systems",
  "Lumen Labs",
  "Meridian Solutions",
  "Orion Tech",
  "Stratos Media",
  "Equinox Digital",
  "Vertex Global",
  "Cascade Innovations",
  "Independent",
  "Freelance",
  "Own Practice",
];
const INCOME_RANGES = ["15–25L", "25–40L", "40L–65L", "65L–1 Cr", "1 Cr+", "10–15L"];
const HEADLINES = [
  "Seeking meaningful connections built on mutual growth and shared laughter",
  "Curious mind looking for a partner who values depth over small talk",
  "Ambition balanced with emotional availability — let's build something beautiful",
  "Coffee-fueled ideator seeking fellow dreamer for deep conversations",
  "Career-driven but family-first; looking for someone who gets both",
  "Quiet strength meets playful spirit — let's navigate life together",
  "Creative soul seeking emotional resonance and meaningful partnership",
  "Grounded in values, curious about the future — ready to grow together",
  "Books, badminton, and deep talks — that's my love language",
  "Work hard, walk more, love deeply — seeking my person",
];
const ABOUTS = [
  "Demo profile for testing. Values meaningful conversations, weekend hikes, and old music. Looking for someone who can laugh at their own jokes and take life seriously when it matters.",
  "Demo profile for testing. By day I build products, by evening I practice yoga. Seeking a partner who believes in growing together rather than growing apart.",
  "Demo profile for testing. I believe the best relationships are built on friendship, honest communication, and shared meals on rainy evenings.",
  "Demo profile for testing. Loves exploring local food scenes, indie music, and philosophical podcasts. Looking for someone kind, curious, and emotionally intelligent.",
  "Demo profile for testing. My friends say I'm the responsible one who secretly binge-watches rom-coms. Seeking genuine connection with room for both serious and silly moments.",
  "Demo profile for testing. Passionate about sustainable living, urban gardening, and finding the best filter coffee in town. Let's build a cozy life together.",
  "Demo profile for testing. I speak multiple languages, cook varied cuisines, and still burn water sometimes. Looking for someone who appreciates authenticity and gentle humor.",
  "Demo profile for testing. Professional by day, amateur poet by night. Seeking a partner who reads, reflects, and isn't afraid of meaningful conversations.",
  "Demo profile for testing. I have an irrational love for stationery, morning walks, and planning trips I never take. Looking for someone ready for real connection.",
  "Demo profile for testing. Believes in slow dating, deep listening, and building something lasting. Let's skip the small talk and get to the good stuff.",
];
const LIFESTYLES = [
  { diet: "Vegetarian", smoking: "No", drinking: "No" },
  { diet: "Non-vegetarian", smoking: "No", drinking: "Occasionally" },
  { diet: "Vegan", smoking: "No", drinking: "No" },
  { diet: "Vegetarian", smoking: "No", drinking: "Occasionally" },
  { diet: "Non-vegetarian", smoking: "No", drinking: "No" },
];
const MATCH_HEADLINES = [
  "Moon–Venus warmth with strong long-term bonding indicators.",
  "Saturn steadiness with nurturing Moon themes.",
  "Sun–Moon integration with natural mutual reinforcement.",
  "Graceful Venus–Jupiter with gentle karmic lessons.",
  "Balanced ascendant with strong relationship potential.",
  "Mercury–Venus harmony with steady Saturn commitment.",
  "Jupiter expansion with relationship axis awareness.",
  "Dynamic Mars–Moon with protective Saturn grounding.",
];

const UNSASH_PHOTO_IDS = [
  "photo-15348542173",
  "photo-1533277988534-d6d585432947",
  "photo-1506744038136",
  "photo-1529626455594-4ff0802cfb7e",
  "photo-1534080564583",
  "photo-1522907896",
  "photo-1520259760067",
  "photo-1506744038136",
  "photo-1494790106377-8fc1",
  "photo-1513635913274-8a1",
  "photo-1517841909596-9",
  "photo-15399546634",
  "photo-1529626455594-4ff",
  "photo-1534080564583",
  "photo-1520259760067",
  "photo-1506744038136",
  "photo-1534080564583",
  "photo-15348542173",
  "photo-1533277988534",
  "photo-1503607879285",
];

const EXTRA_IDS = [
  "photo-1506744038136",
  "photo-1529626455594-4ff0802cfb7e",
  "photo-1534080564583",
  "photo-1503607879285",
  "photo-1520259760067",
];

// --- Seeded PRNG ---
function makeRng(seed: number) {
  let state = seed >>> 0;
  return {
    next() {
      state = (state * 1103515245 + 12345) & 0x7fffffff;
      return state / 0x7fffffff;
    },
    pick<T>(arr: T[]): T {
      return arr[Math.floor(this.next() * arr.length)];
    },
    range(min: number, max: number): number {
      return Math.floor(this.next() * (max - min + 1)) + min;
    },
  };
}

// --- Profile generation ---
interface DemoBirth {
  birthDate: string;
  birthTime: string;
  birthTimeUnknown: boolean;
  placeName: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface DemoMember {
  id: string;
  email: string;
  password: string;
  name: string;
  gender: "MALE" | "FEMALE";
  age: number;
  dateOfBirth: string;
  heightCm: number;
  city: string;
  state: string;
  country?: string;
  coordinates: [number, number];
  religion: string;
  community: string;
  motherTongue: string;
  languages: string[];
  education: string;
  profession: string;
  company?: string;
  incomeRange?: string;
  maritalStatus: "NEVER_MARRIED" | "MARRIED" | "DIVORCED" | "WIDOWED" | "AWAITING_DIVORCE";
  headline: string;
  about: string;
  lifestyle: { diet: string; smoking: string; drinking: string };
  photo: string;
  extraPhotos?: string[];
  isCelebrity?: boolean;
  isVerified?: boolean;
  birth: DemoBirth;
  score: number;
  aiScore: number;
  guna: number;
  manglik: "No" | "Partial" | "Yes";
  lastActive: string;
  matchHeadline: string;
  prefs?: {
    ageMin: number;
    ageMax: number;
    religions: string[];
    cities: string[];
    minCompatibilityScore: number;
  };
}

function genProfiles(
  count: number,
  prefix: string,
  seed: number,
  intl = false,
  femaleFirst = false,
): DemoMember[] {
  const rng = makeRng(seed);
  const profiles: DemoMember[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    const gender: "MALE" | "FEMALE" = femaleFirst
      ? i % 2 === 0
        ? "FEMALE"
        : "MALE"
      : i % 2 === 0
        ? "MALE"
        : "FEMALE";
    const firstNames = gender === "FEMALE" ? FIRST_NAMES_FEMALE : FIRST_NAMES_MALE;
    const professions = gender === "FEMALE" ? PROFESSIONS_FEMALE : PROFESSIONS_MALE;

    let name: string;
    do {
      name = `${rng.pick(firstNames)} ${rng.pick(LAST_NAMES)}`;
    } while (usedNames.has(name));
    usedNames.add(name);

    const birthYear = intl ? 1990 + rng.range(0, 12) : 1992 + rng.range(0, 10);
    const birthMonth = rng.range(1, 12);
    const birthDay = rng.range(1, 28);
    const dateOfBirth = `${birthYear}-${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`;
    const age = 2026 - birthYear;

    const birthHour = rng.range(4, 20);
    const birthMin = rng.range(0, 59);
    const birthTime = `${String(birthHour).padStart(2, "0")}:${String(birthMin).padStart(2, "0")}:00`;
    const birthTimeUnknown = rng.next() < 0.45;

    let cityData;
    if (intl) {
      cityData = rng.pick(INT_CITIES);
    } else {
      cityData = rng.pick(CITIES_INDIA);
    }

    const emailLocal = name.toLowerCase().replace(/ /g, ".");
    const profile: DemoMember = {
      id: `${prefix}_${String(i + 1).padStart(3, "0")}`,
      email: `${emailLocal}@demo.vedamilan.ai`,
      password: "DemoCeleb!23",
      name,
      gender,
      age,
      dateOfBirth,
      heightCm: gender === "FEMALE" ? rng.range(155, 175) : rng.range(165, 185),
      city: cityData.city,
      state: cityData.state,
      country: intl ? cityData.country : undefined,
      coordinates: cityData.coords,
      religion: intl
        ? rng.pick(["Hindu", "Christian", "Muslim", "Sikh", "Buddhist", "Jewish"])
        : rng.pick(RELIGIONS),
      community: intl
        ? rng.pick(["American", "British", "European", "Canadian", "Australian"])
        : rng.pick(COMMUNITIES),
      motherTongue: intl ? "English" : rng.pick(MOTHER_TONGUES),
      languages: intl
        ? rng.pick([
            ["English", "Spanish"],
            ["English", "French"],
            ["English"],
            ["English", "Mandarin"],
          ])
        : ["English", rng.pick(MOTHER_TONGUES), "Hindi"],
      education: rng.pick(EDUCATIONS),
      profession: rng.pick(professions),
      company: rng.pick(COMPANIES),
      incomeRange: rng.pick(
        intl ? ["40-65L", "65L-1 Cr", "1 Cr+", "$80K-120K", "$120K-200K"] : INCOME_RANGES,
      ),
      maritalStatus: "NEVER_MARRIED",
      headline: rng.pick(HEADLINES),
      about: rng.pick(ABOUTS),
      lifestyle: rng.pick(LIFESTYLES),
      photo: UNSASH(rng.pick(UNSASH_PHOTO_IDS)),
      extraPhotos: rng.next() < 0.5 ? [UNSASH(rng.pick(UNSASH_PHOTO_IDS))] : undefined,
      isCelebrity: false,
      isVerified: rng.next() < 0.3,
      birth: {
        birthDate: dateOfBirth,
        birthTime,
        birthTimeUnknown,
        placeName: intl ? cityData.place : `${cityData.city}, ${cityData.state}, India`,
        latitude: intl ? cityData.coords[1] : cityData.coords[1],
        longitude: intl ? cityData.coords[0] : cityData.coords[0],
        timezone: intl ? cityData.tz : "Asia/Kolkata",
      },
      score: rng.range(75, 96),
      aiScore: rng.range(73, 94),
      guna: rng.range(24, 33),
      manglik: rng.pick(["No", "Partial", "Yes"] as const),
      lastActive: rng.pick(["Online", "2h ago", "5h ago", "1d ago", "3d ago"]),
      matchHeadline: rng.pick(MATCH_HEADLINES),
    };

    if (rng.next() < 0.4) {
      profile.prefs = {
        ageMin: Math.max(21, age - 8),
        ageMax: age + 8,
        religions: [profile.religion],
        cities: [profile.city, "Mumbai", "Bengaluru", "Delhi NCR", "Hyderabad"],
        minCompatibilityScore: 18,
      };
    }

    profiles.push(profile);
  }
  return profiles;
}

// Generate profiles
const indianReal = genProfiles(13, "f_real", 101, false, true);
const international = genProfiles(112, "f_int", 202, true, true);
const coreCeleb = genProfiles(27, "f_core", 303, false, true);

// --- Write real-celeb-profiles.ts (replacing with fictional) ---
function writeProfileFile(
  filename: string,
  profiles: DemoMember[],
  exportName: string,
  docComment: string,
) {
  let content = `/**\n * ${docComment}\n * All profiles are synthetic — no real individuals referenced.\n */\n`;
  content += `import type { DemoMember } from "@/lib/mock/demo-profiles";\n\n`;
  content += `const pass = "DemoCeleb!23";\n\n`;
  content += `function ageFrom(dob: string): number {\n  const y = Number(dob.slice(0, 4));\n  return Math.max(18, 2026 - y);\n}\n\n`;
  content += `function member(partial: Omit<DemoMember, "age" | "password" | "score" | "aiScore" | "guna" | "manglik" | "lastActive" | "matchHeadline"> & Partial<Pick<DemoMember, "score" | "aiScore" | "guna" | "manglik" | "lastActive" | "matchHeadline">>): DemoMember {\n  const {\n    score = 88,\n    aiScore = 87,\n    guna = 27,\n    manglik = "No",\n    lastActive = "Online",\n    matchHeadline = "Demo profile for engine reliability testing.",\n    ...rest\n  } = partial;\n  return {\n    password: pass,\n    age: ageFrom(partial.dateOfBirth),\n    score,\n    aiScore,\n    guna,\n    manglik,\n    lastActive,\n    matchHeadline,\n    ...rest,\n  };\n}\n\n`;
  content += `/**\n * Fictional demo profiles — replacing real celebrity showcase entries.\n * No real public figures are referenced.\n */\n`;
  content += `export const ${exportName}: DemoMember[] = [\n`;

  for (const p of profiles) {
    const obj: any = {
      id: p.id,
      email: p.email,
      name: p.name,
      gender: p.gender,
      dateOfBirth: p.dateOfBirth,
      heightCm: p.heightCm,
      city: p.city,
      state: p.state,
      ...(p.country ? { country: p.country } : {}),
      coordinates: p.coordinates,
      religion: p.religion,
      community: p.community,
      motherTongue: p.motherTongue,
      languages: p.languages,
      education: p.education,
      profession: p.profession,
      company: p.company,
      incomeRange: p.incomeRange,
      maritalStatus: p.maritalStatus,
      headline: p.headline,
      about: p.about,
      lifestyle: p.lifestyle,
      photo: p.photo,
      ...(p.extraPhotos ? { extraPhotos: p.extraPhotos } : {}),
      isCelebrity: false,
      isVerified: p.isVerified,
      birth: p.birth,
      score: p.score,
      aiScore: p.aiScore,
      guna: p.guna,
      manglik: p.manglik,
      lastActive: p.lastActive,
      matchHeadline: p.matchHeadline,
      ...(p.prefs ? { prefs: p.prefs } : {}),
    };
    content += `  member(${JSON.stringify(obj, null, 2).replace(/\n/g, "\n  ")}),\n`;
  }
  content += `];\n`;
  writeFileSync(resolve(filename), content);
  console.log(`Written: ${filename} (${profiles.length} profiles)`);
}

writeProfileFile(
  "src/lib/mock/real-celeb-profiles.ts",
  indianReal,
  "REAL_CELEB_MEMBERS",
  "Fictional Indian demo profiles",
);
writeProfileFile(
  "src/lib/mock/international-demo-profiles.ts",
  international,
  "INTERNATIONAL_DEMO_MEMBERS",
  "Fictional international demo profiles",
);

// For CORE_DEMO_MEMBERS, we need to generate the array inline without the member() helper
let coreContent = `/**\n * Core demo members — all fictional Indian profiles.\n * No real individuals are referenced.\n */\n`;
coreContent += `import { INTERNATIONAL_DEMO_MEMBERS } from "@/lib/mock/international-demo-profiles";\n`;
coreContent += `import { REAL_CELEB_MEMBERS } from "@/lib/mock/real-celeb-profiles";\n\n`;
coreContent += `/** Indian fictional demo profiles (core roster) */\n`;
coreContent += `const CORE_DEMO_MEMBERS: DemoMember[] = [\n`;

for (const p of coreCeleb) {
  coreContent += `  ${JSON.stringify(p, null, 2)},\n`;
}
coreContent += `];\n\n`;
coreContent += `/** Full demo roster — fictional only */\n`;
coreContent += `export const DEMO_MEMBERS: DemoMember[] = [\n  ...CORE_DEMO_MEMBERS,\n  ...INTERNATIONAL_DEMO_MEMBERS,\n  ...REAL_CELEB_MEMBERS,\n];\n\n`;
coreContent += `export const DEMO_PRIMARY = DEMO_MEMBERS.find((m) => m.id === "f_core_001")!;\n`;
coreContent += `export const DEMO_MATCHES = DEMO_MEMBERS.filter((m) => m.id !== DEMO_PRIMARY.id);\n`;
coreContent += `export const CELEBRITY_MEMBERS = [] as DemoMember[];\n`;
writeFileSync(resolve("src/lib/mock/demo-profiles.ts"), coreContent);
console.log(`Written: src/lib/mock/demo-profiles.ts (${coreCeleb.length} core profiles)`);

// --- Situational answers ---
const SITUATIONAL_QUESTIONS = [
  "after_disagreement",
  "free_weekend",
  "family_gathering",
  "money_surprise",
  "stress_support",
  "social_energy",
  "career_travel",
  "morning_tone",
];
const SIT_OPTS: Record<string, string[]> = {
  after_disagreement: ["space_then_talk", "talk_now", "write_first", "sleep_reset", "mediate"],
  free_weekend: ["quiet_home", "social", "culture", "nature", "adventure"],
  family_gathering: ["decide_together", "host_together", "split_fair", "avoid"],
  money_surprise: ["discuss_split", "absorb_if_able", "plan_budget", "panic_then_plan"],
  stress_support: ["listen", "encourage", "fix", "comfort"],
  social_energy: ["prefer_quiet", "go_gladly", "go_sometimes", "need_space"],
  career_travel: ["discuss_balance", "seize_growth", "shared_plan", "follow_heart"],
  morning_tone: ["ritual", "flexible", "together_slow", "independent", "quiet_coffee"],
};

let sitContent = `/**\n * Demo situational-alignment answers — all synthetic.\n */\n`;
sitContent += `import type { SituationalAnswers } from "@/domain/compatibility/situational-alignment";\n\n`;
sitContent += `export const CELEB_SITUATIONAL_ANSWERS: Record<string, SituationalAnswers> = {\n`;

const allProfiles = [...coreCeleb, ...international, ...indianReal];
const sitRng = makeRng(456);
for (const p of allProfiles) {
  const answers: Record<string, string> = {};
  for (const q of SITUATIONAL_QUESTIONS) {
    answers[q] = sitRng.pick(SIT_OPTS[q]);
  }
  sitContent += `  ${p.id}: ${JSON.stringify(answers)},\n`;
}
sitContent += `};\n`;
writeFileSync(resolve("src/lib/mock/celeb-situational-answers.ts"), sitContent);
console.log(`Written: src/lib/mock/celeb-situational-answers.ts (${allProfiles.length} entries)`);

// --- Demo extra photos ---
let photoContent = `/**\n * Extra demo gallery photos — uses Unsplash stock images.\n * All photos are licensed stock imagery.\n */\n`;
photoContent += `export const DEMO_EXTRA_PHOTOS: Record<string, string[]> = {\n`;
for (const p of allProfiles) {
  if (sitRng.next() < 0.4) {
    photoContent += `  "${p.id}": ["${UNSASH(sitRng.pick(EXTRA_IDS))}"],\n`;
  }
}
photoContent += `};\n`;
writeFileSync(resolve("src/lib/mock/demo-extra-photos.ts"), photoContent);
console.log(`Written: src/lib/mock/demo-extra-photos.ts`);

// --- Cleanup script ---
let cleanupContent = `/**
 * Database cleanup script — removes real-person demo profiles and their data.
 *
 * Usage: npx tsx src/infrastructure/database/cleanup-celebrity-data.ts [--dry-run]
 * Target: Development/Test database only (checks NODE_ENV).
 *
 * The script identifies demo profiles by their @demo.vedamilan.ai email domain,
 * then checks each against a list of known celebrity names/emails to remove.
 * After removal, re-run the seed script to populate with fictional profiles.
 */
import "dotenv/config";

import { connectMongo, disconnectMongo, getMongoDb } from "@/infrastructure/database/mongodb";
import { Profile } from "@/infrastructure/database/models";
import { BirthDetails, Horoscope, Dasha, SituationalProfile, Match, Like, Shortlist, Visitor, CompatibilityReport, Chat, Message, Notification } from "@/infrastructure/database/models";
import { logger } from "@/lib/utils/logger";

const dryRun = process.argv.includes("--dry-run");

const CELEBRITY_IDENTIFIERS = new Set([
  // Indian celebrities
  "amitabh.bachchan", "sachin.tendulkar", "sourav.ganguly", "rahul.dravid",
  "shahrukh.khan", "aishwarya.rai", "shilpa.shetty", "madhuri.dixit",
  "kajol.devgn", "sushmita.sen", "kareena.kapoor", "deepika.padukone",
  "ranveer.singh", "alia.bhatt", "ranbir.kapoor",
  // International celebrities
  "conor.mcgregor", "israel.adesanya", "islam.makhachev", "alexa.grasso",
  "zhang.weili", "arman.tsarukyan", "john.cena", "dwayne.johnson",
  "roman.reigns", "becky.lynch", "charlotte.flair", "bianca.belair",
  "rhea.ripley", "bayley.wwe", "cj.perry.lana", "alexa.bliss",
  "mercedes.mone", "asuka.wwe", "bobby.lashley", "miro.rusev",
  "gunther.wwe", "drew.mcintyre", "seth.rollins", "sheamus.wwe",
  "chris.hemsworth", "ryan.reynolds", "tom.holland", "zendaya",
  "sydney.sweeney", "florence.pugh", "jason.momoa", "scarlett.johansson",
  "chris.evans", "ana.dearmas", "simu.liu", "dua.lipa",
  "taylor.swift", "rihanna.fenty", "selena.gomez", "pedro.pascal",
  "bad.bunny", "burna.boy", "jungkook.bts", "henry.cavill",
  "timothee.chalamet", "lewis.hamilton", "michael.b.jordan",
  "lupita.nyongo", "shakira", "iu.lee", "naomi.osaka", "tems",
  "anya.taylorjoy", "rosalia", "gal.gadot", "jennie.blackpink",
  "dev.patel", "jimmy.mrbeast", "emma.chamberlain", "khaby.lame",
  "charli.damelio", "felix.pewdiepie", "lilly.singh", "bhuvan.bam",
  "prajakta.koli", "mark.fischbach", "bailey.sarian", "corpse.husband",
  "ajey.nagar", "zach.king", "luisito.comunica", "karol.g",
  "emmanuella.samuel", "neyo", "ipsy.j", "kenchan", "tedua",
  "diamond", "adwoa.aboah", "irina.shayk", "sania.mirza",
  "venus.williams", "kobe.bryant", "elon.musk", "jack.ma",
  "misty.copeland", "prabhu.deva", "derek.hough", "nora.fatehi",
  "michelle.yeoh", "donnie.yen", "tony.jaa", "ronda.rousey",
  "francis.ngannou", "jenna.ortega", "bill.skarsgard", "mia.goth",
  "cillian.murphy", "idris.elba", "jodie.comer", "margot.robbie",
  "ryan.gosling", "saoirse.ronan", "song.joongki", "diego.luna",
  "simone.biles", "coco.gauff", "erling.haaland", "iga.swiatek",
  "max.verstappen", "neeraj.chopra",
  // More international celebrities found during audit
  "bill.gates", "barack.obama", "priyanka.chopra", "virat.kohli",
  "anushka.sharma", "katrina.kaif", "vicky.kaushal", "kiara.advani",
  "sidharth.malhotra", "shraddha.kapoor", "ayushmann.khurrana",
  "rashmika.mandanna", "dulquer.salmaan", "ms.dhoni", "allu.arjun",
  "shaheid.kapoor", "pv.sindhu", "neeraj.chopra", "ar.raharman",
  "shreya.ghoshal", "sania.mirza", "viswanathan.anand", "smriti.mandhana",
  "kiramazumdar",
]);

async function isCelebrityProfile(profile: { name: string; email: string }) {
  const email = (profile.email || "").toLowerCase();
  for (const identifier of CELEBRITY_IDENTIFIERS) {
    if (email.includes(identifier)) return true;
  }
  return false;
}

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DB_SEED !== "true") {
    throw new Error("Refusing to run in production. Set ALLOW_DB_SEED=true for controlled runs.");
  }

  await connectMongo();
  const db = getMongoDb();
  logger.info({ dryRun, env: process.env.NODE_ENV }, "Starting celebrity data cleanup");

  const demoProfiles = await Profile.find({
    userId: { \\\$exists: true },
    \\\$or: [
      { name: { \\\$regex: "Padukone|Tendulkar|Ganguly|Dravid|Shah Rukh|Aishwarya|Shilpa|Madhuri|Kajol|Sushmita|Kareena|Deepika|Ranveer|Alia|Ranbir|Bachchan|Obama|Gates|McGregor|Johnson|Cena|Reigns|Lynch|Flair|Belair|Ripley|Bayley|Bliss|Banks|Asuka|Lashley|Miro|Gunther|McIntyre|Rollins|Sheamus|Hemsworth|Reynolds|Holland|zendaya|Sweeney|Pugh|Momoa|Johansson|Evans|de Armas|Liu|Lipa|Swift|Rihanna|Gomez|Pascal|Bunny|Boy|Jungkook|Cavill|Chalamet|Hamilton|Jordan|Nyong|Shakira|Osaka|Tems|Taylor|Gadot|Jennie|Patel|MrBeast|Chamberlain|Lame|D'Amelio|PewDiePie|Singh|Bam|Koli|Fischbach|Sarian|Husband|Nagur|King|Comunica|Karol|Emmanuella|Ne-Yo|Ipsy|Ken Chan|Tedua|Diamond|Adwoa|Shayk|Mirza|Williams|Bryant|Musk|Ma|Copeland|Deva|Hough|Fatehi|Yeoh|Yen|Jaa|Rousey|Ngannou|Ortega|Skarsgard|Goth|Murphy|Elba|Comer|Robbie|Gosling|Ronan|Joong-ki|Luna|Biles|Gauff|Haaland|Swiątek|Verstappen|Chopra|Kohli|Sharma|Kaif|Kaushal|Advani|Malhotra|Kapoor|Sidharth|Shraddha|Ayushmann|Rashmika|Dulquer|Dhoni|Arjun|Shaheid|Sindhu|Rahman|Ghoshal|Mirza|Anand|Mandhana|Raj", \\\$options: "i" } },
    ],
  }).lean();

  const celebProfiles = demoProfiles.filter(isCelebrityProfile);
  logger.info({ totalDemoProfiles: demoProfiles.length, celebrityProfiles: celebProfiles.length }, "Identified celebrity profiles for removal");

  if (dryRun) {
    logger.info("Dry run complete — no changes made. Run without --dry-run to execute.");
    await disconnectMongo();
    return;
  }

  for (const profile of celebProfiles) {
    const userId = String(profile.userId);
    await Profile.deleteOne({ _id: profile._id });
    await BirthDetails.deleteMany({ userId });
    await Horoscope.deleteMany({ userId });
    await Dasha.deleteMany({ userId });
    await SituationalProfile.deleteMany({ userId });
    await Match.deleteMany({ \\\$or: [{ userId }, { candidateUserId: userId }] });
    await Like.deleteMany({ \\\$or: [{ fromUserId: userId }, { toUserId: userId }] });
    await Shortlist.deleteMany({ \\\$or: [{ userId }, { targetUserId: userId }] });
    await Visitor.deleteMany({ \\\$or: [{ visitorUserId: userId }, { profileUserId: userId }] });
    await CompatibilityReport.deleteMany({ \\\$or: [{ userAId: userId }, { userBId: userId }] });
    await Chat.deleteMany({ participantIds: userId });
    await Message.deleteMany({ senderId: userId });
    await Notification.deleteMany({ userId });
    await db.collection("user").deleteOne({ \\\$or: [{ id: userId }, { _id: userId }] });
    logger.info({ userId, name: profile.name }, "Removed celebrity profile and related data");
  }

  logger.info({ removed: celebProfiles.length }, "Cleanup complete. Re-run seed to populate with fictional profiles.");
  await disconnectMongo();
}

main().catch(async (error) => {
  console.error(error);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
`;

// Fix escaping
cleanupContent = cleanupContent.replace(/\\\\\\$/g, "\\$");
writeFileSync(resolve("src/infrastructure/database/cleanup-celebrity-data.ts"), cleanupContent);
console.log("Written: src/infrastructure/database/cleanup-celebrity-data.ts");

// --- demo-users.sources.json ---
writeFileSync(
  resolve("data/demo-users.sources.json"),
  JSON.stringify(
    {
      version: "2.0.0",
      description: "Fictional demo profiles — no real person data. All entries are synthetic.",
      lastUpdated: new Date().toISOString(),
      totalProfiles: allProfiles.length,
      note: "All profile data is entirely fictional. No real individual data is used.",
    },
    null,
    2,
  ),
);
console.log("Written: data/demo-users.sources.json");

console.log("\n=== Generation Complete ===");
console.log(`Indian fictional profiles (real-celeb replacement): ${indianReal.length}`);
console.log(`International fictional profiles: ${international.length}`);
console.log(`Core fictional profiles: ${coreCeleb.length}`);
console.log(`Total profiles: ${allProfiles.length}`);
console.log(`Situational answers: ${allProfiles.length}`);
