import { Suspense } from "react";

import YourConnectionPage from "./your-connection-client";

export const metadata = { title: "Your Connection" };

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3 py-8">
          <div className="skeleton-shimmer mx-auto h-4 w-48 rounded-full" />
          <div className="skeleton-shimmer mx-auto h-4 w-72 max-w-full rounded-full" />
        </div>
      }
    >
      <YourConnectionPage />
    </Suspense>
  );
}
