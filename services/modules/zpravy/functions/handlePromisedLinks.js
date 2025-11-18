module.exports = async (promised, toReCheck) => {
  // použij for...of místo forEach, aby šel await
  for (const e of promised) {
    if (!toReCheck.includes(e.stringToCheck)) {
      toReCheck.push(e.stringToCheck);
    }
    // pokud je e.send async (Discord zprávy), čekej na něj
    await e.send();
  }

  const allStrings = promised.map(e => e.stringToCheck);

  // kontrola, že všechno co je v toReCheck, je i v promised
  if (!toReCheck.every(el => allStrings.includes(el))) {
    throw new Error("Failed to get all toReCheck");
  }
};
