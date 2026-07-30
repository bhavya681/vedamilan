# Matchmaking Engine (Module 6)

Deterministic discovery and ranking. Ashta Koota scores come from the rule engine; AI never computes compatibility.

## APIs

| Method   | Path                   | Description                         |
| -------- | ---------------------- | ----------------------------------- |
| GET      | `/api/matches`         | Ranked match feed with filters      |
| GET      | `/api/matches/:userId` | Candidate profile + visit recording |
| GET      | `/api/search`          | Alias of matches for search UX      |
| GET/POST | `/api/likes`           | List / send like or interest        |
| GET/POST | `/api/shortlist`       | List / add shortlist                |
| GET      | `/api/visitors`        | Who viewed your profile             |
| GET      | `/api/recommendations` | Top recommendations (prefs-aware)   |

## Filters

`q`, `city`, `religion`, `profession`, `education`, `language`, `manglik`, `minAge`, `maxAge`, `minHeightCm`, `maxHeightCm`, `minCompatibility` (0–100%), `page`, `limit`, `prefs` (`0` to ignore partner preference defaults).

Partner preference `minCompatibilityScore` is on the **guna** scale (0–36).

## Ranking

1. Load active candidate profiles (exclude self / hidden / same gender; photo required).
2. Prefer profiles that already have a kundli (`$lookup` on `horoscopes`), then take a scoring pool (default 400; recommendations use up to 1000 charted).
3. Score the Vedic match blend (Ashta Koota, Shukra Milan, Manglik, Moon) when both charts exist.
4. Filter by age, manglik, min score, text query.
5. Sort by `compatibilityScore` descending, then Guna, then soft preference alignment (prefs never beat a higher score).
6. Persist `Match` snapshot rows for the page.

Recommendations (`/api/recommendations`) use `chartedOnly` so the highest match-score people are not dropped by an arbitrary unsorted DB slice.

## Wired pages

- `/dashboard/matches`
- `/dashboard/matches/profile?id=`
- `/dashboard/search`
- `/dashboard/search/filters`
- `/dashboard/likes`
- `/dashboard/visitors`
- `/dashboard/shortlisted`
