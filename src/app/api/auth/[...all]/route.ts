import { getAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function handle(request: Request) {
  const auth = await getAuth();
  return auth.handler(request);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
