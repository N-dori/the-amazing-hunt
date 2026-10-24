/** Shared image geometry only: no game content, geographic projection or GPS conversion. */
export type ImageBaseMap = Readonly<{ src: string; width: number; height: number }>;
export const ILLUSTRATED_MARKET_MAP: ImageBaseMap = Object.freeze({ src: "/map/nahlaot-illustrated-candidate.jpg", width: 1586, height: 992 });
export function imageToLatLng(baseMap: Pick<ImageBaseMap, "height">, x: number, y: number): [number, number] {
  return [baseMap.height - y, x];
}
