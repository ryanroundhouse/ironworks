/* ============ SORTIE GUARD ============ */
/* A contract being flown exists only in this page: the save keeps the company, not the sortie, so a page that is left mid-sortie comes back in the bay. From launch until the debrief has settled
   the books the page therefore will not be left by accident. Back (a mouse's side button, a trackpad swipe, Alt+Left) lands on a history entry of the sortie's own and pauses the fight instead;
   the side buttons are swallowed outright where the browser allows it; and anything else that would unload the page (reload, closing the tab, a typed address) asks first.
   The proving ground has nothing to lose and is not guarded. SGUARD.ask false leaves out the question on unload (the debug build does, so the test drivers can navigate). */
const SGUARD = { on: false, ask: true, wT: 0 };
/* H withdraws. With a contract still running that abandons it, so the first press only asks and a second within four seconds goes; once the contract is over, or in the proving ground, one press goes */
function withdrawKey() {
  if (mode !== 'field' || P.leaving) return;
  if (!MS.on || MS.over || SGUARD.wT > T) { SGUARD.wT = 0; return toHangar(); }
  SGUARD.wT = T + 4; sfx.play('deny'); msg('ABANDON THE CONTRACT? PRESS H AGAIN TO WITHDRAW', 4); POST.kick();
}
function sortieGuard(on) {
  if (on === SGUARD.on) return; SGUARD.on = on;
  try {
    if (on) { if (!(history.state && history.state.sortie)) history.pushState({ sortie: 1 }, ''); }
    else if (history.state && history.state.sortie) history.back();   /* the page's own entry again; the popstate that follows finds the guard off */
  } catch (e) { }
}
addEventListener('popstate', () => {
  if (!SGUARD.on) return;
  try { history.pushState({ sortie: 1 }, ''); } catch (e) { }
  if (mode === 'field' && !P.leaving) { if (locked && fieldUnlock) fieldUnlock(); msg('BACK IS OFF DURING A SORTIE — WITHDRAW FROM HERE IF YOU MEANT IT', 5); POST.kick(); }
});
for (const k of ['mousedown', 'mouseup', 'auxclick']) addEventListener(k, e => { if (SGUARD.on && (e.button === 3 || e.button === 4)) e.preventDefault(); }, true);
addEventListener('beforeunload', e => { if (SGUARD.on && SGUARD.ask) { e.preventDefault(); e.returnValue = ''; } });
