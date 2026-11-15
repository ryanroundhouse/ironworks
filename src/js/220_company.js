/* ============ COMPANY: FACTIONS, LEDGER, PROCEDURAL CONTRACT BOARD ============ */
const FAC = {
  hel: { name: 'Helion Combine', short: 'HELION', col: '#5fd8ff', paint: 2 },
  kar: { name: 'Karsk Directorate', short: 'KARSK', col: '#ff6a4a', paint: 3 },
  tyr: { name: 'Tyr Free League', short: 'TYR', col: '#8dff6a', paint: 0 },
  ord: { name: 'Ordo Ferrum', short: 'ORDO', col: '#c9a0ff', paint: 5 },
  vom: { name: 'Vance-Okoro Mining', short: 'V-O MINING', col: '#ffb21a', paint: 4 },
  maw: { name: 'Red Maw Reavers', short: 'RED MAW', col: '#ff3a2a', paint: 1 },
};
const EMPS = ['hel', 'kar', 'tyr', 'ord', 'vom'];
const fmt = n => (n < 0 ? '−' : '') + '¢' + Math.abs(Math.round(n)).toLocaleString('en-US');
