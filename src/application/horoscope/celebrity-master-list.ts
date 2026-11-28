import type { CelebrityBirthRecord, CelebrityCategory } from "./celebrity-catalog";

const FIELD_BY_CATEGORY: Record<string, string> = {
  Cinema: "Cinema & entertainment",
  Sports: "Sport",
  Music: "Music",
  Creators: "Digital creator",
  Finance: "Finance & investing",
  Gamblers: "Gambling & games of skill",
  Leaders: "Leadership",
  "Science & arts": "Science & arts",
  Divine: "Divine figure",
  Spiritual: "Spiritual teacher",
  Mystic: "Mystic",
  Criminals: "Notorious criminal figure",
  Psychopaths: "Notorious personality · historical study",
};

const PLACES: Record<string, [string, number, number]> = {
  "New York": ["America/New_York", 40.7128, -74.006],
  Brooklyn: ["America/New_York", 40.6782, -73.9442],
  Omaha: ["America/Chicago", 41.2565, -95.9345],
  London: ["Europe/London", 51.5074, -0.1278],
  "Newton MA": ["America/New_York", 42.337, -71.2091],
  Budapest: ["Europe/Budapest", 47.4979, 19.0402],
  Brookline: ["America/New_York", 42.3318, -71.1212],
  "Winchester TN": ["America/Chicago", 35.1745, -86.1114],
  "San Francisco": ["America/Los_Angeles", 37.7749, -122.4194],
  "Shrewsbury MA": ["America/New_York", 42.2968, -71.7167],
  Memphis: ["America/Chicago", 35.1495, -90.049],
  Pittsburgh: ["America/New_York", 40.4406, -79.9959],
  Chappaqua: ["America/New_York", 41.1684, -73.769],
  "Great Neck": ["America/New_York", 40.8257, -73.7273],
  "Salt Lake City": ["America/Denver", 40.7608, -111.891],
  Chicago: ["America/Chicago", 41.8781, -87.6298],
  Detroit: ["America/Detroit", 42.3314, -83.0458],
  Hyderabad: ["Asia/Kolkata", 17.385, 78.4867],
  Mumbai: ["Asia/Kolkata", 19.076, 72.8777],
  Bengaluru: ["Asia/Kolkata", 12.9716, 77.5946],
  Kolkata: ["Asia/Kolkata", 22.5726, 88.3639],
  Kochi: ["Asia/Kolkata", 9.9312, 76.2673],
  Thrissur: ["Asia/Kolkata", 10.5276, 76.2144],
  Ahmedabad: ["Asia/Kolkata", 23.0225, 72.5714],
  Princeton: ["America/New_York", 40.3573, -74.6672],
  Baltimore: ["America/New_York", 39.2904, -76.6122],
  Hempstead: ["America/New_York", 40.7061, -73.6189],
  "Daytona Beach": ["America/New_York", 29.2108, -81.0228],
  Tulsa: ["America/Chicago", 36.154, -95.9928],
  Houston: ["America/Chicago", 29.7604, -95.3698],
  "Barnesville OH": ["America/New_York", 39.8031, -81.1715],
  Roubaix: ["Europe/Paris", 50.6921, 3.1833],
  Rennes: ["Europe/Paris", 48.1173, -1.6778],
  Beijing: ["Asia/Shanghai", 39.9042, 116.4074],
  Tosu: ["Asia/Tokyo", 33.3858, 130.5206],
  Hefei: ["Asia/Shanghai", 31.8206, 117.2272],
  Albuquerque: ["America/Denver", 35.0853, -106.6056],
  Pretoria: ["Africa/Johannesburg", -25.7479, 28.2293],
  Seattle: ["America/Los_Angeles", 47.6062, -122.3321],
  Boston: ["America/New_York", 42.3601, -71.0589],
  Philadelphia: ["America/New_York", 39.9526, -75.1652],
  Frankfurt: ["Europe/Berlin", 50.1109, 8.6821],
  Colombo: ["Asia/Colombo", 6.9271, 79.8612],
  "New Delhi": ["Asia/Kolkata", 28.6139, 77.209],
  Hilo: ["Pacific/Honolulu", 19.7297, -155.0903],
  Encino: ["America/Los_Angeles", 34.1517, -118.5262],
  Amioun: ["Asia/Beirut", 34.3978, 35.8208],
  Youngstown: ["America/New_York", 41.0998, -80.6495],
  "San Jose": ["America/Los_Angeles", 37.3382, -121.8863],
  Cambridge: ["Europe/London", 52.2053, 0.1218],
  Toronto: ["America/Toronto", 43.6532, -79.3832],
  Sydney: ["Australia/Sydney", -33.8688, 151.2093],
  Melbourne: ["Australia/Melbourne", -37.8136, 144.9631],
  Paris: ["Europe/Paris", 48.8566, 2.3522],
  Dublin: ["Europe/Dublin", 53.3498, -6.2603],
  Stockholm: ["Europe/Stockholm", 59.3293, 18.0686],
  Copenhagen: ["Europe/Copenhagen", 55.6761, 12.5683],
  Helsinki: ["Europe/Helsinki", 60.1699, 24.9384],
  Amsterdam: ["Europe/Amsterdam", 52.3676, 4.9041],
  Munich: ["Europe/Berlin", 48.1351, 11.582],
  Rome: ["Europe/Rome", 41.9028, 12.4964],
  Moscow: ["Europe/Moscow", 55.7558, 37.6173],
  Tokyo: ["Asia/Tokyo", 35.6762, 139.6503],
  Kobe: ["Asia/Tokyo", 34.6901, 135.1955],
  Lahore: ["Asia/Karachi", 31.5204, 74.3587],
  Chennai: ["Asia/Kolkata", 13.0827, 80.2707],
  Delhi: ["Asia/Kolkata", 28.6139, 77.209],
  Chandigarh: ["Asia/Kolkata", 30.7333, 76.7794],
  Secunderabad: ["Asia/Kolkata", 17.4399, 78.4983],
  Panipat: ["Asia/Kolkata", 29.9652, 76.9629],
  Indore: ["Asia/Kolkata", 22.7196, 75.8577],
  Nagpur: ["Asia/Kolkata", 21.1458, 79.0882],
  Pune: ["Asia/Kolkata", 18.5204, 73.8567],
  Jaipur: ["Asia/Kolkata", 26.9124, 75.7873],
  HyderabadIndia: ["Asia/Kolkata", 17.385, 78.4867],
};

const ALIASES = new Set([
  "jack bogle",
  "john bogle",
  "james harris simons",
  "monish pabrai",
  "pabrai mohnish",
  "ed thorp",
  "edward thorp",
  "sri aurobindo",
  "jeffrey dahmer",
  "james caan",
  "bruce lee?",
]);

const SOURCE = `
Finance|Warren Buffett|1930-08-30|Omaha
Finance|Charlie Munger|1924-01-01|Omaha
Finance|Benjamin Graham|1894-05-08|London
Finance|Peter Lynch|1944-01-19|Newton MA
Finance|George Soros|1930-08-12|Budapest
Finance|Ray Dalio|1949-08-08|New York
Finance|Jim Simons|1938-04-25|Brookline
Finance|John Templeton|1912-11-08|Winchester TN
Finance|Philip Fisher|1907-09-08|San Francisco
Finance|Jesse Livermore|1877-07-26|Shrewsbury MA
Finance|Paul Tudor Jones|1954-09-28|Memphis
Finance|Stanley Druckenmiller|1953-06-14|Pittsburgh
Finance|Carl Icahn|1936-02-16|New York
Finance|Michael Burry|1971-06-19|San Jose
Finance|Bill Ackman|1966-05-11|Chappaqua
Finance|Howard Marks|1946-04-21|New York
Finance|Seth Klarman|1957-05-21|New York
Finance|Joel Greenblatt|1957-01-01|New York
Finance|David Tepper|1957-09-11|Pittsburgh
Finance|Ken Griffin|1968-10-15|Daytona Beach
Finance|Steve Cohen|1956-06-12|Great Neck
Finance|Bruce Kovner|1945-04-23|New York
Finance|Edward O. Thorp|1932-08-14|Chicago
Finance|John Paulson|1955-12-05|Hempstead
Finance|Michael Steinhardt|1940-12-21|New York
Finance|Julian Robertson|1942-06-11|Salt Lake City
Finance|Richard Dennis|1949-01-11|Chicago
Finance|William O'Neil|1933-03-25|Detroit
Finance|Nicolas Darvas|1920-11-03|Budapest
Finance|Mark Minervini|-|-
Finance|Linda Raschke|-|-
Finance|Kathy Lien|-|-
Finance|Nial Fuller|-|-
Finance|Larry Hite|-|-
Finance|Marty Schwartz|-|-
Finance|Paul Singer|1944-07-10|New York
Finance|David Swensen|1954-11-26|Salt Lake City
Finance|Jack Bogle|1929-05-08|Princeton
Finance|John C. Bogle|1929-05-08|Princeton
Finance|Thomas Rowe Price Jr.|1898-03-07|Baltimore
Finance|Walter Schloss|1916-08-06|New York
Finance|Mohnish Pabrai|1964-01-01|Hyderabad
Finance|Rakesh Jhunjhunwala|1960-07-05|Mumbai
Finance|Radhakishan Damani|1954-01-01|Mumbai
Finance|Vijay Kedia|1960-01-01|Kolkata
Finance|Raamdeo Agrawal|1957-01-01|Mumbai
Finance|Nimesh Shah|1962-01-01|Mumbai
Finance|Nithin Kamath|1978-01-01|Bengaluru
Finance|Uday Kotak|1959-03-15|Mumbai
Finance|Deepak Parekh|1944-01-01|Mumbai
Finance|Aditya Puri|1950-01-01|Mumbai
Finance|Mukesh Ambani|1957-04-19|Mumbai
Finance|Gautam Adani|1962-06-24|Ahmedabad
Finance|Kumar Mangalam Birla|1967-06-14|Mumbai
Finance|Azim Premji|1945-07-24|Mumbai
Finance|M. A. Yusuff Ali|1954-01-01|Thrissur
Finance|Prem Watsa|1950-08-12|Hyderabad
Finance|Thomas Peterffy|1944-09-30|Budapest
Finance|Jeff Bezos|1964-01-12|Albuquerque
Finance|Elon Musk|1971-06-28|Pretoria
Finance|Bill Gates|1955-10-28|Seattle
Finance|Michael Bloomberg|1942-02-14|Boston
Finance|Larry Fink|1952-11-19|New York
Finance|Abigail Johnson|1961-12-19|Boston
Finance|Stephen Schwarzman|1947-02-14|Philadelphia
Finance|Henry Kravis|1944-05-06|Tulsa
Finance|George Roberts|1944-05-21|Houston
Finance|Leon Black|1951-10-30|New York
Finance|Henry Singleton|1916-10-27|Barnesville OH
Finance|Bernard Arnault|1949-03-05|Roubaix
Finance|François Pinault|1936-08-21|Rennes
Finance|Li Lu|1966-01-01|Beijing
Finance|Masayoshi Son|1957-08-11|Tosu
Finance|Zhang Lei|1972-01-01|Hefei
Finance|David Einhorn|1968-01-01|New York
Finance|Bill Miller|1955-01-01|Baltimore
Finance|James Harris Simons|1938-04-25|Brookline
Finance|Cliff Asness|1966-01-01|New York
Finance|AQR's David Kabiller|1967-01-01|New York
Finance|Robert Shiller|1946-03-29|Detroit
Finance|Eugene Fama|1939-02-14|Boston
Finance|Burton Malkiel|1932-08-28|Boston
Finance|John Maynard Keynes|1883-06-05|Cambridge
Finance|Milton Friedman|1912-06-21|Brooklyn
Finance|Benjamin Roth|1895-01-01|Youngstown
Finance|Nassim Nicholas Taleb|1960-09-12|Amioun
Finance|Mohamed El-Erian|1958-09-19|New York
Finance|Jeremy Grantham|1938-05-26|London
Finance|Michael Milken|1946-07-04|Encino
Finance|David Rubenstein|1949-08-11|Baltimore
Finance|Peter Thiel|1967-10-13|Frankfurt
Finance|Chamath Palihapitiya|1976-09-03|Colombo
Finance|Naval Ravikant|1974-09-12|New Delhi
Finance|Robert Kiyosaki|1947-04-25|Hilo
Finance|Jim Rogers|1942-10-19|Baltimore
Finance|Mark Mobius|1936-08-24|New York
Finance|Monish Pabrai|1964-01-01|Hyderabad
Finance|Ashish Kacholia|1971-01-01|Mumbai
Finance|Sunil Singhania|1969-01-01|Mumbai
Finance|Porinju Veliyath|1962-01-01|Kochi
Finance|John Neff|-|-
Finance|T. Boone Pickens|1928-05-22|-
Finance|Bill Gross|1944-06-14|-
Finance|John D. Rockefeller|1839-07-08|-
Finance|Andrew Carnegie|1835-11-25|-
Finance|J. P. Morgan|1837-04-17|-
Finance|Cornelius Vanderbilt|1794-05-27|-
Finance|Sam Zell|1941-09-28|Chicago
Finance|Ray Kroc|1902-10-05|-
Finance|Thomas Sowell|1930-06-30|-
Finance|Peter Schiff|-|-
Finance|Cathie Wood|-|-
Finance|Michael Saylor|-|-
Psychopaths|Ted Bundy|1946-11-24|-
Psychopaths|Jeffrey Dahmer|1960-05-21|-
Psychopaths|John Wayne Gacy|1942-03-17|Chicago
Psychopaths|Richard Ramirez|1960-02-29|-
Psychopaths|Dennis Rader|1944-03-09|Pittsburgh
Psychopaths|Gary Ridgway|1949-02-12|Salt Lake City
Psychopaths|Edmund Kemper|1948-12-18|-
Psychopaths|Aileen Wuornos|1956-02-29|-
Psychopaths|Charles Manson|1934-11-12|-
Psychopaths|Andrei Chikatilo|1936-10-17|-
Psychopaths|Albert Fish|1870-05-19|-
Psychopaths|H. H. Holmes|1861-05-16|-
Psychopaths|Peter Kürten|1883-03-26|-
Psychopaths|John Christie|1898-04-08|-
Psychopaths|Harold Shipman|1946-01-14|-
Psychopaths|Fred West|1941-09-29|-
Psychopaths|Rose West|1953-11-20|-
Psychopaths|Ian Brady|1938-01-02|-
Psychopaths|Myra Hindley|1942-07-23|-
Psychopaths|Robert Pickton|1949-10-24|-
Psychopaths|Israel Keyes|1978-01-30|-
Psychopaths|Richard Cottingham|1946-11-14|New York
Psychopaths|Rodney Alcala|1943-08-23|-
Psychopaths|Samuel Little|1940-06-27|-
Psychopaths|William Bonin|1947-01-25|-
Psychopaths|Lawrence Bittaker|1940-09-27|-
Psychopaths|Roy Norris|1943-05-09|-
Psychopaths|Dean Corll|1939-12-24|-
Psychopaths|Herbert Mullin|1947-09-18|-
Psychopaths|David Berkowitz|1953-06-04|Brooklyn
Psychopaths|Richard Chase|1950-05-23|-
Psychopaths|Carl Panzram|-|-
Psychopaths|Albert DeSalvo|1931-09-03|-
Psychopaths|Henry Lee Lucas|1936-08-01|-
Psychopaths|Ottis Toole|1947-03-05|-
Psychopaths|Charles Ng|1960-12-24|-
Psychopaths|Leonard Lake|1935-12-26|-
Psychopaths|Robert Hansen|1939-02-15|-
Psychopaths|Bruce McArthur|1951-04-05|Toronto
Psychopaths|Paul Bernardo|1964-04-07|Toronto
Psychopaths|Karla Homolka|1970-05-10|-
Psychopaths|Luka Magnotta|1982-07-25|Toronto
Psychopaths|Javed Iqbal|-|-
Psychopaths|Thug Behram|-|-
Psychopaths|Raman Raghav|-|-
Psychopaths|Auto Shankar|-|-
Psychopaths|Cyanide Mohan|-|-
Psychopaths|Surender Koli|-|-
Psychopaths|Moninder Singh Pandher|-|-
Psychopaths|Udayan Das|-|-
Psychopaths|Charles Sobhraj|1944-04-10|-
Psychopaths|Gilles de Rais|1404-01-01|-
Psychopaths|Elizabeth Báthory|1560-08-21|-
Psychopaths|Vlad the Impaler|-|-
Psychopaths|Ivan the Terrible|1530-08-25|Moscow
Psychopaths|Caligula|0012-08-31|-
Psychopaths|Nero|0037-12-15|Rome
Psychopaths|Genghis Khan|-|-
Psychopaths|Pol Pot|1925-05-19|-
Psychopaths|Idi Amin|1925-08-30|-
Psychopaths|Saddam Hussein|1937-04-28|-
Psychopaths|Joseph Stalin|1878-12-18|-
Psychopaths|Adolf Hitler|1889-04-20|-
Psychopaths|Heinrich Himmler|1900-10-07|Munich
Psychopaths|Reinhard Heydrich|1904-03-07|-
Psychopaths|Josef Mengele|1911-03-16|-
Psychopaths|Benito Mussolini|1883-07-29|-
Psychopaths|Francisco Franco|1892-12-04|-
Psychopaths|King Leopold II|1835-04-09|-
Psychopaths|Hideki Tojo|1884-12-30|Tokyo
Psychopaths|Shiro Ishii|1892-06-25|-
Psychopaths|Radovan Karadžić|1945-06-19|-
Psychopaths|Ratko Mladić|1943-03-12|-
Psychopaths|Slobodan Milošević|1941-08-20|-
Psychopaths|Omar al-Bashir|1944-01-01|-
Psychopaths|Charles Taylor|1948-01-28|-
Psychopaths|Jean-Bédel Bokassa|1921-02-22|-
Psychopaths|Efraín Ríos Montt|1926-06-16|-
Psychopaths|Augusto Pinochet|1915-11-25|-
Psychopaths|Manuel Noriega|1934-02-09|-
Psychopaths|Jim Jones|1931-05-13|-
Psychopaths|Marshall Applewhite|1931-02-16|-
Psychopaths|Shoko Asahara|1955-02-25|-
Psychopaths|Warren Jeffs|1955-12-03|Salt Lake City
Psychopaths|Keith Raniere|1960-04-24|Brooklyn
Psychopaths|David Koresh|1959-08-18|Houston
Psychopaths|Bhagwan Shree Rajneesh|-|-
Psychopaths|Ivan Milat|1944-12-27|Sydney
Psychopaths|Peter Sutcliffe|1946-06-02|-
Psychopaths|Fred McCarthy|-|-
Psychopaths|Robert Black|1947-04-21|-
Psychopaths|Peter Tobin|1946-08-27|-
Psychopaths|Dennis Nilsen|1945-11-23|-
Psychopaths|Richard Speck|1941-12-06|-
Psychopaths|Charles Starkweather|1938-11-24|-
Psychopaths|Ed Gein|1906-08-17|-
Psychopaths|Carl Eugene Watts|1953-11-13|-
Psychopaths|Jeffrey Esteem|-|-
`;

function recordId(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export function buildMasterRecords(existing: CelebrityBirthRecord[]): CelebrityBirthRecord[] {
  const seenNames = new Set(existing.map((record) => record.name.toLowerCase()));
  const seenIds = new Set(existing.map((record) => record.id));
  const records: CelebrityBirthRecord[] = [];

  for (const line of SOURCE.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const [category, name, rawDate, rawPlace] = trimmed
      .split("|")
      .map((part) => part?.trim() ?? "");
    if (!category || !name) continue;
    const key = name.toLowerCase();
    if (seenNames.has(key) || ALIASES.has(key)) continue;
    seenNames.add(key);

    let id = recordId(name);
    if (seenIds.has(id)) id = `${id}-master`;
    seenIds.add(id);

    const dateKnown = Boolean(rawDate && rawDate !== "-");
    const placeKnown = Boolean(rawPlace && rawPlace !== "-");
    const [timezone, latitude, longitude] = placeKnown
      ? (PLACES[rawPlace!] ?? (["UTC", 0, 0] as const))
      : (["UTC", 0, 0] as const);

    records.push({
      id,
      name,
      field: FIELD_BY_CATEGORY[category!] ?? category!,
      category: category as CelebrityCategory,
      birthDate: dateKnown ? rawDate! : "1900-01-01",
      birthTime: "12:00",
      timezone,
      latitude,
      longitude,
      place: placeKnown ? rawPlace! : "Birthplace not publicly verified",
      timeAccuracy: "unknown",
      note: !dateKnown
        ? "PLACEHOLDER BIRTH DATA — date and place not publicly verified; chart is illustrative only."
        : !placeKnown
          ? "PLACEHOLDER BIRTH DATA — birthplace and time not publicly verified; date is widely cited; chart is illustrative only."
          : "Widely cited birth date; birth time not published, so the chart uses local noon.",
    });
  }

  return records;
}
