// Deterministic checking of bounded answers [spec 12]. Open questions must be answered but
// score nothing; no model is ever consulted here.

import type { Question } from "./types.ts";

// Case, spacing and dash variants of the same identifier compare equal ("il inl ybz 0024 009").
export function normalise(text: string): string {
  return text.normalize("NFKC").toUpperCase().replace(/[\s‐-―_-]+/g, "").trim();
}

export function isAnswered(question: Question, answer: string[] | undefined): boolean {
  if (!answer || answer.length === 0) return false;
  if (question.kind === "text") return answer[0].trim().length > 0;
  const ids = new Set(question.options.map((option) => option.id));
  return answer.every((id) => ids.has(id)) && (question.multiple || answer.length === 1);
}

export function scoreQuestion(question: Question, answer: string[]): number {
  if (question.kind === "text") {
    if (question.accepted.length === 0) return 0;
    const given = normalise(answer[0] ?? "");
    return question.accepted.some((accepted) => normalise(accepted) === given) ? question.points : 0;
  }
  const chosen = [...new Set(answer)].sort();
  const correct = [...question.correct].sort();
  return chosen.length === correct.length && chosen.every((id, i) => id === correct[i]) ? question.points : 0;
}

export function maxPoints(questions: Question[]): number {
  return questions.reduce((sum, question) => sum + question.points, 0);
}

// Which help to show after a number of wrong answers: none, then each hint in turn (the last
// one stays), and the guide's override from `guideAfter` misses on, so nobody is stuck.
export function helpAfterMisses<T>(hints: readonly T[], guideAfter: number, misses: number): { hint: T | null; guide: boolean } {
  const hint = misses <= 0 || hints.length === 0 ? null : hints[Math.min(misses, hints.length) - 1];
  return { hint, guide: misses >= guideAfter };
}
