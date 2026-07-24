/** Browser event so navbar / home badges refresh after mark-read. */
export const NOTIFICATIONS_UPDATED_EVENT = "vedamilan:notifications-updated";

export function emitNotificationsUpdated(unread?: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(NOTIFICATIONS_UPDATED_EVENT, {
      detail: { unread: typeof unread === "number" ? unread : undefined },
    }),
  );
}
