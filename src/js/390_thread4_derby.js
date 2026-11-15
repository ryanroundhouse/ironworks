/* ============ STORY THREAD 4 — THE IRON DERBY: AN ILLEGAL RACE, A STOLEN MACHINE, AND A CHAMPION WHO HAS NEVER ONCE WON IT FAIRLY ============ */
Object.assign(CAST, { 9161: { build: 'broad', h: 1.62, habit: 'hips', ...stLook('#e8e8e8', 0, 'scar') }, 9163: { build: 'slim', h: 1.88, habit: 'back' }, 9171: stLook('#1b1b1b', 2, 'headset'), 9175: stLook('#e8e8e8', 1, 'beard') });
const DB_BARON = { pri: 0x17171b, sec: 0xe8e0c8, acc: 0xc9a227, glow: 0xffe9a0 };
const ST_MAGPIE = { name: 'MAGPIE', role: 'RACER', legs: 'rap', torso: 'pod', head: 'arr', armL: 'pls', armR: 'las', back: 'jet' };   /* Rook built her. When the Derby is won she flies her again */
const DB_WHO = {
  sable: { name: 'Sable', first: 'Sable', last: 'Sable', role: "IRON DERBY · THE BARON'S SECOND", seed: 9167, col: '#c9c2ae' },
  brute: { name: 'Brute', first: 'Brute', last: 'Brute', role: "IRON DERBY · THE BARON'S OTHER SECOND", seed: 9169, col: '#c9c2ae' },
  kid: { name: 'Kid Okoro', first: 'Kid', last: 'Okoro', role: 'IRON DERBY · CAR 22', seed: 9171, col: '#7fffd4' },
  deuce: { name: 'Deuce Marlowe', first: 'Deuce', last: 'Marlowe', role: 'IRON DERBY · CAR 2', seed: 9173, col: '#c0a0ff' },
  tom: { name: 'Old Tom Pruitt', first: 'Old Tom', last: 'Pruitt', role: 'IRON DERBY · CAR 40', seed: 9175, col: '#b8b8a0' },
};
const DB_CAR = {
  liz: { name: 'TIN LIZZIE', role: 'RACER', legs: 'bip', torso: 'bas', head: 'can', armL: 'claw', armR: 'acn', back: 'snk', paint: { pri: 0xd8742a, sec: 0x4a3a2a, acc: 0xf2e2b0, glow: 0xffb21a } },
  sable: { name: 'SABLE', role: 'RACER', legs: 'rap', torso: 'pod', head: 'vis', armL: 'las', armR: 'las', back: 'jet', paint: DB_BARON },
  brute: { name: 'BRUTE', role: 'RACER', legs: 'hvy', torso: 'jug', head: 'skl', armL: 'claw', armR: 'acn', back: 'plt', paint: DB_BARON },
  kid: { name: 'CAR 22', role: 'RACER', legs: 'rap', torso: 'pod', head: 'can', armL: 'las', armR: 'claw', back: 'jet', paint: { pri: 0x2a9d8f, sec: 0xf4f1de, acc: 0xe76f51, glow: 0x7fffd4 } },
  deuce: { name: 'CAR 2', role: 'RACER', legs: 'bip', torso: 'bas', head: 'vis', armL: 'acn', armR: 'las', back: 'snk', paint: { pri: 0x6a4c93, sec: 0x22223b, acc: 0xf2e9e4, glow: 0xc0a0ff } },
  tom: { name: 'CAR 40', role: 'RACER', legs: 'quad', torso: 'bas', head: 'dom', armL: 'claw', armR: 'claw', back: 'plt', paint: { pri: 0x7a7a62, sec: 0x3a3a30, acc: 0xd0c890, glow: 0xfff0a0 } },
  mag: { ...ST_MAGPIE, paint: DB_BARON },
};
/* a track mine: it blinks, it can be shot, it can be jumped, and it does not care who planted it */
function stMine(p) {
  const g = grp(FD.scene, p.x, heightAt(p.x, p.z), p.z), lamp = glowMat(0xff2a12, 4); cyl(g, M.dark, 1.5, 2, .7, 0, .35, 0, 0, 0, 0, 10); cyl(g, M.hazard, 1.1, 1.1, .2, 0, .8, 0, 0, 0, 0, 10); noShadow(sph(g, lamp, .5, 0, 1.2, 0));
  const e = { kind: 'drone', team: 1, name: 'TRACK MINE', obj: g, pos: g.position, cy: .9, r: 2.8, hp: 12, max: 12, blast: 15, update() { lamp.emissiveIntensity = Math.sin(MS.t * 9) > 0 ? 5 : 1; if (!P.dead && !P.air && stDist(P.pos, e.pos) < 7.5) killEnt(e, 1); } };
  FD.ents.push(e); return e;
}
const stMines = (gate, from, n = 5, back = 46, gap = 9) => { const a = stAng(gate, from), c = stOff(gate, a, back), out = []; for (let i = 0; i < n; i++) { const o = (i - (n - 1) / 2) * gap; out.push(stMine({ x: c[0] + Math.cos(a) * o, z: c[1] - Math.sin(a) * o })); } return out; };
/* the grid forms, the lights count down, and they are off */
async function stGridUp(R, n) {
  const at = R.slot(n); nav('grid', at, 'YOUR SLOT', '#ffb21a'); setObj('grid', 'Take your place on the grid'); await until(() => near(at, 15)); unnav('grid'); setObj('grid', null, 1);
  for (const k of ['3', '2', '1']) { msg(k, 1); sfx.play('ui'); await after(1); } R.go();
}
const dbBank = R => { for (const c of R.cars) if (c.e.team === 2 && Array.isArray(c.st)) { const s = R.secs(c); if (s > 0) c.st = c.st.map(v => Math.max(v, s)); } };   /* a pilot who leaves the course for something else gives the field the time: every car in front keeps the lead it gained */
const dbBy = R => { if (!R.on) return ''; const [a, b] = R.by(), s = [a && `▲ ${a.c.e.name} ${Math.round(a.g)} m`, b && `▼ ${b.c.e.name} ${Math.round(-b.g)} m`].filter(Boolean); return s.length ? '<br>' + s.join(' · ') : ''; };
const dbBoard = (R, laps) => (MS.v.R = R, setObj)('r', () => R.fin ? `Finished — ${R.ord(R.fin)}` : `${R.ord(R.place())} of ${R.cars.filter(c => !c.e.dead).length + 1} · lap ${R.lap()}/${laps} · ${R.home() ? 'run to the flag' : 'gate ' + (R.me % R.N + 1)}${dbBy(R)}`);
/* the race, called from the pit wall: that nobody can be dropped, the last lap, the front of the grid going for the line, and the gate where they have nothing left. A line may be a function, or missing */
const dbCall = (R, who, L) => { const go = () => !R.fin && !MS.over, line = i => { const t = typeof L[i] === 'function' ? L[i]() : L[i]; if (t && go()) chatter(who, t); }; (async () => {
  await until(() => !go() || R.me >= 2); line(0); await until(() => !go() || R.me >= R.total - R.N); line(1); await until(() => !go() || R.late() > .3); line(2);
  await until(() => !go() || R.home()); if (go()) { for (let i = commQ.length - 1; i >= 0; i--) if (commQ[i].chat) commQ.splice(i, 1); msg('LAST GATE — SPRINT FOR THE FLAG', 3.5); sfx.play('alarm'); const st = player.stats;
    if (sprintFor(st, FD.coolK * (P.coolK || 1)) * (100 - P.heat) / 100 < R.left(P.pos, R.me) / (st.speed * RUN * 1.45)) chatter(who, "LAST GATE! She won't sprint all of that without shutting down, boss. Go, and let off when she warns you, or you'll be standing still when they come by!"); else line(3); }   /* nothing that was waiting to be said is worth being late with this */
})(); };
const dbBet = (stake, mult, won, what) => { if (!stake) return; if (won) stPay(`Calloway pays out: ${what}`, stake * mult); else stPay(`Calloway keeps your stake: ${what}`, -stake); };
/* a racer stops racing and starts shooting */
const dbHot = (c, focus = PE) => { if (!c || c.e.dead) return; Object.assign(c.e, { team: 1, pacify: false, alert: true, inv: false, focus }); };
STORY.derby = {
  name: 'THE IRON DERBY', sub: 'No rules worth the name, and one of those is for sale', col: '#ffb21a', emp: 'tyr', foe: 'maw', who: PILOTS[0].ch, forN: 'Rook', vsN: 'The grid', payer: 'DERBY APPEARANCE MONEY',
  open: () => CO.done >= 2, wait: 10, flags: ['pot', 'liz', 'pole', 'clean', 'mag'],
  fin: 'The Iron Derby has a new champion, the first in nine years who is not Baron Viktor Drescher. The Baron is said to be taking the result badly, and on foot.',
  end: 'Rook has her machine back. She has repainted it twice already and is thinking about a third.',
  ch: [{
    /* ---------------- I ---------------- */
    title: 'The Qualifier', kind: 'recon', biome: 'desert', mood: 0, seed: 94011, diff: 2, pay: 40000, salv: 20, site: 'the Kessrin Flats', op: 'GREEN FLAG',
    tease: 'The Iron Derby is the oldest illegal race in the sector: mechs, flat out, through lit gates, for a purse that travels in an armoured wagon. Rook raced it once. She will not say what happened, only that she is barred from the grid — and that you are not. She has the entry fee in a sock and a look in her eye. Top three at the Kessrin qualifier go through.',
    wire: 'The Iron Derby has opened its book for the season. Rook has been seen reading the entry list for the fourth time today.',
    sites: { lz: [-170, 560, 36, 'PADDOCK'], g0: [-290, 420, 40, 'START'], g1: [-600, 120, 38, ''], g2: [-430, -300, 38, ''], g3: [20, -500, 38, ''], g4: [500, -230, 38, ''], g5: [470, 260, 38, ''], pot: [-160, -290, 30, 'THE PURSE'] },
    roads: [['g0', 'g1', 'g2', 'g3', 'g4', 'g5', 'g0']], face: 'g0', guests: [BARC.broker],
    brf: [
      { t: 'I want it noted that this is not a contract. It is a motor race. Rook has asked for the floor, and I have decided I would rather know what she is up to than not.', show: [['site', 'lz', 'PADDOCK', '#8dff6a'], ['card', 'THE JOB', ['Enter the Iron Derby qualifier', 'Finish in the top three', 'Try to bring the machine back']]] },
      { by: PILOTS[0].ch, t: "Boss. The Iron Derby. Six gates, two laps, flat out. You go through every gate in order or it doesn't count. That's the whole rulebook, and half of it's optional.", show: [['route', ['g0', 'g1', 'g2', 'g3', 'g4', 'g5', 'g0'], '#ffb21a'], ['site', 'g0', 'START / FINISH', '#ffb21a'], ['site', 'g1', 'GATE 2', '#ffb21a'], ['site', 'g2', 'GATE 3', '#ffb21a'], ['site', 'g3', 'GATE 4', '#ffb21a'], ['site', 'g4', 'GATE 5', '#ffb21a'], ['site', 'g5', 'GATE 6', '#ffb21a']], shot: 'who' },
      { by: PILOTS[0].ch, t: "Five other cars, and you won't lose one of them. A Derby grid runs past the red line to stay in the pack, whatever you bring. It lets go at the last gate: nobody has anything left for the run to the flag, so that's where you take it. Get there with your heat down. That straight's a long one, and a sprint eats your sinks. The one to watch is Tin Lizzie. Thirty years on the grid. She'll talk the whole way round.", show: [['face', STC.liz, ['"Tin Lizzie" Brandt, car 7', 'Thirty seasons. Never won it', 'Will tell you why, at length']], ['card', 'THE GRID', ['Six cars. Top three qualify', 'Nobody gets away before the last gate', 'Reach it cold. Sprint for the flag']]] },
      { by: BARC.broker, t: 'Ezra Calloway. I keep the book, and the purse. It rides in that wagon on the infield, where everybody can see it and nobody can reach it. I shall be on the tannoy. Do ask me about odds.', show: [['site', 'pot', 'THE PURSE', '#c9a0ff'], ['face', BARC.broker, ['Ezra Calloway, bookmaker', 'Holds the purse and the odds', 'Has never lost money on a Derby']]], shot: 'who' },
      { t: 'What I cannot tell you is why one of my pilots is barred from that grid, because she will not tell me. The reigning champion is a Baron Drescher. He does not race qualifiers. He sends people.', show: [['face', STC.bar, ['Baron Viktor Drescher', 'Champion, nine years running', 'Does not attend qualifiers in person']], ['unk', 'g3', 'WHAT IS ROOK NOT SAYING?']] },
      { by: PILOTS[0].ch, t: "I'll be in your ear the whole way. I know every stone of that course. Just get me on to the big grid, boss. I'll tell you the rest when you have.", shot: 'who' },
      { t: 'Top three. Bring my machine back in one piece, and try to remember that you are a professional soldier and not a jockey.', show: [['clear'], ['route', ['g0', 'g1', 'g2', 'g3', 'g4', 'g5', 'g0'], '#ffb21a'], ['site', 'g0', 'START / FINISH', '#ffb21a'], ['site', 'pot', 'THE PURSE', '#c9a0ff']] },
    ],
    async run(ms) {
      const S = ms.S, rook = PILOTS[0].ch, book = BARC.broker, liz = STC.liz, bar = STC.bar, xo = ms.ops, pts = ['g0', 'g1', 'g2', 'g3', 'g4', 'g5'].map(k => S[k]), N = pts.length, R = stRace(pts, 2); R.total = N * 2 + 1;
      const L = R.add(liz, DB_CAR.liz, .96, 0, { name: 'TIN LIZZIE', st: [1.5, .2, 3.2], sw: 1.3 }), sab = R.add(DB_WHO.sable, DB_CAR.sable, .985, 1, { name: 'SABLE', st: [2.2, 1, 5], sw: 1.3 }), kid = R.add(DB_WHO.kid, DB_CAR.kid, .93, 2, { name: 'KID OKORO', st: [1.5, -.9, -.8], sw: .7, at: [.34, .5] }), deu = R.add(DB_WHO.deuce, DB_CAR.deuce, .9, 3, { name: 'DEUCE', st: [.8, -1.8, -1.6], sw: .6, at: [.1, .3] }), tom = R.add(DB_WHO.tom, DB_CAR.tom, .88, 4, { name: 'OLD TOM', st: [.4, -2.8, -2.5], sw: .5, at: [.04, .2] }); for (const c of R.cars) c.e.inv = true;
      const wagon = mkTruck(S.pot.x, S.pot.z, 0, []); wagon.name = 'THE PURSE'; wagon.hp = wagon.max = 1500; wagon.halt = true; stBeam(S.pot, 0xc9a0ff, 90, 1); const mines = stMines(S.g4, S.g3);
      await after(2); chatter(rook, "Radio check. That's the paddock. Grid's just past the start gate. Smell that? Hot oil and bad decisions. God, I've missed it.");
      await after(5); const b = await ask(book, 'Calloway, on the tannoy. A newcomer! The book adores a newcomer. Would the Commander care for a flutter before the off?', ['¢20,000 on myself to win. Three to one.', '¢10,000 to finish ahead of Sable. Evens.', 'I do not gamble.'], 20, 2);
      say(book, b === 2 ? 'A soldier and a puritan. The book is desolate. Racers — to the grid!' : 'Taken, and written down. Racers — to the grid!'); dbBoard(R, 2);
      chatter(liz, "New blood! Tin Lizzie, car seven. First rule of the Derby: I talk, you listen. Second rule: don't follow me into gate three, I take it sideways.");
      await stGridUp(R, 5); chatter(rook, "Clean start. Gate two's a long drag — get your head down and don't look at Lizzie, she does it to put you off.");
      dbCall(R, rook, ["That's a Derby grid, boss. Every one of them is over the red line to stay in the pack, and you will not shake them. Don't try, and don't cook yourself trying. Just be there at the last gate with your heat down.", "Last lap! The front of the grid goes early, it always does. Let them, and keep your heat down. Nobody holds that pace past the last gate.",
        "There they go! That's everything they have, and it's gone by the gate. Stay on them!", "LAST GATE! They're cooked, boss. Flat out, straight at the flag, GO!"]);
      /* gate five has been seen to */
      (async () => {
        let hit = null; const lead = () => [tom, deu, kid].some(c => !c.e.dead && c.n === 4 && R.gap(c) > 0); await until(() => (hit = [tom, deu, kid].find(c => c.n === 4 && stDist(c.e.pos, S.g4) < 52)) || (R.me === 4 && near(S.g4, 300) && !lead()));
        if (hit) { const m = mines.find(e => !e.dead); if (m) killEnt(m, 1); look(hit.e, hit.e.name); killEnt(hit.e, 1); await tell(rook, `MINES! That was ${hit.ch.first} — gate five is seeded! Shoot them, jump them or go round the end of the line, but do NOT run that gate straight!`); }
        else { look(mines.find(e => !e.dead) || S.g4, 'TRACK MINES'); await tell(rook, "Boss — gate five. The ground's been dug in front of it. That's a mine line. Shoot them, jump them, or go round the end and cut back in!"); }
        chatter(book, 'The stewards wish it known that the stewards did not put those there.'); await until(() => R.me > 4);
        chatter(rook, "That's not a Derby trick, boss. Nobody on that grid's got the money. That was laid for whoever was leading... same as last time."); ms.v.mined = 1;
      })();
      /* lap two: somebody has come for the purse */
      await until(() => R.me >= N + 2 || R.fin || R.out.length >= 3);
      if (!R.fin && R.out.length < 3) {
        const a = stAng(S.pot, S.g3) + 1.9, W = stFrom(.8, S.pot, a, 230, { name: 'RED MAW RAIDER', focus: wagon }); for (const e of W) if (!e.focus) e.focus = wagon; look(W[0], 'RED MAW RAIDERS'); sfx.play('alarm'); let help = false, gone = false;
        wagon.onKill = () => { gone = true; chatter(book, 'The pot! The POT! Thirty years of — oh, I am ruined. I am actually ruined.'); };
        await tell(xo, 'Commander, armed vehicles have just come over the dunes on to your infield. Red Maw. They are not there for the racing. They are going for the purse wagon.');
        const r = await ask(book, "They are after the pot! If that wagon burns, nobody on this grid gets paid — nobody! Racer, I am BEGGING: go to the wagon and I will throw the caution flag. The field holds station until it's safe!", ['Throw the flag. I am going in.', 'Not my pot. I am racing.'], 16, 0);
        L.e.team = 0; L.e.pacify = false; L.e.ai = 'guard'; L.e.home = V3(S.pot.x, 0, S.pot.z + 30); chatter(liz, r ? "Then I'll do it on my own, shall I? Thirty years I've raced for that pot. You enjoy your gate." : "That's the stuff! Come on, new blood — last one to the wagon buys the fuel!");
        if (!r) { help = true; R.pace = .08; msg('CAUTION FLAG — THE FIELD HOLDS STATION', 4); nav('pot', wagon, 'THE PURSE', '#c9a0ff'); setObj('p', () => `Drive the raiders off the purse wagon — ${alive(W)} left`); }
        else (async () => { await after(34); if (alive(W) && !wagon.dead && !near(S.pot, 260)) killEnt(wagon, 1); })();
        (async () => {
          await until(() => !alive(W) || R.fin || (r && wagon.dead)); R.pace = 1; unnav('pot'); L.e.team = 2; L.e.pacify = true; L.e.tgt = null; L.e.ai = 'goto'; for (const e of W) if (!e.dead) { e.focus = null; if (wagon.dead) leave([e]); }
          if (help) { setObj('p', null, gone ? 2 : 1); msg('GREEN FLAG — RACING', 3); sfx.play('alarm'); if (!gone) { stSet('pot', 1); chatter(book, 'Green flag! Green flag! And the stewards — that is to say, I — will remember who turned round.'); chatter(liz, 'Not bad for a soldier. Now get out of my way, I have a podium to be on.'); } }
          else chatter(liz, gone ? "Well, that's the pot gone. I hope it was a lovely gate." : "Saved it. On my own. No, no, don't mention it. I notice you didn't.");
          ms.v.gone = gone;
        })();
      }
      await until(() => R.fin || R.out.length >= 3); R.pace = 1;
      if (!R.fin) return lose('Three cars took the flag before you did. The Derby does not have a fourth place; it has a car park.', 0);
      stShow(S.g0, 6, 50); await after(1.5); const sabAhead = R.out.includes(sab) && sab.fin < R.tMe;
      await tell(book, `${R.ord(R.fin)}! ${R.fin === 1 ? 'A newcomer takes the qualifier, and the book takes a bath. I am delighted for you. Truly.' : 'Through to the big grid. The book thanks you for not winning.'}`);
      stPay(`Qualifier purse — ${R.ord(R.fin)}`, [50000, 30000, 18000][R.fin - 1] * (ms.v.gone ? .5 : 1)); if (b === 0) dbBet(20000, 3, R.fin === 1, 'on the win'); if (b === 1) dbBet(10000, 1, !sabAhead, 'ahead of Sable'); if (stGet('pot')) stPay("Bookmaker's thanks", 25000);
      await tell(bar, 'Drescher. I am told a mercenary has qualified in my Derby. How novel. Do give my regards to Miss Albrecht — and ask her how MAGPIE is running. Oh. But she would not know, would she.');
      await tell(rook, "...He races my machine, boss. I built her. He won her off me in the final, six years back, when the gate in front of me turned out to be mined. I think we both know who's been digging.");
      win(`You qualified for the Iron Derby in ${R.ord(R.fin).toLowerCase()} place, through a mined gate and a raid on the purse. Rook has finally said why she was barred: she lost her machine to the champion, and not fairly.`);
    },
    epi: (ok, f, D) => ok ? [
      [PILOTS[0].ch, "MAGPIE. Reverse-joint, twin jets, every weld mine. The Derby runs pink slips in the final: loser's machine to the winner. He's kept her nine years as a trophy. Boss — I don't want the purse. I want my girl back."],
      f['derby.pot'] ? [BARC.broker, 'You turned round for the pot. Nobody turns round for the pot. I have adjusted your odds for the heat, and for once not in my own favour.'] : [STC.liz, 'You raced on. I would have, at your age. I am not at your age, so I think you are a horror. See you at the Crucible.'],
      [CREW.xo, 'You have entered my company in an illegal race against a man who mines the course. I should be furious. Rook has not smiled like that since she signed on. Carry on.'],
    ] : [[PILOTS[0].ch, "It's all right, boss. There's a last-chance qualifier. There's always a last-chance qualifier — Calloway makes too much on them not to. We go again."]],
    prize(D, add) { stGift(D, 'gear.cool', 1); repAdd('tyr', 2, 'made the Iron Derby grid'); },
  }, {
    /* ---------------- II ---------------- */
    title: 'The Crucible', kind: 'strike', biome: 'volcanic', mood: 0, seed: 94023, diff: 3, pay: 60000, salv: 30, site: 'the Crucible', op: 'RED FLAG',
    tease: 'The Derby\'s semi-final is run round the rim of a live caldera and it has one rule fewer than the qualifier: past the second gate, weapons are free. The Baron still does not race. His two "seconds" do, and they have never once finished a Crucible, because finishing is not what he pays them for. Tin Lizzie is on the grid. So are you. Finish in the top four and you are in the final.',
    wire: 'Calloway has posted the Crucible grid. He has also posted the casualty odds, which Rook says is traditional.',
    sites: { lz: [-520, 420, 36, 'PADDOCK'], g0: [-400, 290, 40, 'START'], g1: [-580, -130, 38, ''], g2: [-250, -470, 38, ''], g3: [240, -410, 38, ''], g4: [540, -50, 38, ''], g5: [280, 370, 38, ''] },
    roads: [['g0', 'g1', 'g2', 'g3', 'g4', 'g5', 'g0']], face: 'g0',
    brf: [
      { t: 'The Crucible. I have read the rules. There is one fewer than last time and I did not think that was possible.', show: [['site', 'lz', 'PADDOCK', '#8dff6a'], ['card', 'THE JOB', ['Iron Derby semi-final', 'Finish in the top four', 'Weapons free past gate two']]] },
      { by: PILOTS[0].ch, t: "Six gates round the caldera rim, two laps. First two gates are clean. Past gate two, anything on your machine that fires, you can fire. So can they.", show: [['route', ['g0', 'g1', 'g2', 'g3', 'g4', 'g5', 'g0'], '#ff7a3a'], ['site', 'g0', 'START / FINISH', '#ffb21a'], ['site', 'g1', 'GATE 2 · WEAPONS FREE', '#ff5a3a'], ['card', 'THE CRUCIBLE', ['Six gates, two laps', 'Lava either side of the causeway', 'Weapons free past gate two']]], shot: 'who' },
      { by: BARC.broker, t: 'And the track guns! Four of them, here and here. They track one car only, drawn by lottery on the night. It is the Derby\'s most beloved tradition. The lottery is scrupulously fair. I draw it myself.', show: [['foe', 'g2', 'TRACK GUNS'], ['foe', 'g4', 'TRACK GUNS'], ['ring', 'g2', 150, 'ARC OF FIRE'], ['ring', 'g4', 150, 'ARC OF FIRE']], shot: 'who' },
      { by: PILOTS[0].ch, t: "The Baron's seconds. Sable's quick and she's mean. Brute is exactly what it says on the hull. They don't race the Crucible, boss, they work it — somebody on that grid's been picked out, and they're there to see he doesn't finish.", show: [['face', DB_WHO.sable, ['Sable. The Baron\'s second', 'Fast. Has never finished a Crucible', 'Is not paid to']], ['unk', 'g3', 'WHO HAVE THEY BEEN SENT FOR?']] },
      { by: STC.liz, t: "It's you, love. They've been sent for you. It was me last year, and I've the scars. Stick by old Lizzie and we'll see each other round. I do a lovely line in getting in the way.", shot: 'who' },
      { t: 'The mountain is rated "quiet". Dutch has looked at the same readings and used a different word. Top four. I would like the machine back, and I find I would also like you back.', show: [['clear'], ['route', ['g0', 'g1', 'g2', 'g3', 'g4', 'g5', 'g0'], '#ff7a3a'], ['site', 'g0', 'START / FINISH', '#ffb21a'], ['foe', 'g2', 'TRACK GUNS'], ['foe', 'g4', 'TRACK GUNS'], ['unk', [0, -40], 'THE MOUNTAIN?']] },
    ],
    guests: [BARC.broker, STC.liz],
    async run(ms) {
      const S = ms.S, rook = PILOTS[0].ch, book = BARC.broker, liz = STC.liz, bar = STC.bar, xo = ms.ops, pts = ['g0', 'g1', 'g2', 'g3', 'g4', 'g5'].map(k => S[k]), N = pts.length, R = stRace(pts, 2, { col: 0xff7a3a }); R.total = N * 2 + 1;
      const L = R.add(liz, DB_CAR.liz, .97, 0, { name: 'TIN LIZZIE', hpK: 2.6, st: [1.2, .5, 2.4], sw: 1 }), sab = R.add(DB_WHO.sable, DB_CAR.sable, 1, 1, { name: 'SABLE', hpK: 2, st: [1.6, .3, -.9], sw: 2, at: [.1, .3], per: 27 }), bru = R.add(DB_WHO.brute, DB_CAR.brute, .95, 2, { name: 'BRUTE', hpK: 2.6, st: [.5, 1.2, -1], sw: 1.6, at: [.05, .25] }), kid = R.add(DB_WHO.kid, DB_CAR.kid, .93, 3, { name: 'KID OKORO', st: [1.4, 1, 4.4], sw: 1 }), deu = R.add(DB_WHO.deuce, DB_CAR.deuce, .9, 4, { name: 'DEUCE', st: [.9, -.6, 2.6], sw: .9 });
      const guns = ['g2', 'g4'].flatMap((k, j) => [-1, 1].map(s => { const [x, z] = stOff(S[k], stAng(S[k], pts[j ? 3 : 1]) + s * 1.3, 52), t = mkTurret(x, z, 1); t.name = 'TRACK GUN'; t.hp = t.max = 130; return t; }));
      await after(2); chatter(rook, "Paddock. You can feel the ground humming through the legs. That's the mountain. It's rated quiet. Everything up here is rated quiet.");
      await after(5); const b = await ask(book, 'Calloway! The Crucible book is open. I can offer the Commander five to two on the win, or evens that both of the Baron\'s seconds fail to finish. One does like to offer a sporting market.', ['¢20,000 on myself to win. Five to two.', '¢15,000 that neither second finishes. Evens.', 'I do not gamble.'], 20, 2);
      look(guns[0], 'TRACK GUNS'); await tell(book, 'And now the lottery! The track guns tonight will follow car number... one moment... oh. Oh dear. It appears to be yours, Commander. What are the odds? I ask rhetorically. I know the odds. I was paid to.'); dbBoard(R, 2);
      await stGridUp(R, 5); chatter(liz, "Stay on my hip through two, love. After that it's every hull for herself.");
      dbCall(R, rook, [null, "Last lap, and they're all still on you. That's the Derby. Keep your heat down for the flag.", "The front's going for the line early. Let them burn it.", "LAST GATE! There's nothing left in any of them. Flat out, boss, straight at it!"]);
      await until(() => R.me >= 2 || R.fin); msg('GATE TWO — WEAPONS FREE', 3); sfx.play('alarm'); dbHot(sab); dbHot(bru);
      look(sab.e, "THE BARON'S SECONDS"); await tell(rook, "Weapons free — and Sable and Brute have both gone hot. They're not racing you, boss, they're hunting you. You're allowed to hunt back. I'd start with Sable.");
      chatter(liz, "Oh good. It's THAT sort of Crucible."); setObj('s', () => `The Baron's seconds — ${alive([sab.e, bru.e])} still running`, 0, true);
      (async () => { await until(() => !alive([sab.e, bru.e])); setObj('s', null, 1); chatter(book, "Both of the Baron's cars are out! The Baron's box has gone very quiet. The Baron's box has, in fact, left."); })();
      /* lap two: the mountain joins in, and Lizzie goes over */
      await until(() => R.me >= N + 3 || R.fin || R.out.length >= 4);
      if (!R.fin && R.out.length < 4) {
        const st = EV.B.storm; weatherShift(st[1], st[2], st[3], 7); P.shake += 1; sfx.play('boom', 1.6); msg('THE MOUNTAIN IS NOT QUIET', 4); const tE = ms.t + 55;
        stTick(dt => { if (ms.over || ms.t > tE) return false; if (Math.random() < dt * .8) { const g = R.next(R.me), a = stAng(P.pos, g), d = rand(50, 170), o = rand(-45, 45); shell(P.pos.x + Math.sin(a) * d + Math.cos(a) * o, P.pos.z + Math.cos(a) * d - Math.sin(a) * o, 34, 13, 2.6); } return true; });
        await tell(xo, 'The caldera has just thrown its lid. That is ejecta coming down on the back of the course — watch the ground for where it is going to land, and do not be there.');
        if (!L.e.dead && !L.fin) {
          const Le = L.quit(); Object.assign(Le, { team: 0, ai: 'hold', pacify: true, inv: false }); Le.hp = Le.max * .6; Le.obj.rotation.z = .5; FD.emit.push({ p: V3(Le.pos.x, Le.pos.y + 6, Le.pos.z), kind: 'smoke', life: 90 });
          const K = stFrom(.5, Le.pos, stAng(Le.pos, P.pos) + 2.2, 175, { name: "THE BARON'S RECOVERY CREW", paint: DB_BARON }); for (const e of K) e.focus = Le;
          const tL = ms.t + 50; nav('liz', Le, 'LIZZIE — DOWN', '#ff9a3a'); look(Le, 'TIN LIZZIE'); setObj('l', () => `Lizzie is down. Stop for her, or race on — ${secs(tL)}`, 0, true);
          await tell(liz, `I'm over! A rock the size of a bus, and I'm on my side with a leg gone — and the Baron's "recovery crew" is coming over the flow to see that I stay here. Don't you DARE stop, you've a place to keep!`);
          await tell(rook, "Boss — she's got less than a minute. You stop, you lose the heat money and you start the final from the back. You don't, and... your call. I know what I'd do. I'm not the one who has to pay for it.");
          (async () => {
            await until(() => !alive(K) || Le.dead || ms.t > tL || R.fin); if (alive(K) && !Le.dead && (R.fin || !near(Le.pos, 230))) killEnt(Le, 1); if (alive(K) && !Le.dead) await until(() => !alive(K) || Le.dead);
            unnav('liz'); if (near(Le.pos, 260)) dbBank(R); if (Le.dead) { stSet('liz', 0); setObj('l', 'Lizzie is down — her machine is gone', 2); chatter(liz, "Ejected. I'm in a ditch with a broken collarbone watching thirty years of machine burn. Go on, then. Go and win your race."); for (const e of K) if (!e.dead) e.focus = PE; }
            else { stSet('liz', 1); setObj('l', 'Lizzie is down — you stopped for her', 1); Le.inv = true; Le.pacify = true; ms.v.saved = 1; await tell(liz, "You stopped. In the Crucible. Nobody stops in the — you daft, soft-hearted — GO! Recovery's got me. Go and finish, I'll not have you last on my account!"); chatter(book, 'A racer has stopped for a racer. The book has no market for that. The book is, briefly, moved.'); }
          })();
        }
      }
      await until(() => R.fin || R.out.length >= 4);
      if (!R.fin) return lose('Four cars took the flag before you did. The Crucible sends four to the final and everybody else to the breakers.', 0);
      stShow(S.g0, 6, 50); await after(1.5); if (stGet('liz') === undefined) stSet('liz', L.e.dead ? 0 : 1); stSet('pole', R.fin <= 2 ? 1 : 0);
      await tell(book, `${R.ord(R.fin)} across the line${ms.v.saved ? ' — having stopped on the way for a spot of life-saving, which the stewards have noted and cannot think how to punish' : ''}! The Commander goes to the final.`);
      stPay(`Crucible purse — ${R.ord(R.fin)}`, [70000, 40000, 22000, 10000][R.fin - 1]); if (b === 0) dbBet(20000, 2.5, R.fin === 1, 'on the win'); if (b === 1) dbBet(15000, 1, sab.e.dead && bru.e.dead, 'no seconds home');
      await tell(bar, stGet('liz') ? 'Sentiment. On a race track. You gave up a place for a woman who has never finished higher than fourth. I shall enjoy the final very much.' : 'You left her. Good. I had wondered whether you were a racer or merely a soldier with a hobby. I shall see you on my grid.');
      win(`You came ${R.ord(R.fin).toLowerCase()} in the Crucible with the track guns on you and the mountain coming down. ${stGet('liz') ? 'Tin Lizzie is alive because you stopped.' : 'Tin Lizzie\'s machine is still burning on the back straight.'}`);
    },
    epi: (ok, f, D) => ok ? [
      f['derby.liz'] ? [STC.liz, "They've bolted a leg on. It's not my leg, it's off a harvester, but it goes. I'm on that final grid, love, and I am going to be somebody's very worst afternoon. Not yours."] : [STC.liz, "Collarbone, four ribs, and a machine I'd had since before you could walk. Don't write. Just beat him. If you can't be decent you can at least be fast."],
      [PILOTS[0].ch, f['derby.liz'] ? "You stopped. In the Crucible. I've watched that race a dozen times and nobody's ever stopped. ...Don't tell her, but Lizzie taught me to drive. Thank you, boss." : "You did what the Derby says to do. I'm not going to tell you it was wrong. I'm going to go and sit with Lizzie for a bit."],
      [BARC.broker, 'The final is run on the moon, on the old Kaldur test circuit, pink slips down. The Baron races that one himself. He has to: it is the only way he gets to keep her.'],
    ] : [[PILOTS[0].ch, "Crucible's a lottery, boss, in more ways than one. There's a repêchage — Calloway sells tickets to it. We go again."]],
    prize(D, add, f) { stGift(D, 'gear.sink', 1); if (f['derby.liz']) stGift(D, 'gear.kit', 1); },
  }, {
    /* ---------------- III ---------------- */
    title: 'Pink Slips', kind: 'headhunt', biome: 'lunar', mood: 0, seed: 94037, diff: 4, pay: 90000, salv: 30, site: 'the Kaldur Circuit', op: 'CHEQUERED FLAG',
    tease: 'The final of the Iron Derby is run in hard vacuum on the old Kaldur test circuit, where a jump jet carries three times as far and a mistake carries further. No weapons. Pink slips: the loser\'s machine goes to the winner. Baron Drescher has won it nine years running in a machine called MAGPIE that he did not build. The woman who did will be in your ear. Beat him, and she flies it home.',
    wire: 'The Iron Derby final is on. Calloway reports the heaviest book in the race\'s history, most of it against you.',
    sites: { lz: [-400, 500, 36, 'PADDOCK'], g0: [-280, 380, 40, 'START'], g1: [-560, 0, 38, ''], g2: [-240, -440, 38, ''], g3: [300, -400, 38, ''], g4: [520, 40, 38, ''], g5: [190, 420, 38, ''] },
    roads: [['g0', 'g1', 'g2', 'g3', 'g4', 'g5', 'g0']], face: 'g0', guests: () => stFlag('derby.liz') ? [BARC.broker, STC.liz] : [BARC.broker],
    brf: [
      { t: 'The final. I have stopped pretending this is not company business. Half the yard has money on it, and I regret to say that includes me.', show: [['site', 'lz', 'PADDOCK', '#8dff6a'], ['card', 'THE JOB', ['Win the Iron Derby', 'Finish ahead of Baron Drescher', 'Pink slips: his machine if you do, yours if you do not']]] },
      { by: PILOTS[0].ch, t: "Kaldur circuit. Six gates, two laps, a third of a gee. Your jets will throw you clean over a crater up there, so use them — but you still have to come down through the gate. Every gate. In order.", show: [['route', ['g0', 'g1', 'g2', 'g3', 'g4', 'g5', 'g0'], '#ffb21a'], ['site', 'g0', 'START / FINISH', '#ffb21a'], ['card', 'KALDUR CIRCUIT', ['Six gates, two laps', 'Hard vacuum, one-third gravity', 'No weapons in a final. Stewards\' rule']]], shot: 'who' },
      { by: PILOTS[0].ch, t: "That's him. And that's her. MAGPIE is faster than anything you own, boss, I made sure of that when I built her. You won't out-drag him. You beat him by being cleaner than he is, for longer than he can stand.", show: [['face', STC.bar, ['Baron Viktor Drescher, in MAGPIE', 'Nine finals. Nine wins', 'Three stewards\' enquiries, all withdrawn']], ['unk', 'g2', 'WHERE DOES HE CHEAT?']] },
      { by: BARC.broker, t: 'No weapons, by ancient custom. The stewards will be watching very closely. I should mention that the stewards are me, and that the Baron has been extremely generous to the stewards\' benevolent fund.', shot: 'who' },
      STORY_LIZ_BRF(),
      { t: 'If you lose, he takes the machine you are sitting in, and I will have to explain that to the insurers. If you win, Rook gets back something that was stolen from her. Go and win.', show: [['clear'], ['route', ['g0', 'g1', 'g2', 'g3', 'g4', 'g5', 'g0'], '#ffb21a'], ['site', 'g0', 'START / FINISH', '#ffb21a'], ['unk', 'g2', 'WHERE DOES HE CHEAT?']] },
    ],
    async run(ms) {
      const S = ms.S, rook = PILOTS[0].ch, book = BARC.broker, liz = STC.liz, bar = STC.bar, xo = ms.ops, pts = ['g0', 'g1', 'g2', 'g3', 'g4', 'g5'].map(k => S[k]), N = pts.length, R = stRace(pts, 2); R.total = N * 2 + 1; const hasL = !!stFlag('derby.liz'), pole = !!stFlag('derby.pole');
      const B = R.add(bar, DB_CAR.mag, 1.035, pole ? 1 : 0, { name: 'MAGPIE', hpK: 3.4, skill: 1.5, st: [2, 1.4, 3.6], sw: 1 }), sab = R.add(DB_WHO.sable, DB_CAR.sable, 1, 2, { name: 'SABLE', hpK: 2.2, st: [1.3, .3, -.9], sw: 1.8, at: [.1, .3], per: 27 }), L = hasL ? R.add(liz, DB_CAR.liz, .98, 3, { name: 'TIN LIZZIE', hpK: 3, st: [1, .4, .4], sw: .8 }) : null, kid = R.add(DB_WHO.kid, DB_CAR.kid, .94, 4, { name: 'KID OKORO', st: [.6, -1.2, -1], sw: .7 }), deu = R.add(DB_WHO.deuce, DB_CAR.deuce, .9, 5, { name: 'DEUCE', st: [.3, -2.2, -2], sw: .6 }); for (const c of R.cars) c.e.inv = true;
      await after(2); chatter(rook, "There she is. Front row, black and gold. He's painted her like a hearse. ...Sorry. I'm fine. Grid's ahead of you.");
      await after(5); look(B.e, 'MAGPIE'); await tell(bar, "Miss Albrecht's mercenary. I trust she has told you whose machine this is. I keep her in the long gallery, between a Vermeer and a stuffed bear. She is the only one of the three I take out.");
      chatter(rook, "Don't. Don't answer him. Just drive."); const b = await ask(book, 'Calloway. The book on the final stands at seven to two against the Commander, which I may say is the shortest price anybody has had against the Baron in nine years. A last flutter?', ['¢30,000 on myself. Seven to two.', 'I do not gamble.'], 20, 1); dbBoard(R, 2);
      if (L) chatter(liz, "Harvester leg and all, love. Sable's mine. I owe that family a wheel."); await stGridUp(R, pole ? 0 : 6); chatter(rook, pole ? "Front row, alongside him. Get to gate one first and make him look at your back for once." : "You're at the back. Good. Nobody mines the back. Pick them off one gate at a time.");
      dbCall(R, rook, ["He has the legs of you, boss. I made sure of that when I built her. Doesn't matter. Stay in his mirrors.", "Last lap. Whatever he does, be on him at the last gate, and cold. She was never built to hold that pace past it.",
        () => ms.v.stall ? "He's coming back at you, and that's everything she has. Hold him off to the gate!" : "He's gone for the line! That's MAGPIE flat out, and I know to the second how long she'll take it.",
        () => ms.v.stall ? "LAST GATE! He's got nothing left to come by with. Straight at the flag, boss, don't look back!" : "LAST GATE! She's cooked. Straight at the flag, everything you have, NOW!"]);
      /* gate two: his second earns her money */
      await until(() => R.me >= 2 || R.fin || B.fin);
      if (L) { L.f = sab.f = .8; L.flat = sab.flat = true; look(sab.e, 'SABLE'); await tell(liz, "Sable's come across to put you in the wall and found me there instead. Go on, love — I've got her. I can do this ALL DAY. I have, in fact, done this for thirty years."); chatter(DB_WHO.sable, 'Get this antique OFF me—'); }
      else { dbHot(sab); look(sab.e, 'SABLE — WEAPONS HOT'); await tell(rook, "Sable's gone weapons hot. In a FINAL. Boss, if she shoots, you shoot — and there's nobody out there this time to get in her way for you."); chatter(book, 'Weapons, in a final! The stewards are shocked. The stewards will be writing a very stiff letter.'); }
      /* lap two: he does what he always does */
      await until(() => (B.n > N + 1 && B.n % N === 2) || R.me >= N + 2 || R.fin || B.fin);
      if (!R.fin && !B.fin) {
        if (B.n <= N + 2) B.n = N + 3; { const s = clamp(R.secs(B), 3, 7); B.st = [s, s, 3.6]; } look(B.e, 'MAGPIE — OFF THE COURSE'); await tell(rook, "He's cut it! He's gone straight across the crater and missed gate three completely! CALLOWAY!");
        await tell(book, 'The stewards saw nothing irregular. The stewards have, I regret to say, been looking the other way at a rate of four thousand credits a minute.');
        const M = stMines(S.g4, S.g3, 6, 60, 8); chatter(rook, "And he's dropping mines out of her cargo bay. MY cargo bay! I put that bay in for spare coolant!");
        await until(() => R.me >= N + 3 || R.fin || B.fin);
        if (!R.fin && !B.fin) {
          const r = await ask(rook, "Boss. I built that machine. There's a word you can say on her service channel that puts her reactor to sleep for ten seconds. He's never found it. I've never used it. Say so, and I'll say it.", ['Say it, Rook.', 'No. I take him on the track.'], 18, 1);
          if (r === 0) { stSet('clean', 0); ms.v.stall = 1; B.flat = true; B.f = .02; (async () => { await after(10); B.f = 1.035; B.flat = false; B.st = [-1, -1, -1]; if (B.e.mech.mats.glow) B.e.mech.mats.glow.emissiveIntensity = 3; })(); look(B.e, 'MAGPIE'); await tell(rook, 'Service channel... "Mind the step, Maggie."'); B.flat && B.e.mech.mats.glow && (B.e.mech.mats.glow.emissiveIntensity = 0); await tell(bar, "What — the board has gone dark — what have you DONE to her? Sable! SABLE!"); chatter(rook, 'Hello, old girl. Miss me?'); }
          else { stSet('clean', 1); B.st = [3.2, 3.2, 3.6]; await tell(rook, "...Good. I'd have hated you a bit. Then listen: she always ran hot in the right knee, and he drives her like he's whipping her. He can't hold the last three gates tight. You can. Go INSIDE him."); chatter(liz, hasL ? "That's the way, love! Clean! Make him lose it properly!" : 'Clean, is it? Well. Maybe you are a racer after all.'); }
        }
      }
      await until(() => R.fin || B.fin);
      if (!R.fin || (B.fin && B.fin < R.tMe)) return lose('MAGPIE took the flag ahead of you. Ten years running. By the rules of the final, the machine you were sitting in is his now; Varga has bought it back at a price she will not discuss.', 0);
      /* and then he does the other thing he always does */
      stShow(S.g0, 9, 60); await after(1.5); await tell(book, 'THE COMMANDER TAKES THE IRON DERBY! Nine years! NINE YEARS! The book is ruined, I am ruined, and I have never been so happy in all my life! Baron — the slip, if you please!');
      stPay('Iron Derby purse', 160000); if (b === 0) dbBet(30000, 3.5, true, 'on the win'); const Be = B.quit(), Al = [L, kid, deu].filter(c => c && !c.e.dead).map(c => c.quit()), Ss = sab.e.dead ? [] : [sab.quit()];
      look(Be, 'MAGPIE — WEAPONS HOT'); await tell(bar, 'A Drescher does not hand his property to the help. Sable. Gallery. Kill the mercenary, and somebody bring me the bookmaker.');
      Object.assign(Be, { team: 1, ai: 'hunt', pacify: false, inv: false, alert: true, focus: PE }); Be.hp = Be.max; for (const e of Ss) Object.assign(e, { team: 1, ai: 'hunt', pacify: false, inv: false, alert: true }); const Dn = [0, 1, 2].map(i => { const d = mkDrone(...stOff(S.g0, i * 2.1, 120), 1); d.name = 'GALLERY GUN'; d.hp = d.max = 70; return d; });
      for (const e of Al) Object.assign(e, { team: 0, ai: 'follow', lead: PE, pacify: false, inv: false }); msg('THE WHOLE GRID HAS TURNED ROUND', 4); sfx.play('alarm');
      chatter(hasL ? liz : DB_WHO.kid, hasL ? "Oh, I have waited THIRTY YEARS for somebody to give me an excuse. Grid! With me! Get him!" : "He's shooting at the winner? He can't shoot at the WINNER! Everybody — get him!");
      await tell(rook, "NOT THE REACTOR! Boss, that's MY machine he's sitting in — shoot the bits that are HIS! Take her down to a third and she'll trip her own safeties. I wired them. Please.");
      setObj('b', () => `Stop the Baron without killing MAGPIE — hull ${Math.max(0, Math.round((Be.hp / Be.max - .34) / .66 * 100))}%`); nav('b', Be, 'THE BARON', '#ff5a3a');
      await until(() => Be.dead || Be.hp < Be.max * .34); unnav('b');
      if (Be.dead) { stSet('mag', 0); setObj('b', 'MAGPIE is destroyed', 2); await tell(rook, "...You killed her. No — no, it's all right. It's all right. She'd have hated being his. Better a wreck on the moon than a thing in his gallery. ...Give me a minute, boss."); }
      else { stSet('mag', 1); Object.assign(Be, { team: 2, ai: 'hold', pacify: true, inv: true, focus: null }); setObj('b', null, 1); await tell(bar, "The canopy has — she has locked me out! She has locked ME out! I own this machine! I have the PAPERS—"); await tell(rook, "Safeties tripped, canopy's popped, and he's sitting on the regolith in a silk scarf. Boss, I'm coming down there. I'm bringing a spanner and I'm not going to need it. Hello, Maggie. I'm so sorry I'm late."); }
      for (const e of FD.ents.filter(e => e.team === 1)) if (!e.dead) killEnt(e, 4);
      await after(2); win(Be.dead ? 'You won the Iron Derby. The Baron opened fire on the finish straight and the whole grid turned on him. MAGPIE did not survive it.' : `You won the Iron Derby${stGet('clean') ? ', clean,' : ''} and when the Baron opened fire on the finish straight the whole grid turned on him. Rook has walked out on to the moon to fetch her machine.`);
    },
    epi: (ok, f, D) => ok ? [
      f['derby.mag'] ? [PILOTS[0].ch, "She's in bay three. He'd never once changed her coolant, can you believe that? Nine years. I've been up two nights and I'm not tired. Next time you want a wing, boss, you're getting the pair of us."] : [PILOTS[0].ch, "I've got her head. Calloway had it brought down for me. I'm going to hang it in the mess where I can see it. It's enough. It's honestly enough."],
      f['derby.clean'] ? [STC.bar, 'You beat me in a straight race. I have had the film looked at by four experts and they all say the same thing. I find that I do not know what to do with it.'] : [STC.bar, 'You cheated. In MY race. I want you to know that it is the only thing about you I respect.'],
      f['derby.liz'] ? [STC.liz, "Fourth! Me! On a harvester leg! I'm retiring, love, I'll never top it. ...Same time next year?"] : [BARC.broker, 'The book lost everything it had on the Baron. I have sold the wagon. I regret nothing. Do come and race again; I shall need the business.'],
    ] : [[PILOTS[0].ch, "He'll run it again next season. He always does — he likes to be seen winning. So we go again, boss. I've waited nine years. I can wait one more race."]],
    prize(D, add, f) { stGift(D, 'back.jet', 1); stGift(D, 'legs.rap', 1); repAdd('tyr', 5, 'won the Iron Derby'); },
  }],
};
/* the final's briefing has a guest only if she lived to be one */
function STORY_LIZ_BRF() { return { by: STC.liz, get t() { return stFlag('derby.liz') ? "I'm on the grid, love, harvester leg and all. I'll keep his second busy. You just keep him honest — somebody ought to, once." : "I'm in a hospital bed with the race on a screen and a nurse who has money on him. Beat the man. That's all. Beat him."; }, shot: 'who' }; }

