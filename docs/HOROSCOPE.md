# Horoscope Engine (Module 4)

Deterministic Swiss Ephemeris + TypeScript rule engines. **AI never calculates charts.**

## Pipeline

1. Load `BirthDetails` for the session user
2. Swiss Ephemeris: JD, planets, Placidus houses
3. Map signs, nakshatra/pada, house occupancy, dignity
4. Rule engines: Manglik, yogas, doshas
5. Vimshottari mahadasha + first-maha antardasha
6. Persist `horoscopes` + `dashas`
7. North / South / East chart payloads stored as JSON

## API

| Method | Path             | Purpose                     |
| ------ | ---------------- | --------------------------- |
| GET    | `/api/horoscope` | Latest stored chart + dasha |
| POST   | `/api/horoscope` | Generate & persist          |

## Requirements

- Birth details saved (Module 3)
- `SWISS_EPHEMERIS_PATH` pointing at ephemeris files for live generation
- Unit tests cover pure Vedic math without ephe files

## Engine version

`vedamilan-horoscope-1.0.0`
