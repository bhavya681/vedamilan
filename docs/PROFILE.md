# Profile System (Module 3)

Domain profile data lives in MongoDB via Mongoose. Auth identity remains in Better Auth `user` collection; `profiles.userId` links them.

## APIs

| Method    | Path                            | Purpose                                 |
| --------- | ------------------------------- | --------------------------------------- |
| GET       | `/api/profile`                  | Profile + preferences + birth bundle    |
| PATCH/PUT | `/api/profile`                  | Update profile fields + visibility      |
| POST      | `/api/profile/photos`           | Upload image (`dataUrl`) via Cloudinary |
| DELETE    | `/api/profile/photos?publicId=` | Remove photo                            |
| GET/PUT   | `/api/preferences`              | Partner preferences CRUD                |
| GET/PUT   | `/api/birth-details`            | Birth details for Swiss Ephemeris       |

All routes require a Better Auth session.

## Completion score

Weighted 0–100 across about, photos, city, profession, education, religion, DOB, height, languages, lifestyle. `isProfileComplete` when score ≥ 80.

## Cloudinary

Requires `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Folder: `vedamilan/profiles/{userId}`.

## Wired pages

- `/dashboard/profile` — live read
- `/dashboard/profile/edit` — save + photo upload
- `/dashboard/preferences` — save filters
- `/dashboard/birth-details` — save natal input
