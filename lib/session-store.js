import { create } from "zustand";

const initial = { exerciseId: null, code: "", tape: "", rawEvents: [], startedAt: null, keystrokeCount: 0, backspaceCount: 0, pauseEvents: [], lastKeystrokeAt: null, hintsRevealed: [] };

export const useSessionStore = create((set, get) => ({ ...initial,
  initSession: (exerciseId, starterCode) => { const startedAt = Date.now(); set({ ...initial, exerciseId, code: starterCode, tape: starterCode, startedAt, lastKeystrokeAt: startedAt, rawEvents: [...starterCode].map((char) => ({ char, ts: 0 })) }); },
  onEditorChange: (newValue, prevValue) => { const state = get(); const now = Date.now(); const added = newValue.length > prevValue.length ? newValue.slice(prevValue.length) : ""; const deleted = Math.max(prevValue.length - newValue.length, 0); const replacement = newValue.length === prevValue.length && newValue !== prevValue ? 1 : 0; const events = added ? [...added].map((char) => ({ char, ts: now - (state.startedAt || now) })) : replacement ? [{ char: newValue.slice(-1), ts: now - (state.startedAt || now) }] : []; set({ code: newValue, tape: state.tape + added + (replacement ? newValue.slice(-1) : ""), rawEvents: [...state.rawEvents, ...events], keystrokeCount: state.keystrokeCount + added.length + replacement, backspaceCount: state.backspaceCount + deleted + replacement, lastKeystrokeAt: now }); },
  recordPause: (duration) => set((state) => ({ pauseEvents: [...state.pauseEvents, { duration, ts: Date.now() - (state.startedAt || Date.now()), type: duration < 8000 ? "thoughtful" : "panic" }], lastKeystrokeAt: Date.now() })),
  revealHint: (index) => set((state) => ({ hintsRevealed: state.hintsRevealed.includes(index) ? state.hintsRevealed : [...state.hintsRevealed, index] })),
  reset: () => set(initial),
}));

