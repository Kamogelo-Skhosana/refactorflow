import { create } from "zustand";

const initial = { exerciseId: null, code: "", tape: "", rawEvents: [], startedAt: null, keystrokeCount: 0, backspaceCount: 0, pauseEvents: [], lastKeystrokeAt: null, hintsRevealed: [] };

export function getEditorChange(previousValue = "", nextValue = "") {
  let start = 0;
  const previous = String(previousValue);
  const next = String(nextValue);

  while (start < previous.length && start < next.length && previous[start] === next[start]) {
    start += 1;
  }

  let previousEnd = previous.length - 1;
  let nextEnd = next.length - 1;
  while (previousEnd >= start && nextEnd >= start && previous[previousEnd] === next[nextEnd]) {
    previousEnd -= 1;
    nextEnd -= 1;
  }

  return {
    inserted: next.slice(start, nextEnd + 1),
    deleted: Math.max(previousEnd - start + 1, 0),
  };
}

export const useSessionStore = create((set, get) => ({ ...initial,
  initSession: (exerciseId, starterCode) => { const startedAt = Date.now(); set({ ...initial, exerciseId, code: starterCode, tape: starterCode, startedAt, lastKeystrokeAt: startedAt, rawEvents: [...starterCode].map((char) => ({ char, ts: 0 })) }); },
  onEditorChange: (newValue, prevValue) => { const state = get(); const now = Date.now(); const { inserted, deleted } = getEditorChange(prevValue, newValue); const events = [...inserted].map((char) => ({ char, ts: now - (state.startedAt || now) })); set({ code: newValue, tape: state.tape + inserted, rawEvents: [...state.rawEvents, ...events], keystrokeCount: state.keystrokeCount + inserted.length, backspaceCount: state.backspaceCount + deleted, lastKeystrokeAt: now }); },
  recordPause: (duration) => set((state) => ({ pauseEvents: [...state.pauseEvents, { duration, ts: Date.now() - (state.startedAt || Date.now()), type: duration < 8000 ? "thoughtful" : "panic" }], lastKeystrokeAt: Date.now() })),
  revealHint: (index) => set((state) => ({ hintsRevealed: state.hintsRevealed.includes(index) ? state.hintsRevealed : [...state.hintsRevealed, index] })),
  reset: () => set(initial),
}));

