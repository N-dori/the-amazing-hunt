// Container healthcheck target: answers without touching game state.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ ok: true });
}
