/* ============ RIVAL COMPANIES ON THE BOARD AND IN THE FIELD ============ */
/* a company that subcontracts to you is the one you bargain with, so each commander is also a negotiating persona (never drawn at random: PERSONA_STD is the ordinary five) */
Object.assign(PERSONA, {
  cob: { n: 'exact to the letter', pat: 70, pay: .2, salv: .5, honest: 1, hi: 'I hold this paper and cannot staff it. The terms are fair and I have not padded them. Ask what you need to ask.', no: 'No. The figure was fair when I named it.', yes: 'That is reasonable. Amended.', bye: 'Then I will find another company. Cobalt out.' },
  car: { n: 'all showmanship', pat: 60, pay: .5, salv: .35, honest: .55, hi: '{CO}! I am double-booked, and you are my understudy. Do not tell me the fee is small. Tell me you will be magnificent.', no: 'Tsk. Understudies do not renegotiate.', yes: 'Oh, why not. It is only money.', bye: 'I shall find someone with more flair. Ta!' },
  ver: { n: 'counting every crate', pat: 66, pay: .3, salv: .2, honest: .35, hi: 'Jackdaw. I have a job I cannot be bothered with, and you have a mech. Let us not waste each other’s evening.', no: 'Ha. No. I did not get this yard by giving money away.', yes: 'Fine, fine. You are bleeding me, love.', bye: 'Too rich for me. Somebody cheaper will turn up.' },
});
HINT.rival = 'Another mech company has been asking about this one.';
const dealer = c => c.cok === 'sub' && RIV[c.co] ? RIV[c.co].ch : c.contact;
const rivOutfit = () => Math.random() < .55 ? RIV[rivPick()].name : 'Another outfit';
function rivNews() {
  const k = rivPick(), f = FAC[pick(EMPS)].short, s = `${pick(SITE.a)} ${pick(SITE[pick(BIOME_KEYS)])}`;
  return pick({
    cob: [`Cobalt Lance turned down a ${f} contract at ${s} on a point of honour.`, `Cobalt Lance held ${s} for ${f} to the hour agreed, then left.`, `Ferreira has posted bond for a captured ${f} crew. Nobody asked her to.`],
    car: [`The Carnival put on a show at ${s}: three ${f} machines down, footage on sale by morning.`, `Quintero lost a wager at ${s} and paid it in public.`, `${f} has asked the Carnival to stop filming its installations.`],
    ver: [`Verdigris Salvage is selling parts that look a lot like the ones ${f} lost at ${s}.`, `Verdigris were seen leaving ${s} an hour before the ${f} garrison arrived.`, 'Halloran has bought another lifter. Business is good.'],
  }[k]);
}
/* turn an offer on the board into one that involves a company: 'sub' — they hold the paper and pass it down to you; 'joint' — their lance deploys beside yours (share: the cut they take when it was your idea) */
function rivCo(c, k, kind, share = 0) {
  const V = RIV[k], E = FAC[c.emp].short; c.co = k; c.cok = kind; c.twists = c.twists.filter(t => t !== 'rival' && (kind !== 'sub' || t !== 'renege')); delete c.rival; c.intel = c.intel.filter(i => i.k !== 'rival' && i.k !== 'r.rival');
  if (c.type === 'recovery' && c.plot === 'race') { c.plot = pick(TYPES.recovery.plots.filter(p => p !== 'race')); c.intel = c.intel.filter(i => i.k !== 'plot' && i.k !== 'r.plot'); }
  if (kind === 'sub') { c.persona = k; c.pat = PERSONA[k].pat; c.pushes = 0; c.talked = false; c.pay = Math.round(c.pay * .85 / 1000) * 1000; c.upd = 'SUBCONTRACT'; c.brief = `SUBCONTRACT. ${V.name} holds this paper with ${E} and cannot staff it. You would fly it in their name, for their client. ` + c.brief; }
  else {
    if (share) c.share = share; else { c.diff = Math.min(5, c.diff + 1); c.pay = Math.round(c.pay * 1.3 / 1000) * 1000; } c.upd = 'JOINT OP';
    c.brief = (share ? `JOINT OPERATION at your invitation: ${V.name} flies this one beside you for ${Math.round(share * 100)}% of the fee. ` : `JOINT OPERATION. ${E} is paying two companies to be certain: ${V.name} deploys beside you. `) + c.brief;
  }
  CO.dirty = true; return c;
}
/* now and then work comes your way through another company. Never from one you are feuding with, and never more than one offer of each kind on the board */
function rivOffers() {
  for (const kind of ['sub', 'joint']) {
    if (CO.board.some(c => c.cok === kind) || Math.random() > (kind === 'sub' ? .1 : .08)) continue; const ks = RIVS.filter(k => CO.riv[k].rel > -40); if (!ks.length) continue;
    const c = pick(CO.board.filter(c => c !== CO.active && c !== CO.sel && !c.co && !c.story && !c.talked && !c.intel.length && (kind === 'sub' || ['strike', 'garrison', 'escort', 'headhunt'].includes(c.type)))); if (c) rivCo(c, pick(ks), kind);
  }
}
/* an offer loaded from a save: anything about a company that does not add up is dropped rather than trusted */
function rivClean(c) {
  if (!RIV[c.rival]) delete c.rival; if (!RIV[c.co] || (c.cok !== 'sub' && c.cok !== 'joint')) { delete c.co; delete c.cok; delete c.share; }
  if (c.cok === 'sub') c.persona = c.co; else if (!PERSONA_STD.includes(c.persona)) c.persona = 'clerk';
  if (c.share !== undefined) c.share = c.cok === 'joint' && typeof c.share === 'number' && isFinite(c.share) ? clamp(c.share, 0, .5) : 0;
  if (c.co || !c.rival) c.twists = c.twists.filter(t => t !== 'rival'); if (c.co) delete c.rival;
}
/* walking away from signed paper costs you with whoever was counting on it */
function quitCost(c) { if (c.story) return; const why = `walked away from the ${c.site} job`; if (c.cok === 'sub') return rivRel(c.co, -6, why); repAdd(c.emp, -3, why); if (c.cok === 'joint') rivRel(c.co, -4, why); }

/* ---- what each commander says. E the client, F the opposition, W a sum of money ---- */
const RIVL = {
  cob: {
    seen: 'Dropship on the scope in Cobalt Lance colours. That is Ferreira herself — and she is not on our contract.',
    race: E => `{CO}, Cobalt Lance actual. ${E} has issued the same paper twice: I hold a copy, and so do you. I will not pretend otherwise. How do you wish to proceed?`,
    raceO: () => ['May the better company win', 'Share the work — sixty-forty, on my lead', 'This contract is mine. Withdraw'],
    raceGo: 'Then we race, and cleanly. Lance: the objective only. {CO} is not to be touched.', splitOk: 'Accepted, and I will hold to it to the letter. Cobalt forms on your lead.',
    offOk: '...You have earned that much from us. Cobalt is withdrawing. Do not make a habit of asking.', offNo: 'I have a signed contract and no reason to tear it up. We stay. May the better company win.',
    won: 'The field is ours today, {CO}. You flew well. Cobalt out.', lost: 'Cleanly done. The fee is yours — I will say so to anyone who asks. Cobalt out.',
    opp: (E, F) => `{CO}, Cobalt Lance actual. ${F} holds my contract, and it says you do not finish yours. I take no pleasure in it. I offer this courtesy once: withdraw.`,
    oppO: () => ['Then we fight', 'Name your price to walk away', 'We have stood together. Stand down'],
    fight: 'So be it. Lance — weapons free. Fight them clean.', buyNo: 'You mistake me for somebody else. Lance — weapons free.',
    pastOk: '...Yes. We have. I will not fire on a company I have bled beside. Cobalt is returning the fee. We are leaving.', pastNo: 'We have not stood together often enough for that. Weapons free.',
    yield: () => 'Enough. Cobalt strikes its colours — you have the field, {CO}. I ask the customary terms: we walk.', yieldO: () => ['Granted. Go', 'No quarter'],
    spared: 'You have my thanks, and my word that it will be remembered.', doomed: 'Then you are no soldier. Lance — to the last!',
    help: '{CO}, Cobalt actual. We are between contracts and inside your grid. If you want a second lance, say so. Ten percent, and you lead.', helpYes: 'Cobalt is yours for the duration.', helpNo: 'Understood. Good hunting.',
    salv: '{CO}, Cobalt Lance actual. We have a salvage claim filed on this wreck, and I see that you have one too. The registry has made fools of us both. I would rather not fight over a clerk’s mistake.',
    salvO: () => ['Fight them for it', 'Split it fifty-fifty', 'We have stood together. Let me have this one'], salvNo: 'A claim is a claim. But I will share it before I fight you for it: halves, and Cobalt walks you out.',
    subHi: '{CO}, Cobalt actual. My name is on this paper. Fly it as I would: to the letter, and no further.', jHi: 'Cobalt Lance, on station. You have the lead, {CO}. We will hold your flank.',
    jDown: 'Ferreira is down — pilot is out and moving for our dropship. Cobalt’s lance is still with you.',
  },
  car: {
    seen: 'Dropship inbound, and it is painted like a fairground. That is the Carnival. Quintero does not turn up where there is no audience.',
    race: E => `{CO}! What luck — an audience. ${E} has booked two acts for one stage, and I do not open for anybody. Shall we make it interesting?`,
    raceO: (E, F, W) => ['A race, then. Best crew wins', `A wager on it — ${fmt(W)} says I finish first`, 'Get off my stage, clown'],
    raceGo: 'Splendid! Places, everyone. And do try to keep up.', bet: W => `HA! Now it is a show. ${fmt(W)}, witnessed by everybody listening. Carnival — make it beautiful!`,
    offNo: '"Clown." Oh, I was hoping you would say something like that. Carnival! Change of programme — the first act is {CO}.',
    won: 'And THAT is how it is done. Do not sulk, {CO}. You were a wonderful supporting act.', lost: 'Upstaged! On my own tour! ...Well flown, damn you. The Carnival moves on.',
    opp: (E, F) => `{CO}! Tonight the part of the villain is played by me. ${F} is paying, and the script says you lose. But a script is only a suggestion. Entertain me.`,
    oppO: (E, F, W) => ['Then come and take your bow', `Single combat — you and me, ${fmt(W)} on it`, 'We have shared a stage. Sit this one out'],
    fight: 'Curtain up!', duel: W => `A DUEL! Oh, you do know me. Carnival, stand down and watch. ${fmt(W)}, and this one is mine.`,
    pastOk: '...So we have. And it was a good show. Very well: the Carnival is dark tonight. You owe me an encore.', pastNo: 'Darling, I have shared a stage with everyone. Curtain up!',
    yield: () => 'Enough, enough! House lights! A magnificent performance — yours, I admit it. Let me take my bow and go.', yieldO: () => ['Take your bow. Go', 'No encore. Finish it'],
    spared: 'Gracious in victory! They will hear about this in every bar on the rock. I will see to it personally.', doomed: 'You would boo the cast? Philistine! Carnival — finale!', paid: W => `And your winnings, as promised: ${fmt(W)}. I always pay.`,
    help: '{CO}! We were passing, and it looked dull down there without us. Ten percent, and top billing stays yours.', helpYes: 'Then let us give them a show!', helpNo: 'Your loss. Literally. Ta!',
    salv: '{CO}! Two companies, one wreck, and nobody watching. What a waste. I do not share a stage, as you may have heard. So: how shall we settle it?',
    salvO: (E, F, W) => ['Fight them for it', 'Split it fifty-fifty', `Single combat for it — ${fmt(W)} on top`], salvNo: 'Halves? A duet? No, no, no. Carnival — places!',
    subHi: '{CO}! You are wearing my name out there. Do try to be memorable.', jHi: 'The Carnival has arrived! Try to look impressed. After you, {CO} — it is your name on the poster.',
    jDown: 'Quintero is down — he is out of the cockpit and, I think, bowing. His lance is still with you.',
  },
  ver: {
    seen: 'New contact — a dropship in Verdigris green, coming in quiet. Halloran only shows up where there is something to carry away.',
    race: E => `{CO}. Jackdaw, Verdigris. Seems ${E} sold the same job twice — bad form, that. No sense both of us bleeding for one fee, love. What do you say?`,
    raceO: () => ['First to finish takes the fee', 'Go halves — sixty-forty, on my lead', 'Clear off. This one is mine'],
    raceGo: 'Suit yourself. Verdigris — strip it quick.', splitOk: 'There. That was easy. We will be right behind you. Mind the paintwork.',
    offOk: '...That is a lot of machine, and not a scratch on it. Fine. Verdigris, we are leaving. There will be other wrecks.', offNo: 'Bit dented to be giving orders, love. We will stay and see how you get on.',
    won: 'That is the fee, and I thank you for softening them up. No hard feelings, pet.', lost: 'Quick, are you not. Fine — yours. I will bill them for my fuel.',
    opp: (E, F) => `{CO}. Jackdaw. ${F} is paying me to see you go home empty. Nothing personal. But I am a practical woman, and everything has a price.`,
    oppO: (E, F, W) => ['Then earn your fee', `Pay her to leave — ${fmt(W)}`, 'We have worked together. Walk away'],
    fight: 'Pity. Verdigris — take them apart. Carefully. I want the pieces.', buyOk: F => `Pleasure. ${F} will get a very sad report. Verdigris — home.`, buyNo: 'With what, love? Your account is emptier than my conscience. Verdigris — take them apart.',
    pastOk: '...We have, and you paid on time. Fine. I was never here.', pastNo: 'Not well enough, pet.',
    yield: W => `All right — ALL RIGHT. You have made your point. Call it off and I will make it worth your while: ${fmt(W)} to let us limp home.`, yieldO: (E, F, W) => ['Go. Keep your money', `Take the ${fmt(W)} and let them go`, 'No deal. Finish it'],
    spared: '...For nothing? You are a strange one, {CO}. I will not forget it.', paid: () => 'Wired. Robbery — but fair robbery.', doomed: 'Then I hope you choke on the salvage!',
    help: '{CO}. Jackdaw. We are picking over the next valley and it is thin. Want another lance? Ten percent, and first look at the wrecks.', helpYes: 'Lovely. Try not to burn the good bits.', helpNo: 'Suit yourself.',
    salv: '{CO}. Jackdaw. This wreck has my name on it, and yours too by the look of things. Half of something for no work is my favourite number, love. Halves?',
    salvO: () => ['Fight them for it', 'Split it fifty-fifty', 'Bluff: this claim is registered. Leave'], salvNo: '',
    subHi: '{CO}. Jackdaw. That is my paper you are flying. Bring it back tidy and we will do this again.', jHi: 'Verdigris, on the ground. Lead on, love — and leave the big pieces in one lump if you can.',
    jDown: 'Halloran is down — she is out, and already arguing about the salvage. Her lance is still with you.',
  },
};
/* changes of standing with a company during a sortie are settled with the books, like faction standing */
const rvRel = (k, d, why = '') => { const L = MS.relD[k] || (MS.relD[k] = []), e = L.find(e => e[1] === why); if (e) e[0] += d; else L.push([d, why]); };
const rivMat = k => RIV[k].mat || (RIV[k].mat = std({ color: RIV[k].paint.pri, metalness: .5, roughness: .6 }));
/* which of a company's four machines is closest in power to the one you are flying */
function rivTier(k) { const pw = mechPower(player.cfg), R = RIV[k].roster; let b = 0, bd = 1e9; R.forEach((c, i) => { const d = Math.abs(mechPower(c) - pw); if (d < bd) { bd = d; b = i; } }); return b; }
/* a lance: the commander ([0]) in that machine, one or two lancemates a class lighter. Flying beside you they are on your team but keep their own tally (shots owned by 4: see targetsOf and killEnt) */
function rivLance(k, x, z, team, o = {}) {
  const V = RIV[k], t = rivTier(k), n = o.n ?? (MS.on && MS.c.diff >= 3 ? 2 : 1), L = [];
  for (let i = 0; i <= n; i++) {
    const [px, pz] = i ? groundSpot(x, z, 12, 30) : [x, z], e = mkMech(px, pz, { ...V.roster[Math.max(0, t - (i ? 1 : 0))], paint: V.paint }, team, { ai: o.ai || 'hunt', lead: o.lead, yaw: o.yaw, skill: i ? 1.15 : Math.min(1.7, 1.4 + CO.done * .012), hpK: i ? 1.2 : 2, name: i ? `${V.short} ${V.mate} ${i}` : V.call });
    Object.assign(e, { rv: k, rc: V.rgb, rh: V.col, pacify: !!o.pacify }); L.push(e);
  }
  return L;
}
const rivDrop = (k, x, z, team, o) => new Promise(res => { dropship(x, z, () => res(rivLance(k, x, z, team, o)), undefined, team, rivMat(k)); });
const rivWhole = () => P.armor > P.max * .7;
/* a lance that has turned on you (o.duel: only the commander fights, the rest watch). The commander strikes colours at a third of their armour; what you do next is what every company remembers */
async function rivFight(ms, k, L, o = {}) {
  const V = RIV[k], ch = V.ch, T = RIVL[k], boss = L[0], c = ms.c, E = FAC[c.emp].short, F = FAC[c.foe].short, W = Math.round(c.pay * .1 / 1000) * 1000, at = `at ${c.site}`;
  setTeam(o.duel ? [boss] : L, 1, { pacify: false, alert: true, ai: 'hunt' }); nav('rv', boss, V.short, V.col); note(o.duel ? `You fought ${ch.name} in single combat.` : `You fought ${V.name} ${at}.`);
  for (const e of L) e.onKill = (x, owner) => { if (owner === 0) rvRel(k, x === boss ? -5 : -2, `shot down their machines ${at}`); };
  await until(() => boss.dead || boss.hp < boss.max * .36);
  if (boss.dead) { unnav('rv'); leave(L); say(ms.ops, `${ch.last} has punched out. What is left of ${V.name} is pulling back.`); return note(`${ch.name} was shot down and ejected.`); }
  for (const e of L) if (!e.dead) Object.assign(e, { team: 2, pacify: true, inv: true, tgt: null, tT: 0, ai: 'hold' });
  const r = await ask(ch, T.yield(W), T.yieldO(E, F, W), 20, 0), kill = r === T.yieldO(E, F, W).length - 1; for (const e of L) e.inv = false;
  if (!kill) {
    unnav('rv'); leave(L); if (r === 1) { bonus(`${ch.last}'s ransom`, W); say(ch, T.paid(W)); rvRel(k, 1, `took a ransom to let them go ${at}`); note(`${V.name} paid ${fmt(W)} to be let go.`); }
    else { say(ch, T.spared); rvRel(k, k === 'cob' ? 10 : 8, `let them walk when they yielded ${at}`); note(`${V.name} yielded and you let them walk.`); }
    if (o.duel && o.bet) { bonus(`Wager with ${ch.last}`, o.bet); if (T.paid) say(ch, T.paid(o.bet)); rvRel(k, 4, 'a duel won fairly'); }
    return;
  }
  say(ch, T.doomed); setTeam(L, 1, { pacify: false, alert: true, ai: 'hunt', skill: 1.7 }); nav('rv', boss, V.short, '#ff5a1f'); rvRel(k, k === 'cob' ? -24 : k === 'car' ? -20 : -16, `fired on them after they yielded ${at}`); note(`${V.name} yielded. You gave no quarter.`);
  for (const q of RIVS) if (q !== k) rvRel(q, -4, `word got round about ${V.name} ${at}`);
  boss.onKill = () => { unnav('rv'); news(`${YARD.name} shot down ${ch.name} after ${V.name} had struck its colours ${at}.`); };
}

/* ---- the twist: another company turns up on your contract. Friends offer a hand; otherwise they hold the same paper as you (a race) or the other side's (a fight, unless you can talk your way out of it) ---- */
TWISTS.rival = async function (ms) {
  const c = ms.c, k = c.rival; if (!RIV[k] || c.co || (c.type === 'recovery' && c.plot === 'race')) return; const V = RIV[k], ch = V.ch, T = RIVL[k], R = CO.riv[k], E = FAC[c.emp].short, F = FAC[c.foe].short, t0 = rand(40, 75), W = Math.round(c.pay * .14 / 1000) * 1000, at = `at ${c.site}`;
  await until(() => near(ms.A, 270) || ms.t > t0); await after(rand(3, 9)); if (ms.jam) return;
  const live = t => !t.dead && t.team === 1, goals = () => (c.type === 'strike' ? ms.navs.filter(n => /^t\d$/.test(n.id)) : c.type === 'headhunt' ? ms.navs.filter(n => n.id === 'a') : []).map(n => n.pos).filter(t => !t.isVector3 && live(t));
  const mode = R.rel >= 35 && Math.random() < .65 ? 'help' : goals().length ? 'race' : 'opp'; say(ms.ops, mode === 'help' ? `Friendly dropship inbound — ${V.name}. ${ch.last} is asking for you by name.` : T.seen);
  const [x, z] = mode === 'race' ? groundSpot(ms.A.x, ms.A.z, 80, 120) : groundSpot(P.pos.x, P.pos.z, mode === 'help' ? 60 : 110, mode === 'help' ? 90 : 150), L = await rivDrop(k, x, z, 2, { ai: 'hold', pacify: true }), boss = L[0];
  nav('rv', boss, V.short, V.col); await after(1.5);
  if (mode === 'help') {
    const r = await ask(ch, T.help, ['Form on me — ten percent', 'We have this one'], 18, 1); unnav('rv');
    if (r === 0) { ms.payK *= .9; setTeam(L, 0, { ai: 'follow', lead: PE, pacify: false }); say(ch, T.helpYes); rvRel(k, 2, `flew beside you ${at}`); note(`${V.name} joined you for a tenth of the fee.`); } else { say(ch, T.helpNo); leave(L); }
    return;
  }
  if (mode === 'race') {
    let r = await ask(ch, T.race(E), T.raceO(E, F, W), 20, 0), bet = 0; const tg = goals(), n = tg.length || 1;
    if (r === 1 && k === 'car') { bet = W; say(ch, T.bet(W)); note(`You bet ${ch.last} ${fmt(W)} that you would finish first.`); r = 0; }
    else if (r === 1) { ms.payK *= .6; setTeam(L, 0, { ai: 'follow', lead: PE, pacify: false }); unnav('rv'); say(ch, T.splitOk); rvRel(k, 3, `shared the work ${at}`); return note(`You split the ${c.site} contract with ${V.name}.`); }
    else if (r === 2) {
      if (k === 'car') { say(ch, T.offNo); rvRel(k, -3, `told them to leave ${at}`); return rivFight(ms, k, L); }
      if (k === 'cob' ? R.rel >= 15 : rivWhole()) { say(ch, T.offOk); unnav('rv'); leave(L); rvRel(k, -2, `made them give up the ${c.site} contract`); return note(`${V.name} withdrew when you told them to.`); }
      say(ch, T.offNo); rvRel(k, -2, `told them to leave ${at}`);
    } else say(ch, T.raceGo);
    /* the race: they go for the same objective, and whatever they take the client does not pay you for */
    say(ms.hnd, 'Two crews on one fee, mercenary. I pay for what you destroy. Not for what they do.'); setTeam(L, 0, { ai: 'hunt', pacify: false, alert: true }); note(`You raced ${V.name} for the ${c.site} contract.`);
    let mine = 0, theirs = 0, on = true; const seen = new Set();
    FD.tick.push(() => {
      if (ms.over || !on) return false;
      for (const t of tg) if (!seen.has(t) && !live(t)) { seen.add(t); if (!t.dead) continue; if (t.by === 4) { theirs++; ms.payK *= c.type === 'strike' ? 1 - .6 / n : .5; msg(`${V.short} CLAIMS ${c.type === 'strike' ? 'A TARGET' : 'THE KILL'}`, 3); } else mine++; }
      for (const e of L) if (!e.dead && (!e.focus || !live(e.focus))) e.focus = tg.filter(live).sort((a, b) => a.pos.distanceTo(e.pos) - b.pos.distanceTo(e.pos))[0] || null;
      return true;
    });
    await until(() => !tg.some(live) || !alive(L)); on = false; unnav('rv'); const any = mine + theirs > 0, won = mine >= theirs;
    if (!alive(L)) return note(`${V.name} lost their lance to ${F} during the race.`);
    if (theirs) note(`${V.name} took ${theirs} of ${n} ${c.type === 'strike' ? 'targets' : 'kills'} ahead of you.`);
    if (bet && any) { bonus(`Wager with ${ch.last}`, won ? bet : -bet); rvRel(k, won ? 4 : 2, 'a wager honoured'); } else if (!bet) rvRel(k, 1, `a clean race ${at}`);
    if (!boss.dead && any) say(ch, won ? T.lost : T.won); leave(L); return;
  }
  /* hired by the other side */
  const price = Math.round(c.pay * .16 / 1000) * 1000, r = await ask(ch, T.opp(E, F), T.oppO(E, F, k === 'ver' ? price : W), 20, 0), past = R.rel >= { cob: 10, car: 25, ver: 20 }[k];
  if (r === 2 && past) { say(ch, T.pastOk); unnav('rv'); leave(L); rvRel(k, -2, `stood down for you ${at}`); return note(`${V.name} stood down rather than fight you.`); }
  if (r === 1 && k === 'ver' && CO.cb >= price) { bonus(`Paid off ${V.name}`, -price); say(ch, T.buyOk(F)); unnav('rv'); leave(L); rvRel(k, 2, `did business ${at}`); return note(`You paid ${V.name} ${fmt(price)} to go home.`); }
  if (r === 1 && k === 'car') { say(ch, T.duel(W)); return rivFight(ms, k, L, { duel: true, bet: W }); }
  if (r === 1 && k === 'cob') rvRel(k, -4, `tried to buy them off ${at}`);
  say(ch, r === 2 ? T.pastNo : r === 1 ? T.buyNo : T.fight); return rivFight(ms, k, L);
};
/* recovery, plot 'race': another company has filed for the same wreck and got there first */
async function rivSalvage(ms) {
  const c = ms.c, A = ms.A, k = RIV[c.rival] ? c.rival : rivPick(), V = RIV[k], ch = V.ch, T = RIVL[k], R = CO.riv[k], E = FAC[c.emp].short, F = FAC[c.foe].short, W = Math.round(c.pay * .14 / 1000) * 1000, at = `at ${c.site}`;
  const L = rivLance(k, ...groundSpot(A.x, A.z, 30, 55), 2, { ai: 'guard', pacify: true }); await until(() => near(A, 200)); nav('rv', L[0], V.short, V.col);
  const r = await ask(ch, T.salv, T.salvO(E, F, W), 18, 1), ally = () => { ms.payK *= .5; unnav('rv'); setTeam(L, 0, { ai: 'follow', lead: PE, pacify: false }); rvRel(k, 3, `shared the salvage ${at}`); note(`You split the salvage with ${V.name}.`); };
  if (r === 1 && k !== 'car') { say(ch, T.splitOk); return ally(); }
  if (r === 2 && k === 'cob') { if (R.rel >= 15) { say(ch, T.offOk); unnav('rv'); leave(L); rvRel(k, -2, `gave up their salvage claim ${at}`); return note(`${V.name} gave up the claim for old times’ sake.`); } say(ch, T.salvNo); return ally(); }
  if (r === 2 && k === 'ver' && rivWhole()) { say(ch, T.offOk); unnav('rv'); leave(L); rvRel(k, -2, `bluffed off their claim ${at}`); return note(`You bluffed ${V.name} off the claim.`); }
  if (r === 2 && k === 'car') { say(ch, T.duel(W)); rivFight(ms, k, L, { duel: true, bet: W }); return; }
  say(ch, r === 1 ? T.salvNo : r === 2 ? T.offNo : T.fight); rivFight(ms, k, L);
}
/* a joint operation: their lance deploys with you and follows your lead. Somewhere in the middle, each commander is true to type */
async function rivJoint(ms) {
  const c = ms.c, k = c.co, V = RIV[k], ch = V.ch, T = RIVL[k], E = FAC[c.emp].short, L = rivLance(k, P.pos.x - 16, P.pos.z + 10, 0, { ai: 'follow', lead: PE, yaw: P.yaw, n: c.diff >= 4 ? 2 : 1 }), boss = L[0], at = `at ${c.site}`; ms.v.joint = L;
  boss.onKill = () => { say(ms.ops, T.jDown); note(`${ch.name} was shot down flying beside you.`); };
  await after(5); say(ch, T.jHi); await after(rand(60, 100)); await until(() => !FD.t0.some(e => e.team === 1 && e.kind !== 'struct' && e.pos.distanceTo(P.pos) < 150) || ms.t > 200); if (boss.dead) return;
  if (k === 'cob') {
    const r = await ask(ch, `{CO}. Two of their crews have ejected in front of my guns and are walking out with their hands up. ${E} wants no survivors. I intend to let them go — and I would like your word that we saw nothing.`, ['You have my word', `No. ${E} hears about this`], 20, 0);
    if (r === 0) { say(ch, 'Thank you. That is the kind of thing I remember.'); rvRel(k, 6, `kept quiet about the prisoners ${at}`); rep(c.foe, 2); note(`${ch.last} let enemy crews go. You said nothing.`); }
    else { say(ch, 'Then we understand each other. I am sorry for it.'); rvRel(k, -10, `reported her to ${E}`); rep(c.emp, 3); bonus(`${E} informant’s fee`, 8000); note(`You reported ${ch.last} to ${E} for sparing prisoners.`); }
  } else if (k === 'car') {
    const amt = 12000, r = await ask(ch, `{CO}! A little side bet, to keep the band awake. ${fmt(amt)} to whichever of us drops more of them between now and the dropship. Are you in?`, ['You are on', 'I do not gamble on a contract'], 20, 1);
    if (r === 0) { ms.v.bet = { k, p0: P.kills, r0: ms.v.rvk || 0, amt }; say(ch, 'Marvellous! Counting from... now.'); note(`You took ${ch.last}'s bet on the kill count.`); } else { say(ch, 'How very dull of you.'); rvRel(k, -2, 'turned down a wager'); }
  } else {
    const amt = 14000, r = await ask(ch, `{CO}. Quiet word. One of these wrecks was a paymaster’s carrier. The strongbox is whole, and it is on nobody’s manifest. Halves — and ${E} never hears of it?`, ['Halves. I saw nothing', `It belongs to ${E}. Report it`, 'All of it, or I report you'], 20, 0);
    if (r === 0) { bonus('Off the manifest', amt); ms.v.graft = amt; say(ch, 'Knew I liked you.'); rvRel(k, 5, `went halves on a strongbox ${at}`); note(`You and ${ch.last} split a strongbox that was on nobody's manifest.`); }
    else if (r === 1) { bonus(`${E} finder’s fee`, 5000); rep(c.emp, 4); say(ch, 'Honest. How disappointing.'); rvRel(k, -9, `reported her strongbox to ${E}`); note(`You reported the strongbox to ${E}.`); }
    else if (Math.random() < .5) { bonus('Off the manifest — all of it', amt * 2); ms.v.graft = amt * 2; say(ch, '...You are a worse thief than I am. Take it.'); rvRel(k, -12, `robbed her of a strongbox ${at}`); note(`You took the whole strongbox from ${ch.last}.`); }
    else { say(ch, 'Report away, love. Who do you think they will believe — the one holding the box, or the one who is not?'); rvRel(k, -6, `tried to rob her ${at}`); }
  }
}
/* the books: wagers, side deals, shares, and what the sortie did to your standing with any company involved */
function rivSettle(c, ok, D, add, base) {
  const v = MS.v;
  if (v.bet) { const b = v.bet, mine = P.kills - b.p0, theirs = (v.rvk || 0) - b.r0; if (mine !== theirs) add(`Wager with ${RIV[b.k].name} — ${mine} kills to ${theirs}`, mine > theirs ? b.amt : -b.amt); else D.log.push(`The wager with ${RIV[b.k].name} came out even at ${mine} apiece. No money moved.`); rvRel(b.k, mine > theirs ? 3 : 2, 'a wager honoured'); }
  if (v.graft && ok && Math.random() < .33) { add('Clawback — unlisted salvage', -v.graft); rep(c.emp, -6); D.log.push(`${FAC[c.emp].short} found out about the strongbox.`); }
  if (!c.co || !RIV[c.co]) return; const V = RIV[c.co], at = `at ${c.site}`;
  if (c.cok === 'joint') { if (ok && c.share) add(`${V.name}'s ${Math.round(c.share * 100)}% share`, -Math.max(0, base) * c.share); rvRel(c.co, ok ? 5 + c.diff : MS.abort ? -8 : -4, ok ? `fought beside them ${at}` : `the joint operation ${at} failed`); }
  else if (ok && MS.payer !== c.emp) rvRel(c.co, -14, `sold out their client ${at}`);
  else rvRel(c.co, ok ? 7 + c.diff : MS.abort ? -14 : -10, ok ? `flew their subcontract ${at}` : MS.abort ? `abandoned their subcontract ${at}` : `failed their subcontract ${at}`);
}
