/* ============ STORY THREAD 0 — SHAKEDOWN: THE MECH CAME WITH A TEACHER, AND NOBODY WILL HIRE THE COMPANY UNTIL SHE HAS PASSED IT ============ */
/* The first sortie. It is the thread marked `first`, so on a new company's board it is the only card there is (115_first_day.js, storySync), and it is where the controls are taught:
   walking, steering, the torso and both triggers, heat, the jets, the sprint and, for the last few minutes, an actual fight. It is flown on the home range, alone, on the company's own account.
   Nothing in it should be able to strand a player: every lesson has a marker and a key prompt (tutKeys, 445_guide.js), a machine with no jets is excused the jump, somebody who has done all this
   before can go straight to the examination, and the bay crew patch the machine once if the fight goes badly */
Object.assign(CAST, { 9201: { bot: true }, 9203: { build: 'lean', h: 1.68, habit: 'hips', ...stLook('#b5651d', 2, 'scar') } });
const SHK_PL = new THREE.PlaneGeometry(1, 1), SHK_TX = [], SHK_PAIL = std({ color: 0xe6cf8a, metalness: .25, roughness: .6 });
/* what Dutch painted on the targets: three faces (0 cross, 1 a monocle and a moustache, 2 far too pleased with itself) and a bullseye (3) */
const shkTex = i => SHK_TX[i] || (SHK_TX[i] = labelTex(128, 128, (g, w, h) => {
  g.clearRect(0, 0, w, h); g.lineWidth = 9; g.lineCap = 'round'; g.lineJoin = 'round';
  if (i === 3) { for (const [r, c] of [[62, '#e9e2d0'], [48, '#b8301f'], [34, '#e9e2d0'], [20, '#b8301f'], [7, '#16120c']]) { g.fillStyle = c; g.beginPath(); g.arc(64, 64, r, 0, TAU); g.fill(); } return; }
  g.strokeStyle = g.fillStyle = '#16120c'; for (const x of [40, 88]) { g.beginPath(); g.arc(x, 52, 9, 0, TAU); g.fill(); }
  g.beginPath();
  if (i === 0) { g.moveTo(22, 28); g.lineTo(54, 40); g.moveTo(106, 28); g.lineTo(74, 40); g.moveTo(38, 102); g.quadraticCurveTo(64, 80, 90, 102); }
  else if (i === 1) { g.moveTo(40, 100); g.quadraticCurveTo(64, 112, 88, 100); g.moveTo(30, 82); g.quadraticCurveTo(48, 66, 64, 82); g.quadraticCurveTo(80, 66, 98, 82); g.moveTo(107, 52); g.arc(88, 52, 19, 0, TAU); g.moveTo(104, 66); g.lineTo(112, 104); }
  else { g.moveTo(28, 80); g.quadraticCurveTo(64, 124, 100, 80); g.lineTo(28, 80); g.moveTo(24, 32); g.lineTo(52, 34); g.moveTo(76, 28); g.lineTo(104, 36); }
  g.stroke();
}));
const shkPlate = (par, tx, w, h, x, y, z, rx = 0) => { const m = new THREE.Mesh(SHK_PL, std({ map: shkTex(tx), transparent: true, roughness: .9, metalness: 0 })); m.scale.set(w, h, 1); m.position.set(x, y, z); m.rotation.x = rx; par.add(m); return m; };
/* a kill on the range is not a kill: nothing is counted and nothing goes in the salvage */
const shkFree = e => { e.onDead = () => { if (e.by === 0) { YARD.loot.pop(); P.kills--; } }; return e; };
/* a target: an oil tank on a post with girders for arms and a bucket for a head. It stands as tall as a light mech, it does nothing whatever, and when it has had enough its head comes off */
function shkDummy(x, z, yaw, name, face) {
  const p = gpos(x, z), g = grp(FD.scene, p.x, p.y, p.z, 0, yaw, 0), top = grp(g); FD.misc.push(g);
  cyl(g, M.girder, .45, .7, 6, 0, 3, 0, 0, 0, 0, 8); box(g, M.hazard, 3.2, .6, 3.2, 0, .3, 0);
  cyl(top, M.rust, 2.2, 1.9, 4.4, 0, 7.6, 0, 0, 0, 0, 12); box(top, M.girder, 8.2, .6, .7, 0, 9.3, 0); shkPlate(top, 3, 3.1, 3.1, 0, 7.7, 2.22);
  for (const s of [-1, 1]) { box(top, M.steel, .9, 4.4, .9, s * 4.1, 7.2, 0, 0, 0, s * .1); cyl(top, M.black, .35, .45, 3, s * 4.3, 5.3, 1.2, 1.2, 0, 0, 8); }
  const hd = grp(top, 0, 11, 0); cyl(hd, SHK_PAIL, 1.5, 1.2, 2.3, 0, 0, 0, 0, 0, 0, 12); cyl(hd, M.girder, 1.75, 1.75, .15, 0, 1.15, 0, 0, 0, 0, 12); shkPlate(hd, face, 2.3, 2.3, 0, -.05, 1.46);
  const e = shkFree({ kind: 'struct', team: 1, name, obj: g, pos: g.position, cy: 7.8, r: 3.7, hp: 44, max: 44, nw: true, update() { }, col: circ(x, z, 1.2, p.y + 6) });
  e.crash = () => {
    FD.scene.attach(hd); g.remove(top); FD.misc.push(hd); const v = V3(rand(-8, 8), rand(18, 26), rand(-8, 8)), sp = V3(rand(-5, 5), rand(-3, 3), rand(-5, 5));
    stTick(dt => { v.y -= FD.grav * dt; hd.position.addScaledVector(v, dt); hd.rotation.x += sp.x * dt; hd.rotation.y += sp.y * dt; hd.rotation.z += sp.z * dt; const y = heightAt(hd.position.x, hd.position.z) + 1.1; if (hd.position.y > y || v.y > 0) return true; hd.position.y = y; puff(FD.fx, hd.position, 8, 3, .5, .4, 2, 4); sfx.play('step', .8); return false; });
  };
  FD.ents.push(e); return e;
}
/* a target that moves: a hunter drone with its gun taken out, flying a lazy oval over the butts and paying nobody any attention */
function shkPigeon(c, i) {
  const e = shkFree(mkDrone(c.x, c.z, 1)), rot = e.obj.children.filter(o => o.isGroup); e.name = 'TARGET DRONE'; e.hp = e.max = 20; e.pacify = true; e.rad = 34 + i * 17; e.ang = i * 2.1; e.dir = i % 2 ? -1 : 1;
  e.update = (dt, t) => { for (const r of rot) r.rotation.y += dt * 40; e.ang += e.dir * dt * 12 / e.rad; const x = c.x + Math.sin(e.ang) * e.rad, z = c.z + Math.cos(e.ang) * e.rad * .5; e.pos.set(x, heightAt(x, z) + 14 + i * 4 + Math.sin(t * 1.3 + i * 2) * 2.5, z); e.obj.rotation.set(0, e.ang + e.dir * PI / 2, 0); };
  return e;
}
/* the Table: a block nine metres high and forty across, with a bullseye on the top of it. There is no ramp. That is the lesson.
   It is as wide as it is because a light mech at a walk covers twenty metres a second, and the first landing ought not to need a second try */
function shkTable(p, top = 9, hw = 20) {
  const g = grp(FD.scene, p.x, p.y, p.z), w = hw * 2; FD.misc.push(g);
  box(g, M.dark, w - 1.4, top - 1, w - 1.4, 0, (top - 1) / 2, 0); box(g, M.steel, w, 1, w, 0, top - .5, 0); box(g, M.hazard, w + .3, .9, w + .3, 0, top - 1.5, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { cyl(g, M.girder, 1.1, 1.4, top, sx * (hw - .8), top / 2, sz * (hw - .8), 0, 0, 0, 8); noShadow(box(g, M.amber, .7, .7, .7, sx * (hw - .8), top + .4, sz * (hw - .8))); }
  for (const s of [-1, 1]) for (const k of [-1, 1]) { box(g, M.girder, hw - 2, .5, .5, k * hw * .5, top * .45, s * (hw - .55), 0, 0, k * .5); box(g, M.girder, .5, .5, hw - 2, s * (hw - .55), top * .45, k * hw * .5, k * .5); }
  shkPlate(g, 3, 24, 24, 0, top + .04, 0, -PI / 2); rect(p.x, p.z, hw, hw, p.y + top); return { g, top: p.y + top, hw };
}
/* the firing point: four lamp posts and a painted square */
function shkPoint(p) {
  const g = grp(FD.scene, p.x, p.y, p.z); FD.misc.push(g); for (const sx of [-1, 1]) for (const sz of [-1, 1]) { cyl(g, M.girder, .3, .4, 5, sx * 9, 2.5, sz * 9, 0, 0, 0, 8); noShadow(box(g, M.amber, .8, .8, .8, sx * 9, 5.3, sz * 9)); }
  for (const s of [-1, 1]) { noShadow(box(g, M.hazard, 18, .12, 1, 0, .1, s * 9)); noShadow(box(g, M.hazard, 1, .12, 18, s * 9, .1, 0)); }
  return g;
}
const SHK_GRADE = ['present', 'C', 'B', 'B-plus', 'A', 'A-plus'], shkGrade = (t, a, b) => t < a ? 4 : t < b ? 3 : t < b * 1.6 ? 2 : 1;

STORY.zero = {
  name: 'SHAKEDOWN', sub: 'The mech came with a teacher. The teacher will not let go', col: '#ff9ad0', emp: 'tyr', foe: 'maw', who: STC.mav, first: true,
  forN: 'Our own account', forS: 'OWN ACCOUNT', vsN: 'A syllabus', payL: 'Course deposit, refunded — Pallister Academy',
  open: () => true, wait: 0, flags: ['grade', 'arm'],
  get fin() { return `${YARD.name} has cleared its transponder and is open for contracts. Brokers who spent a week laughing at the squawk are returning calls.`; },
  close: 'That is the shakedown flown, Commander, and the last time anybody calls this company a learner. The board is filling as we speak. Pick one.',
  again: 'She will want us back on the range, Commander, and until that transponder is clear nobody else is calling. It is on the board again now. No charge for the dents.',
  note: 'Flown alone, on our own range, on our own account: nothing you bend out there goes on a bill, and if it goes wrong the card is back on the board at once. Commander Varga briefs it first. Until it is flown, it is the only offer there is.',
  ch: [{
    title: 'First Day', kind: 'recon', biome: 'desert', mood: 0, seed: 41, diff: 1, pay: 30000, salv: 50, site: 'the Yard', op: 'LEARNER', home: true, solo: true, lay: true,
    tease: 'The company\'s one mech came third-hand from Pallister Academy, a flying school, and it came cheap, because the school could not get the instructor out of it. MAVIS is still in there. She has the transponder announcing a CADET UNDER INSTRUCTION to every broker in the sector, which is why this board is empty, and she will not clear it until somebody passes her course. Six lessons and a final examination, on our own range. Chief Dutch says to just pass it.',
    wire: 'Every broker in the sector can read a transponder. Ours says CADET UNDER INSTRUCTION. There is one way to change it.',
    sites: { lz: [0, 22, 0, ''], g1: [4, -128, 30, ''], g2: [-82, -212, 30, ''], g3: [-28, -322, 30, ''], range: [-28, -418, 46, 'FIRING POINT'], butts: [-28, -524, 64, 'THE BUTTS'], table: [-152, -456, 48, 'THE TABLE'], yard: [0, 30, 0, 'THE YARD'] },
    brf: [
      { t: 'Sit down, Commander. This will not take long, because it is not a contract. Nobody is paying us and, as far as I know, nobody is shooting. It is our own range, out of our own front door.', show: [['site', 'yard', 'THE YARD', '#ffb21a'], ['card', 'FIRST DAY', ['Not a contract: our own range', 'Flown alone', 'The only card on the board, for a reason']]] },
      { by: CREW.chief, t: "The reason's in the mech, boss. She's ex-flying-school, and the school left the instructor in. I can't get her out. She's in the transponder, and she is telling every broker in the sector there's a learner in the seat.", shot: 'who' },
      { by: STC.mav, t: 'Good morning, Cadet! I am MAVIS, your Mechanised Arts Virtual Instruction System. Six lessons, one Final Examination, and a certificate suitable for framing. I have laid out a course!', show: [['route', ['yard', 'g1', 'g2', 'g3', 'range'], '#ff9ad0'], ['site', 'butts', 'THE RANGE', '#ff9ad0'], ['face', STC.mav, ['PALLISTER ACADEMY', 'Instructor program, non-removable', 'Cheerful']]] },
      { t: 'Walk, steer, shoot, jump. She signs you off, the flag comes off our transponder, and brokers start returning my calls. That is the whole plan. Humour her.', show: [['card', 'THE COURSE', ['1 · Walking', '2 · Steering', '3 · Gunnery', '4 · Moving targets, and heat', '5 · Jump jets', '6 · She will not say']]] },
      { t: 'When you are ready, take the lift down to the bay and launch. Everything you need to know out there, she will tell you. At length.', show: [['clear'], ['site', 'yard', 'THE YARD', '#ffb21a'], ['route', ['yard', 'g1', 'g2', 'g3', 'range'], '#ff9ad0'], ['site', 'butts', 'THE RANGE', '#ff9ad0']] },
    ],
    async run(ms) {
      const S = ms.S, mav = STC.mav, snips = STC.snips, xo = ms.ops, dutch = CREW.chief, PINK = 0xff9ad0, OK = 0x54ff6a, st = player.stats, apron = gpos(0, 14), gr = {}, T0 = () => MS.t;
      const gate = k => { const i = +k[1], nx = S[i < 3 ? 'g' + (i + 1) : 'range'], pv = i > 1 ? S['g' + (i - 1)] : P.pos, G = stGate(S[k], stAng(pv, nx), PINK, 34); G.userData.beam.visible = false; return G; };
      const G = { g1: gate('g1'), g2: gate('g2'), g3: gate('g3') }, lit = k => { G[k].userData.beam.visible = true; }, pass = k => { G[k].userData.lamp.emissive.setHex(OK); G[k].userData.beam.visible = false; sfx.play('ok'); msg('GATE CLEARED', 1.6); };
      shkPoint(S.range); const TB = shkTable(S.table), onTable = () => Math.abs(P.pos.x - S.table.x) < TB.hw - .6 && Math.abs(P.pos.z - S.table.z) < TB.hw - .6 && P.pos.y > TB.top - .8;
      const tg = (dx, dz, name, face) => { const x = S.range.x + dx, z = S.range.z + dz; return shkDummy(x, z, stAng({ x, z }, S.range), name, face); };
      const D = [tg(-78, -64, 'THE LANDLORD', 0), tg(4, -108, 'A TAX INSPECTOR', 1), tg(84, -58, "DUTCH'S BROTHER-IN-LAW", 2)];
      const done = id => setObj(id, null, 1), mark = (id, text, opt) => setObj(id, text, 0, opt);
      if (!st.weapons) { await after(1.5); await tell(dutch, "Boss, hold it. She's got no guns on her, and the lady in the dashboard is going to want things shot. Bring her back in and I'll hang some on."); return lose('The KESTREL walked out onto the range with nothing fitted to either arm, and MAVIS will not examine a cadet who cannot shoot. Fit a weapon in the bay and fly it again.'); }

      /* ---- the introduction, and the way round it ---- */
      await after(1.4); tutKeys([['SPACE', 'Carry on after a message'], ['1 – 2', 'Answer a question']]);
      say(mav, 'Good morning, Cadet! I am MAVIS: your Mechanised Arts Virtual Instruction System, with the compliments of Pallister Academy. You have completed zero of six lessons. How exciting for you!');
      say(dutch, "She came with the mech, boss. She's telling the whole sector there's a student driving, and she won't stop till you pass her course. So pass it. I'll owe you one.");
      const skip = await ask(mav, 'Before we begin, Cadet, I must ask for my records. Have you operated a walking machine before?', ['Never. Start at the beginning.', 'Yes. Take me straight to the examination.'], 30, 0);
      if (skip === 1) { await tell(mav, 'A returning student! How lovely. Lessons one to five are marked "taken as read". I shall want to see it proved, mind.'); for (const k in G) { G[k].userData.lamp.emissive.setHex(OK); } }
      else {
        /* ---- 1: walking ---- */
        say(mav, 'Lesson one: Forward. Hold W, and walk her through the gate ahead of you. S is for going backwards, which at Pallister we do not do on purpose.');
        mark('l1', 'LESSON 1 — Walk through the gate'); nav('g', S.g1, 'GATE 1', '#ff9ad0'); lit('g1'); tutKeys([['W', 'Forward'], ['S', 'Reverse']]); const t1 = T0();
        await until(() => near(S.g1, 17)); pass('g1'); done('l1');
        /* ---- 2: steering ---- */
        say(mav, 'Splendid! Lesson two: Steering. A and D turn the legs. The next two gates are not in a straight line, because nothing worth walking to ever is.');
        let n = 0; mark('l2', () => `LESSON 2 — Steer through the gates · ${n} of 2`); nav('g', S.g2, 'GATE 2', '#ff9ad0'); lit('g2'); tutKeys([['W', 'Forward'], ['A', 'Turn left'], ['D', 'Turn right']]);
        await until(() => near(S.g2, 17)); pass('g2'); n = 1; MS.dirty = true; nav('g', S.g3, 'GATE 3', '#ff9ad0'); lit('g3'); chatter(mav, pick(['Lovely line! And the other way.', 'Very nearly elegant. One more.', 'Good! Now the other foot, as it were.']));
        await until(() => near(S.g3, 17)); pass('g3'); n = 2; done('l2'); gr.loco = shkGrade(T0() - t1, 34, 52);
        /* ---- 3: the torso and the triggers ---- */
        say(mav, `Locomotion: ${SHK_GRADE[gr.loco]}. Lesson three is Gunnery! Your legs go where the keys send them. Your torso goes where the MOUSE looks. Walk onto the firing point, between the lamps, and stop.`);
        mark('l3', 'LESSON 3 — Stand on the firing point'); nav('g', S.range, 'FIRING POINT', '#ff9ad0'); tutKeys([['W', 'Forward'], ['S', 'Slow down / reverse'], ['MOUSE', 'Look about']]);
        await until(() => near(S.range, 11)); unnav('g');
        say(dutch, "Knocked you up some targets out of scrap, boss. Named 'em after people this company owes money. Enjoy yourself.");
        say(mav, 'Three targets, and I have spread them out so that you must twist to find them. The LEFT mouse button fires your left arm: the laser. The RIGHT button fires the right: the rotary cannon. The ring in the middle of your view is where they will land. Begin!');
        D.forEach((e, i) => nav('d' + i, e, 'TARGET', '#ff5a3a')); mark('l3', () => `LESSON 3 — Destroy the targets · ${3 - alive(D)} of 3`); tutKeys([['MOUSE', 'Twist the torso and aim'], ['LEFT BUTTON', 'Left arm'], ['RIGHT BUTTON', 'Right arm']]); const t3 = T0(); let dn = 0;
        while (alive(D)) { await until(() => 3 - alive(D) > dn); dn = 3 - alive(D); D.forEach((e, i) => { if (e.dead) unnav('d' + i); }); MS.dirty = true; if (dn === 1) chatter(dutch, pick(["That's the landlord told.", 'Ha! Do the one with the monocle.', "He had that coming. They all did."])); }
        done('l3'); gr.gun = shkGrade(T0() - t3, 16, 30);
        /* ---- 4: things that move, and heat ---- */
        await tell(mav, `Gunnery: ${SHK_GRADE[gr.gun]}. Now look down at your feet, Cadet. Your legs and your torso no longer agree about which way is forward. X turns the legs to face the way you are looking. Remember it when you feel muddled.`);
        const B = [0, 1, 2].map(i => shkPigeon(S.butts, i)); look(B[0], 'TARGET DRONES');
        say(mav, 'Lesson four: targets that move. I am releasing three target drones. They are unarmed, and have been told to be sporting. Do mind the HEAT gauge: every shot warms the reactor, and at one hundred percent she shuts herself down to sulk. V vents coolant if you overdo it.'); B.forEach((e, i) => nav('b' + i, e, 'DRONE', '#ff5a3a')); mark('l4', () => `LESSON 4 — Shoot down the target drones · ${3 - alive(B)} of 3`); tutKeys([['LEFT BUTTON', 'Laser · hits at once'], ['RIGHT BUTTON', 'Cannon · lead the target'], ['X', 'Legs to face front'], ['V', 'Vent coolant']]); const t4 = T0(); let bn = 0;
        while (alive(B)) { await until(() => 3 - alive(B) > bn); bn = 3 - alive(B); B.forEach((e, i) => { if (e.dead) unnav('b' + i); }); MS.dirty = true; if (bn === 2) chatter(mav, 'One left! It has become nervous.'); }
        done('l4'); gr.move = shkGrade(T0() - t4, 18, 36);
        /* ---- 5: the jets ---- */
        if (st.jets) {
          say(mav, `Moving targets: ${SHK_GRADE[gr.move]}. Lesson five: Jump jets! Walk to the Table. Hold SPACE and you rise; let go and you do not. The JETS gauge is your fuel, and it fills again on the ground. Land on top, please. Cadets who land beside the Table are marked "present".`);
          mark('l5', 'LESSON 5 — Land on top of the Table'); nav('g', V3(S.table.x, TB.top, S.table.z), 'THE TABLE', '#ff9ad0'); tutKeys([['SPACE', 'Jump jets — hold to climb'], ['W', 'Forward, in the air too']]); const t5 = T0(); let on = 0;
          (async () => { await until(() => near(S.table, 52) || onTable()); if (!onTable()) chatter(mav, 'Walk up close, hold SPACE until you are above the edge, and W will carry you over it. Then let go of both.'); })();
          (async () => { const t = T0() + 34; await until(() => T0() > t || on >= .5); if (on < .5) chatter(mav, 'A hint, Cadet: if the JETS gauge is empty, let go of SPACE and stand still for a moment. It will not fill while you are holding the key. Then one long burn, from close in.'); })();
          stTick(dt => { on = onTable() && !P.air ? on + dt : 0; return on < .5 && !ms.over; }); await until(() => on >= .5); unnav('g'); done('l5'); gr.jump = shkGrade(T0() - t5, 22, 40); stShow(V3(S.table.x, TB.top, S.table.z), 4, 34);
          await tell(mav, `A gold star! Jump jets: ${SHK_GRADE[gr.jump]}. They are also how one leaves a place in a hurry, which Pallister does not teach but does acknowledge.`);
        } else await tell(mav, `Moving targets: ${SHK_GRADE[gr.move]}. Lesson five is Jump Jets, and I see that yours have been taken off. I shall write "excused". Do fit some one day, Cadet: they are the only part of this machine that is any fun.`);
      }
      for (const e of D) if (!e.dead) e.team = 2;
      if (MS.obj.length) { MS.obj.length = 0; setObj('ls', st.jets ? 'LESSONS 1 TO 5 — Passed' : 'LESSONS 1 TO 4 — Passed · 5 excused', 1); }   /* one line for the lot: the list is about to be needed for something else */

      /* ---- 6: the examination nobody was told about ---- */
      tutKeys(null);
      await tell(mav, 'Which brings us to the Final Examination! Regulations ask for live opposition, so I placed an advertisement. "WANTED: opponents for a novice pilot. One small machine, no escort, valuable hangar." I have had ever so many replies!');
      const R = [], tail = { name: 'TAILOR', legs: 'rap', torso: 'pod', head: 'can', armL: 'sw1', armR: 'las', back: 'snk', sinks: 2, paint: FAC.maw.paint }; let SN = null, crates = 0;
      const ship = dropship(-34, -6, () => {
        SN = mkMech(-34, -6, tail, 1, { ai: 'guard', skill: .55, hpK: 1.5, yaw: 0 }); SN.name = "SNIPS' TAILOR"; SN.vk = .82; fieldWho(snips, SN); R.push(SN);
        for (const [x, z] of [[-62, 34], [28, -30]]) R.push(mkTank(x, z, 1, { v: 'dingo' })); for (const [x, z] of [[-20, 30], [40, 10]]) { const d = mkDrone(x, z, 1); d.name = 'REAVER DRONE'; R.push(d); }
      }, PI / 2, 1);
      say(xo, 'Commander, this is Varga. A Red Maw dropship has just come in over the east fence, and it is putting down on our apron. I take it that this is the machine\'s doing.');
      await until(() => SN); look(SN, 'RED MAW — ON THE APRON'); nav('y', apron, 'THE YARD', '#ff5a3a');
      say(snips, "Afternoon! Snips Halvard, Red Maw Salvage and Clearance. Lovely advert. No, don't get up, we'll see ourselves round. Lads! Fuel first, then anything with wheels on.");
      say(dutch, "They are UNBOLTING my FUEL TANKS. Boss! Hold SHIFT and RUN!");
      say(mav, 'Lesson six: Sprinting, followed by Everything Else. Hold SHIFT with W and she runs. Running heats the reactor, so do let go before she boils. Off you go! I am timing you.');
      mark('l6', 'FINAL EXAMINATION — Get back to the yard'); tutKeys([['SHIFT + W', 'Sprint — it builds heat'], ['M', 'Map']]); const t6 = T0();
      stTick(dt => { if (ms.over || !alive(R)) return false; if (SN && !SN.dead && !SN.ej && stDist(SN.pos, apron) < 130 && (crates += dt / 60) > 6) crates = 6; return true; });   /* a crate a minute: somebody quick loses nothing */
      await until(() => near(apron, 215) || R.some(e => !e.dead && stDist(e.pos, P.pos) < 150)); gr.run = shkGrade(T0() - t6, 17, 26); for (const e of R) e.alert = true; stMend(1, 'TRAINING SAFETIES OFF — ARMOUR AT FULL');
      say(snips, "Hang about. Is that the student? Lads, it's the STUDENT. Somebody take a picture. Then take its legs.");
      say(mav, `Sprinting: ${SHK_GRADE[gr.run]}. Now, Cadet: a machine is made of parts, and so is an argument. That one has a SAW on its left arm. Aim at the arm and it will come off, saw and all. The line under your reticle tells you which part you are looking at.`);
      done('l6'); unnav('y'); mark('ex', () => `FINAL EXAMINATION — Run the Reavers off the yard · ${alive(R)} left`); mark('arm', "EXTRA CREDIT — Shoot off Snips' saw arm", true); nav('s', SN, 'SNIPS', '#ff5a3a');
      tutKeys([['LEFT / RIGHT BUTTON', 'Fire'], ['S', 'Back away from the saw'], ['R', 'Repair kit'], ['V', 'Vent coolant']]);
      let armOff = false, patched = false, kitTold = false, last = alive(R);
      SN.onKill = () => { unnav('s'); if (!ms.over) say(snips, armOff ? "Right. RIGHT. Tactical withdrawal, lads! And you can KEEP the arm, I never liked it!" : "I'm out! I'm OUT! Who gives a student live ammunition? Lads, we're leaving!"); };
      stTick(() => {
        if (ms.over || !alive(R)) return false;
        if (!armOff && SN.zones.armL && SN.zones.armL.hp <= 0) { armOff = true; done('arm'); stSet('arm', 1); bonus('Extra credit: one saw arm, detached', 4000); if (!SN.dead) chatter(snips, pick(["My ARM! Have you any idea what those cost? ...Well. I suppose you do now.", "That was my good arm! That was my ONLY good arm!"])); }
        if (!kitTold && P.armor < P.max * .6 && CO.kit > 0) { kitTold = true; chatter(dutch, "You're taking hits, boss. R is your repair kit: one press, a chunk of armour back. That's what it's for."); }
        if (!patched && P.armor < P.max * .3 && !P.dead) { patched = true; stMend(.5, 'BAY CREW — ARMOUR PATCHED'); chatter(dutch, "Got a crew out on the apron with plate and a welder. That's the one patch I can do, boss. Back off from that saw!"); }
        if (alive(R) < last) { last = alive(R); MS.dirty = true; if (last === 2 && !SN.dead) chatter(snips, pick(['Mind the PAINT!', "Oi! We'd only just nicked that one!", 'This is NOT what the advert said!'])); }
        return true;
      });
      await until(() => !alive(R)); done('ex'); if (!armOff) setObj('arm', null, 3); unnav('s'); tutKeys(null);
      const left = clamp(P.armor / P.max, 0, 1); gr.exam = left > .65 ? 4 : left > .35 ? 3 : 2; const lost = Math.floor(crates), all = Object.values(gr), avg = all.reduce((a, b) => a + b, 0) / all.length + (armOff ? .6 : 0), word = avg >= 4.2 ? 'with Distinction' : avg >= 3.3 ? 'with Merit' : avg >= 2.4 ? '' : 'for Attendance';
      stSet('grade', clamp(Math.round(avg), 1, 5)); if (!lost) bonus('Nothing stolen from the yard', 5000); else note(`Red Maw got ${lost} crate${lost > 1 ? 's' : ''} of stores onto their dropship before they were seen off.`);
      await after(1.6); stShow(apron, 6, 70);
      say(mav, `Examination complete! Opposition: dispersed. Hangar: retained. Cadet: alive, which is weighted heavily. It is my great pleasure to award you the Pallister Certificate of Basic Competence${word ? ', ' + word : ''}.`);
      say(mav, 'I am now obliged to take the student flag off your transponder. ...There. You are squawking as a licensed commercial operator. Do drive carefully. I shall be here if you need me. I shall be here regardless.');
      say(xo, `Confirmed. We are showing as ${YARD.name} on every board in the sector, and I have two brokers holding already. Bring her in to the apron, Commander. We have a company to run.`);
      note(`MAVIS's report card — ${[['Locomotion', gr.loco], ['Gunnery', gr.gun], ['Moving targets', gr.move], ['Jump jets', gr.jump], ['Sprinting', gr.run], ['Final examination', gr.exam]].filter(r => r[1]).map(([l, v]) => `${l}: ${SHK_GRADE[v]}`).join(' · ')}${armOff ? ' · Extra credit: one arm' : ''}.`);
      if (armOff) YARD.loot.push({ kind: 'gift', key: 'arm.sw1' });
      mark('home', 'Walk her back onto the apron'); nav('y', apron, 'THE APRON', '#8dff6a');
      await until(() => near(apron, 34)); done('home');
      win(`MAVIS has signed the certificate, the Red Maw have left without the fuel, and for the first time the transponder says ${YARD.name}. The board is open.`);
    },
    epi: (ok, f) => ok ? [
      [CREW.chief, f['zero.arm'] ? "He said keep the arm, boss, so I've kept it: one ripsaw, slightly shot. It's in the salvage with the rest. And nice flying. I'd have paid to watch that." : "Not a scratch on my fuel tanks that wasn't there this morning. Nice flying, boss. I'd have paid to watch that."],
      [STC.mav, f['zero.grade'] >= 4 ? 'Commander! I have filed your certificate with the Academy. You are our highest-scoring graduate this year. You are also our only graduate this year. Congratulations twice!' : 'Commander! I have filed your certificate with the Academy. There is a refresher course whenever you should want one. I do so hope you will want one.'],
    ] : [
      [CREW.chief, "She's dented, not dead, boss, and so are you. I'll have her straight by the time you've had a coffee. No bill: it's our own range."],
      [STC.mav, 'Not to worry, Cadet! At Pallister we say that failure is simply a lesson with the answers missing. I have kept your place.'],
    ],
    prize(D, add) { stGift(D, 'gear.sink', 1); CO.kit = Math.max(CO.kit, 1); },
  }],
};
