import { NextResponse, type NextRequest } from "next/server";
import { IS_SHUK_APP } from "@/lib/base-path";
import { shukRoute } from "@/lib/amazing-shuk/shuk-routes";

/** The Memory Protocol build passes everything through. The Shuk build serves only the Shuk (lib/amazing-shuk/shuk-routes.ts). */
export function proxy(request: NextRequest) {
  if (!IS_SHUK_APP) return NextResponse.next();
  const route = shukRoute(request.nextUrl.pathname);
  if (route === "allow") return NextResponse.next();
  if (route === "block") return new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  // The root shows the game itself; a rewrite keeps the address and needs no absolute redirect behind Caddy.
  const game = request.nextUrl.clone();
  game.pathname = "/amazing-shuk";
  return NextResponse.rewrite(game);
}

export const config = {
  // Next's static chunks and image optimiser never need checking. The bare root is listed on its own: under a base path
  // the pattern alone didn't reach it (found in the dori-shuk:test smoke check, 25 Oct 2026).
  matcher: ["/", "/((?!_next/static|_next/image).*)"],
};
