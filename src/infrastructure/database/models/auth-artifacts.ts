/**
 * Auth collections (`user`, `session`, `account`, `verification`) are owned by
 * Better Auth via `mongodbAdapter`. Do not register competing Mongoose models
 * for those collection names.
 *
 * Domain identity extensions live on Profile / PartnerPreferences / etc.,
 * keyed by Better Auth `user.id`.
 */
export {};
