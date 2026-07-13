import Link from "next/link";
import { MicOff, PhoneOff, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";

export default function VideoCallPage() {
  return (
    <div className="bg-navy text-ivory relative flex min-h-[70vh] flex-col overflow-hidden rounded-2xl">
      <div className="mandala-bg absolute inset-0 opacity-30" aria-hidden="true" />
      <div className="relative flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="bg-gold/20 font-display text-gold flex h-28 w-28 items-center justify-center rounded-full text-3xl">
          AS
        </div>
        <h1 className="font-display text-3xl">Calling Ananya Sharma</h1>
        <p className="text-ivory/70">Video call UI mock · connecting…</p>
        <div className="border-ivory/20 mt-4 aspect-video w-full max-w-3xl rounded-2xl border bg-black/30" />
      </div>
      <div className="border-ivory/10 relative flex items-center justify-center gap-3 border-t p-4">
        <Button
          size="icon"
          variant="outline"
          className="border-ivory/30 text-ivory"
          aria-label="Mute"
        >
          <MicOff className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="border-ivory/30 text-ivory"
          aria-label="Camera"
        >
          <Video className="h-4 w-4" />
        </Button>
        <Button asChild size="icon" variant="destructive" aria-label="End call">
          <Link href={routes.chat}>
            <PhoneOff className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
