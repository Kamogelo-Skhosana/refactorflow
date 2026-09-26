export function analyzeTape(tape, submittedCode) {
  const writtenTape = String(tape || "");
  const finalCode = String(submittedCode || "");
  const matchIndex = finalCode ? writtenTape.indexOf(finalCode) : -1;
  const firstCorrectPosition = matchIndex === -1 ? null : matchIndex;

  return {
    totalCharsWritten: writtenTape.length,
    finalCodeLength: finalCode.length,
    rewriteRatio: finalCode.length ? writtenTape.length / finalCode.length : 0,
    wasCloseEarly: firstCorrectPosition !== null && firstCorrectPosition < writtenTape.length * 0.4,
    firstCorrectPosition,
  };
}

