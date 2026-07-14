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

1. Load active candidate profiles (exclude self / hidden).
2. Load latest kundli per candidate.
3. Score Ashta Koota when both charts exist.
4. Filter by age, manglik, min score, text query.
5. Sort by `compatibilityScore` descending.
6. Persist `Match` snapshot rows for the page.

## Wired pages

- `/dashboard/matches`
- `/dashboard/matches/profile?id=`
- `/dashboard/search`
- `/dashboard/search/filters`
- `/dashboard/likes`
- `/dashboard/visitors`
- `/dashboard/shortlisted`
