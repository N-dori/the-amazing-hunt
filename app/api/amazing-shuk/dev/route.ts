import { handleParticipantRequest } from "@/lib/amazing-shuk/participant-http";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET(request: Request) { return handleParticipantRequest(request); }
export async function POST(request: Request) { return handleParticipantRequest(request); }
