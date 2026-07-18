export function computeThrashingIndex(state) { const rawThrash = (state.backspaceCount / Math.max(state.keystrokeCount, 1)) * 100; const panicPenalty = state.pauseEvents.filter((event) => event.type === "panic").length * 5; const thoughtfulBonus = state.pauseEvents.filter((event) => event.type === "thoughtful").length * 2; return Math.min(Math.max(Math.round(rawThrash + panicPenalty - thoughtfulBonus), 0), 100); }
export function classifyThrashingIndex(score) { return score <= 25 ? "clean" : score <= 60 ? "moderate" : "heavy"; }

