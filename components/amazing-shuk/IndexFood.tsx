"use client";
import { useEffect, useRef, useState } from "react";
import { FOOD_CATALOGUE, FOOD_COPY } from "@/lib/amazing-shuk/food-catalogue";
import { buildFoodTastingViews, FOOD_RETURN_STORAGE_KEY, parseFoodReturnPosition } from "@/lib/amazing-shuk/food-catalogue-view";
import PreviewFoodRewards from "./PreviewFoodRewards";
import ListFoodTasting from "./ListFoodTasting";
import PreviewFoodTasting from "./PreviewFoodTasting";

type Props = { foodTokens: number; selectedId: string | null; onSelect: (id: string) => void; onBack: () => void };
/** Uses the authenticated parent's live shared balance. Owns only local viewing/fallback state. */
export default function IndexFood({ foodTokens, selectedId, onSelect, onBack }: Props) {
  const [failedImageIds, setFailedImageIds] = useState<readonly string[]>([]);
  const returnPosition = useRef<{ top: number; id: string | null }>({ top: 0, id: null });
  const view = buildFoodTastingViews(FOOD_CATALOGUE, failedImageIds).find(item => item.id === selectedId);
  useEffect(() => {
    if (!returnPosition.current.id) {
      try {
        const saved = parseFoodReturnPosition(JSON.parse(sessionStorage.getItem(FOOD_RETURN_STORAGE_KEY) ?? "null"));
        if (saved) returnPosition.current = saved;
      } catch { /* Scroll restoration remains in memory when storage is unavailable. */ }
    }
    const frame = window.requestAnimationFrame(() => {
      if (selectedId) document.getElementById("food-tasting-title")?.focus();
      else if (returnPosition.current.id) {
        window.scrollTo({ top: returnPosition.current.top, behavior: "instant" });
        document.getElementById(`food-entry-${returnPosition.current.id}`)?.focus({ preventScroll: true });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selectedId]);
  const failImage = (id: string) => setFailedImageIds(current => current.includes(id) ? current : [...current, id]);
  return <>
    <PreviewFoodRewards foodTokens={foodTokens} intro={view ? undefined : FOOD_COPY.intro} notice={view ? undefined : FOOD_COPY.notice} />
    {view ? <PreviewFoodTasting view={view} backLabel={FOOD_COPY.back} onBack={onBack} onImageError={() => failImage(view.id)} />
      : FOOD_CATALOGUE.length ? <ListFoodTasting items={FOOD_CATALOGUE} failedImageIds={failedImageIds} actionLabel={FOOD_COPY.view} onImageError={failImage}
        onSelect={id => {
          returnPosition.current = { top: window.scrollY, id };
          try { sessionStorage.setItem(FOOD_RETURN_STORAGE_KEY, JSON.stringify(returnPosition.current)); } catch { /* Optional UI preference. */ }
          onSelect(id);
        }} /> : <p>{FOOD_COPY.empty}</p>}
  </>;
}
