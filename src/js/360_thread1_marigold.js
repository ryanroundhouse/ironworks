/* ============ STORY THREAD 1 — MARIGOLD: A MINING TOWN ON TRACKS, THE COMPANY THAT HOLDS ITS DEBT, AND AN ELEVEN-YEAR-OLD ON THE RADIO ============ */
Object.assign(CAST, { 9101: { build: 'heavy', h: 1.6, habit: 'hips', ...stLook('#b8b8b8', 3, 'headset') }, 9103: { build: 'slim', h: 1.34, habit: 'stand', ...stLook('#1b1b1b', 3, 'headset', '#c68642') }, 9107: { build: 'lean', h: 1.86, habit: 'back', ...stLook('#3b2416', 0, 'glasses') } });
STORY.mar = {
  name: 'MARIGOLD', sub: 'A town that would rather not be repossessed', col: '#ffc94a', emp: 'tyr', foe: 'vom', who: STC.ma, open: () => true, wait: 2, flags: ['pip', 'truce', 'ram', 'toll', 'hale'],
  fin: 'A mining town stood up on four legs at Long Acre and walked over a siege battery. Vance-Okoro has written the asset off. Witnesses are being believed, slowly.',
  end: 'A town that walks owes us a favour. I intend to remember that.',
  ch: [{
    /* ---------------- I ---------------- */
    title: 'The Slowest Getaway', kind: 'escort', biome: 'desert', mood: 0, seed: 91011, diff: 2, pay: 150000, salv: 30, site: 'Saltpan Reach', op: 'SLOW TRAIN',
    tease: 'A mining crawler called Marigold — forty-six metres of track with a town of two hundred on its back — slipped its moorings on Saltpan Reach an hour ahead of the bailiffs. Vance-Okoro holds the debt and wants the asset, houses and all. The Mayor wants an escort to Thresher Gap, where their writ runs out. She is offering the contents of the town strongbox, and a hot meal.',
    wire: 'A mining town on tracks has gone missing from the Vance-Okoro ledger. Its mayor is on an open channel, asking for mercenaries.',
    sites: { lz: [-620, 470, 40, 'LZ'], town: [-500, 370, 62, 'MARIGOLD'], w1: [-180, 200, 46, 'DRY WELLS'], w2: [200, -120, 48, 'THE RIBS'], gate: [600, -480, 62, 'THRESHER GAP'], repo: [-250, -420, 50, 'V-O CAMP'] },
    roads: [['town', 'w1', 'w2', 'gate']],
    brf: [
      { t: 'Listen up. This one did not come through a broker. It came in over an open channel, from a woman who introduced herself as the Mayor.', show: [['site', 'lz', 'LZ · DROPSHIP', '#8dff6a'], ['card', 'THE JOB', ['Escort one vehicle across Saltpan Reach', 'Client: the town of Marigold, population 212', 'Opposition: Vance-Okoro Asset Recovery']]] },
      { t: 'The vehicle is the town. Marigold is a mining crawler: forty-six metres long, and two hundred people live on her back. Vance-Okoro bought her debt and means to collect the whole thing, kitchens included.', show: [['site', 'town', 'MARIGOLD', '#ffc94a'], ['face', STC.ma, ['Mayor. Also the driver', 'Has run the town for thirty years', 'Asked us to "bring a big one"']]] },
      { t: 'She is running for Thresher Gap. The V-O writ stops at that ridge line; past it they need a new court order, and that takes them a week. Fourteen hundred metres. At her speed, most of an afternoon.', show: [['route', ['town', 'w1', 'w2', 'gate'], '#ffc94a'], ['site', 'gate', 'THRESHER GAP', '#8dff6a'], ['card', 'ROUTE', ['Dry Wells — the Ribs — Thresher Gap', '1.4 km at a brisk walk', 'She slows under fire. She does not stop']]] },
      { by: CREW.intel, t: 'Opposition. Asset Recovery keeps a field team at this camp — light mechs, armour, a drone flight. Their assessor is a man named Hale. By reputation he would rather serve you a notice than shoot you. His employers do not share the preference.', show: [['foe', 'repo', 'V-O RECOVERY TEAM'], ['ring', 'repo', 260, 'PATROLS'], ['face', STC.hale, ['Assessor, Asset Recovery', 'Meticulous. Not known to be cruel', 'Carries the paperwork in triplicate']]] },
      { by: CREW.intel, t: 'Two things I cannot give you. I do not know what is waiting at the Gap itself: the last pass had dust over it. And the weather service says clear skies all day. The weather service on Saltpan Reach is one man with a wet finger.', show: [['unk', 'gate', 'UNCONFIRMED'], ['unk', 'w2', 'WEATHER?']] },
      { by: CREW.chief, t: "One from me, boss. I've worked on that class of crawler. She's older than this company and built like a dam. She'll take a beating — but she turns like a dam as well, so nobody is dodging anything. Keep them off her tracks.", show: [['card', 'MARIGOLD', ['Hadley-Voss Type 9 crawler, about 80 years old', '2,100 tonnes with the town aboard', 'Armour: considerable. Agility: none', 'Do not stand in front of her']]] },
      { t: 'So. Meet the Mayor, walk her town to the Gap, and keep Vance-Okoro off it for fourteen hundred metres. It is the slowest getaway this sector has ever seen, and we are driving escort.', show: [['clear'], ['site', 'town', 'MARIGOLD', '#ffc94a'], ['route', ['town', 'w1', 'w2', 'gate'], '#ffc94a'], ['site', 'gate', 'THRESHER GAP', '#8dff6a'], ['foe', 'repo', 'V-O RECOVERY TEAM']] },
    ],
    async run(ms) {
      const S = ms.S, ma = STC.ma, pip = STC.pip, hale = STC.hale, xo = ms.ops, vo = { paint: FAC.vom.paint }, mw = { paint: FAC.maw.paint, tier: 0 };
      const M = stCrawler(S.town, stRoad([S.town, S.w1, S.w2, S.gate]), { halt: true }), togo = () => Math.round(stDist(M.pos, S.gate) / 10) * 10; fieldWho(ma, M); fieldWho(pip, M);
      M.onKill = () => lose('Marigold burned on the flats, a long way short of the Gap. The town got off on foot. The assessor got his asset.', .1);
      stTick(() => { if (ms.over || M.dead) return false; M.slow = !ms.v.ram && FD.t0.some(e => e.team === 1 && e.kind !== 'struct' && e.kind !== 'turret' && stDist(e.pos, M.pos) < 120) ? .5 : 1; return true; });
      nav('m', M, 'MARIGOLD', '#ffc94a'); setObj('a', 'Walk out to Marigold and meet the Mayor');
      await after(3); chatter(ma, "You'll be the hired help. Hester Oyelaran — I'm the Mayor. I'm also the driver, the fire brigade and the school board, so if I sound busy, I am. Come over where I can see you.");
      await until(() => near(M.pos, 135));
      await tell(pip, "Is that the mech? MA. IT'S THE MECH. Hello! I'm Pip, I do the radio, I'm eleven. Your mech's got really big feet. I'm going to call you Biscuit.");
      const r0 = await ask(ma, 'That is my granddaughter. She comes with the town. Vance-Okoro bought our debt on a Tuesday and sent the bailiffs on the Wednesday, so we are leaving on the Thursday. Thresher Gap, and no stopping. Ready?', ['Roll her out, Mayor.', 'Biscuit?', "Two hundred people on a tractor. I've had worse plans."], 20, 0);
      if (r0 === 1) { chatter(pip, 'Because of the FEET. Keep up, Biscuit!'); stSet('pip', 1); } else if (r0 === 2) chatter(ma, 'So have I, and I married one of them. Engines!');
      M.halt = false; sfx.play('servo'); setObj('a', null, 1); setObj('m', () => `Escort Marigold to Thresher Gap — ${togo()} m to run`); nav('g', S.gate, 'THRESHER GAP', '#8dff6a');
      /* the first notice */
      await until(() => stDist(M.pos, S.town) > 100);
      const r1 = await ask(hale, 'Vehicle designated MARIGOLD, and escort: Assessor Hale, Vance-Okoro Asset Recovery. You are in unlawful possession of a company asset — to wit, yourselves. Kindly halt, and nobody need be itemised.', ['She is not stopping, Assessor.', 'Itemised?', '(Say nothing.)'], 18, 2);
      look(stFrom(.75, M.pos, stAng(M.pos, S.repo), 300, { ...vo, focus: M })[0], 'V-O RECOVERY TEAM'); msg('V-O RECOVERY TEAM INBOUND', 3); sfx.play('alarm');
      say(hale, r1 === 1 ? 'Damaged goods are entered line by line. It takes days. I would much rather not. ...Recovery team, proceed.' : r1 ? 'Silence is noted, and will be minuted. Recovery team, proceed.' : 'Then I am obliged to proceed. I want it recorded that I asked nicely.');
      /* Dry Wells: nobody briefed a thrown track */
      await until(() => M.past(S.w1));
      M.halt = true; _v.copy(M.pos); _v.y += 3; explode(FD.fx, _v.clone(), 1.6); sfx.play('clang'); P.shake += .3;
      await tell(ma, 'That bang was the port track pin, and I felt it in my teeth. Ninety seconds to drift a new one in. Pip — head inside, please.');
      chatter(pip, "I'm HELPING. Biscuit, don't let them shoot my house — it's the blue one!");
      const t0 = ms.t + 90; setObj('h', () => `Hold at Dry Wells while the track is pinned — ${secs(t0)}`);
      look(stFrom(.7, M.pos, stAng(M.pos, S.repo) + .5, 280, { ...vo, focus: M })[0], 'V-O RECOVERY TEAM'); say(xo, 'They have seen her stop. Second team coming in off the camp road — hold them off the tracks.');
      await after(42); if (ms.t < t0) stFrom(.6, M.pos, stAng(M.pos, S.repo) - .9, 280, { ...vo, focus: M });
      await until(() => ms.t >= t0); setObj('h', null, 1); M.halt = false; say(ma, 'Pin is in. She has thrown worse and walked it off. Rolling!');
      /* the Ribs: a sandstorm, and what comes with it */
      await until(() => stDist(M.pos, S.w1) > 110);
      const st = EV.B.storm; weatherShift(st[1], st[2], st[3], 12); await tell(CREW.intel, 'Mira. That clear sky I promised you has a wall of sand in it, coming up from the south at speed. The weather service sends its regrets.');
      await after(7);
      const maw = () => stFrom(.8, M.pos, stAng(S.w1, S.w2) + PI / 2 + rand(-.4, .4), 230, { ...mw, focus: M }); let G = maw(); msg('UNKNOWN CONTACTS IN THE STORM', 3); sfx.play('alarm'); look(G[0], 'UNKNOWN CONTACTS');
      await tell(xo, 'New contacts in the storm, and they are not Vance-Okoro. Red Maw paint. Somebody smelled a town with no walls.');
      chatter(pip, "Biscuit? There's people in the sand. They've got teeth painted on.");
      const r2 = await ask(hale, 'Hale. Those are Reavers, and they will strip that town to the axles with the people still in it. A stripped asset is a write-off. I propose a truce until the dust settles — purely as an accounting decision.', ['Truce. Put your guns on the storm.', 'No deals with bailiffs.'], 18, 0);
      if (r2 === 0) {
        stSet('truce', 1); ms.v.voA = spawn({ mech: 2, tank: 1, tier: 1 }, ...stOff(M.pos, stAng(M.pos, S.repo), 150), 0, 30, 0, { paint: FAC.vom.paint, ai: 'follow', lead: M, skill: 1, name: 'V-O RECOVERY' });
        say(hale, 'Recovery team: new instruction. The town is to be protected. ...Yes. I know what I said this morning.'); note("You took the assessor's truce in the storm.");
      } else { say(hale, 'Then I shall recover whatever they leave. For the record, I find that distasteful.'); G = G.concat(stFrom(.5, M.pos, stAng(M.pos, S.repo), 300, { ...vo, focus: M })); note("You refused the assessor's truce."); }
      (async () => { await after(26); if (!M.past(S.w2)) maw(); })();
      await until(() => M.past(S.w2));
      weatherShift(EV.mood[1], EV.mood[2], EV.mood[3], 14);
      if (ms.v.voA) { leave(ms.v.voA); say(hale, 'The dust has settled, and so has our arrangement. I shall see you at the Gap. Do drive carefully.'); }
      chatter(pip, `Biscuit! I counted. You got ${P.kills} of them. I'm writing it on the wall.`);
      /* the Gap, and what Mira could not see under the dust */
      const B = stBig(mkMech(S.gate.x, S.gate.z, { ...PRESETS[2], paint: FAC.vom.paint }, 1, { ai: 'guard', skill: 1.2, hpK: 2.4, name: 'THE BAILIFF', yaw: stAng(S.gate, S.w2) }), 1.3); spawn({ turret: 2 }, S.gate.x, S.gate.z, 34, 50);
      await until(() => stDist(M.pos, S.gate) < 400);
      nav('b', B, 'THE BAILIFF', '#ff5a3a'); look(B, 'THE BAILIFF');
      await tell(xo, "Contact in the Gap. Mira's unknown has a name painted on it: THE BAILIFF. Assault frame, half as big again as it has any right to be, parked in the only road out.");
      say(hale, 'I did say a notice would be served. That is the notice.'); setObj('b', 'Clear THE BAILIFF out of Thresher Gap', 0, true);
      await until(() => B.dead || stDist(M.pos, B.pos) < 230);
      if (!B.dead) {
        await tell(ma, 'Mercenary, kindly step out of the road. Pip — everybody holds on to something that is bolted down. That includes you.');
        chatter(pip, 'IS MA GOING TO— SHE IS. SHE IS!');
        ms.v.ram = true; M.path = [B.pos]; M.wp = 0; M.speed = 16; M.turn = .7; setObj('b', 'THE BAILIFF — stay out of the road', 0, true);
        await until(() => B.dead || stDist(M.pos, B.pos) < 44);
        if (!B.dead) {
          const at = B.pos.clone(); at.y += B.cy; killEnt(B, 2); explode(FD.fx, at, 4); sfx.play('clang'); sfx.play('boom', 1.5); P.shake += 1; M.hp = Math.max(300, M.hp - 400); stSet('ram', 1);
          msg('MARIGOLD HAS SERVED NOTICE', 4); setObj('b', 'THE BAILIFF — run over by a town', 1); note('Marigold rammed THE BAILIFF out of Thresher Gap.'); bonus('One bailiff, flattened', 15000);
          await tell(ma, 'There. Notice served.'); say(hale, '...I shall need a new form for that.');
        }
        ms.v.ram = false; M.speed = 8; M.turn = .32; M.route([S.gate]);
      }
      if (!stGet('ram')) { setObj('b', null, 1); unnav('b'); chatter(pip, 'Awww. Ma wanted to run him over.'); }
      await until(() => stDist(M.pos, S.gate) < 40); M.halt = true; stShow(M.pos, 6, 50);
      await tell(ma, "Thresher Gap. Their writ stops at that ridge, and so do they. There's a meal owing to you, mercenary, and I do not forget what is owed. I have had the practice.");
      win(`Marigold rolled through Thresher Gap with the whole town aboard${stGet('ram') ? ', and a bailiff under it' : ''}.`);
    },
    epi: (ok, f) => ok ? [
      [STC.ma, "We're parked up past the ridge and the kettle is on. V-O will be back with better paper — they always are. When they come, I would like it to be you I call."],
      [STC.pip, f['mar.ram'] ? "Biscuit! Ma ran over a ROBOT. There's a dent in the front of the town and I painted eyes on it. You have to come and see." : "Biscuit! I drew you on the water tower. You're the one with the feet."],
      f['mar.truce'] ? [CREW.intel, 'A footnote. Hale filed the truce as "joint protection of a contested asset". He did not have to file it at all. Interesting man.'] : null,
    ] : [
      [STC.ma, 'We are stopped, and they have put a clamp on her tracks the size of a house. They cannot tow her and they cannot make us get off, so here we sit. Come back when you can, mercenary.'],
      [STC.pip, 'Biscuit? Are you coming back? Ma says you are.'],
    ],
    prize(D, add) { stGift(D, 'gear.kit', 1); add('The Marigold strongbox (small coin, mostly)', 9000); repAdd('tyr', 4, 'saw a mining town through Thresher Gap'); },
  }, {
    /* ---------------- II ---------------- */
    title: 'High Water', kind: 'escort', biome: 'jungle', mood: 1, seed: 91027, diff: 3, pay: 190000, salv: 30, site: 'Sennet Lowlands', op: 'WET FEET',
    tease: 'Marigold has a claim waiting at Long Acre and one river valley left to cross to reach it. The Karsk Directorate holds the weir road and charges for it. Vance-Okoro is a day behind with new paper and more machines. It has been raining for a week. The Mayor says it will be fine, in the voice of somebody who has said that before.',
    wire: 'The walking-pace fugitive Marigold has been sighted in the Sennet Lowlands, heading for the weir road in a monsoon. Her mayor is asking for the same mercenaries.',
    sites: { lz: [-560, -500, 40, 'LZ'], town: [-460, -400, 62, 'MARIGOLD'], toll: [-120, -160, 60, 'SENNET TOLL'], ford: [240, 120, 52, 'THE FORD'], high: [560, 460, 70, 'BELL HILL'], weir: [-380, 380, 46, 'SENNET WEIR'] },
    roads: [['town', 'toll', 'ford', 'high']],
    brf: [
      { t: 'Marigold again. She made the Gap, and Vance-Okoro went away for exactly as long as it took to find a judge. She is moving while she still can.', show: [['site', 'lz', 'LZ · DROPSHIP', '#8dff6a'], ['site', 'town', 'MARIGOLD', '#ffc94a'], ['card', 'THE JOB', ['Escort Marigold across the Sennet Lowlands', 'Thirteen hundred metres, most of it mud', 'She is as fast as she was last time']]] },
      { t: 'The road runs through the toll at Sennet, over the ford, and up on to Bell Hill. Once she is on the hill she is on rock, above the river, and a day from her claim.', show: [['route', ['town', 'toll', 'ford', 'high'], '#ffc94a'], ['site', 'high', 'BELL HILL', '#8dff6a'], ['site', 'ford', 'THE FORD', '#ffc94a']] },
      { by: CREW.intel, t: 'The toll. Karsk River Authority: a blockhouse, sentry guns, a couple of machines. They are not our enemy and they are not our friend — they are a turnstile with artillery. How Marigold gets through it is the Mayor\'s business and yours.', show: [['unk', 'toll', 'KARSK TOLL — NEUTRAL'], ['ring', 'toll', 150, 'SENTRY GUNS'], ['card', 'SENNET TOLL', ['Karsk River Authority', 'Will want paying. Can be argued with', 'Shooting them has consequences with Karsk']]] },
      { by: CREW.intel, t: 'Vance-Okoro is behind you this time, not in front. Drones first; they fly over mud. The heavier machines will catch up wherever she stops. So try not to let her stop.', show: [['foe', [-640, -180], 'V-O PURSUIT'], ['foe', [-300, -640], 'V-O DRONES']] },
      { by: CREW.chief, t: "The ford's the bit I don't like. River's a metre up on last month and that's a two-thousand-tonne town on a gravel bar. If she bogs, she bogs. Don't ask me what you do then. Push, I suppose.", show: [['ring', 'ford', 120, 'SOFT GROUND'], ['card', 'THE RIVER', ['Running high after a week of rain', 'Held back upstream by Sennet Weir', 'Mechs wade. Towns do not']]] },
      { t: 'The weir is upstream, here. It is Karsk property and none of our concern. I am pointing it out so that you know where the water comes from.', show: [['site', 'weir', 'SENNET WEIR', '#5ac8ff']] },
      { t: 'Through the toll, over the ford, up the hill. Keep the drones off her roofs. And stay friendly with the Mayor — I have a feeling about that town.', show: [['clear'], ['site', 'town', 'MARIGOLD', '#ffc94a'], ['route', ['town', 'toll', 'ford', 'high'], '#ffc94a'], ['site', 'high', 'BELL HILL', '#8dff6a'], ['unk', 'toll', 'KARSK TOLL']] },
    ],
    async run(ms) {
      const S = ms.S, ma = STC.ma, pip = STC.pip, hale = STC.hale, xo = ms.ops, vo = { paint: FAC.vom.paint }, kc = mkChar(ms.c.seed + 3, 'KARSK RIVER AUTHORITY · SENNET TOLL', FAC.kar.col, 'Toll-Captain');
      const M = stCrawler(S.town, stRoad([S.town, S.toll]), { halt: true }), togo = () => Math.round(stDist(M.pos, S.high) / 10) * 10, back = () => stAng(M.pos, S.town); fieldWho(ma, M); fieldWho(pip, M);
      M.onKill = () => lose('Marigold is hull-down in the Sennet mud with the river coming up round her. The town is on the roofs, waiting for boats.', .1);
      stTick(() => { if (ms.over || M.dead) return false; if (!ms.v.bog) M.slow = FD.t0.some(e => e.team === 1 && e.kind === 'mech' && stDist(e.pos, M.pos) < 110) ? .55 : 1; return true; });
      /* the toll: a blockhouse, its guns and two machines, all of them neutral until somebody decides otherwise */
      const ta = stAng(S.toll, S.ford), K = [mkStruct('bunker', ...stOff(S.toll, ta + PI / 2, 34), 2, { name: 'SENNET TOLL HOUSE', ry: ta }), ...[-1, 1].map(s => mkTurret(...stOff(S.toll, ta + s * 1.2, 40), 2)), mkTurret(...stOff(S.toll, ta - PI / 2, 44), 2),
        ...[0, 1].map(i => mkMech(...stOff(S.toll, ta + PI / 2 + (i ? .5 : -.5), 52), { ...PRESETS[i ? 1 : 4], paint: FAC.kar.paint }, 2, { ai: 'hold', name: 'KARSK RIVER GUARD', skill: 1.1, hpK: 1.2, yaw: ta + PI }))]; fieldWho(kc, K[0]);
      const sl = mkStruct('gen', S.weir.x, S.weir.z, 2, { name: 'SENNET WEIR SLUICE', hpK: 9 }); sl.inv = true;
      nav('m', M, 'MARIGOLD', '#ffc94a'); setObj('m', () => `Escort Marigold to Bell Hill — ${togo()} m to run`); nav('g', S.high, 'BELL HILL', '#8dff6a');
      await after(3); await tell(ma, 'Morning, mercenary. It is raining sideways and the river is up, so we are doing this today. Bell Hill is thirteen hundred metres of mud that way.');
      chatter(pip, "BISCUIT! I saved you a seat. It's on the roof. It's wet."); M.halt = false; sfx.play('servo');
      await until(() => stDist(M.pos, S.town) > 130);
      look(spawn({ drone: 3 + (ms.c.diff >> 1) }, ...stOff(M.pos, back() + .5, 260), 0, 40, 1)[0], 'V-O DRONES'); say(xo, 'Drone flight coming up the valley behind you. Vance-Okoro has found her. Keep them off the roofs.');
      /* Sennet toll */
      await until(() => stDist(M.pos, S.toll) < 150 || M.arrived); M.halt = true;
      const r = await ask(kc, 'Karsk River Authority, Sennet. Toll for one vehicle of — is that a TOWN? ...Forty thousand. Per axle. I am being generous and calling it one axle.', ['Pay the forty thousand.', 'Raise the barrier or lose it.', 'Mayor? He is all yours.'], 20, 0);
      if (r === 0) { stSet('toll', 1); stPay('Sennet toll, one axle', -40000); say(kc, 'The Directorate thanks you. Mind the ford; it is not what it was.'); note('You paid the Karsk toll at Sennet.'); }
      else if (r === 1) {
        stSet('toll', 2); rep('kar', -8); setTeam(K, 1, { alert: true, ai: 'hunt' }); say(kc, 'You are threatening a toll booth. ...All posts, the barrier is under attack!'); setObj('t', () => `Break the Sennet toll — ${alive(K)} left`);
        await until(() => !alive(K)); setObj('t', null, 1); chatter(ma, 'I would have paid him, you know. I would have complained, and then I would have paid him.'); note('You shot your way through the Karsk toll.');
      } else {
        stSet('toll', 3); await tell(ma, 'Young man, your number two sluice motor has been screaming since we came over the rise. I have two hundred people aboard and forty of them are fitters. We mend your motor; you lift your barrier.');
        await tell(kc, '...It has been doing that since March. Fine. One hour.'); chatter(ma, 'Ten minutes. Pip, fetch the big spanner.');
        const t0 = ms.t + 60; setObj('t', () => `Hold at the toll while the fitters work — ${secs(t0)}`); setTeam(K, 0);
        look(stFrom(.9, M.pos, back(), 300, { ...vo, focus: M })[0], 'V-O PURSUIT'); say(xo, 'And there is the pursuit, right on time. She is stopped and they know it. The toll guns are on your side for as long as the fitters are inside.');
        await until(() => ms.t >= t0); setObj('t', null, 1); setTeam(K, 2); rep('kar', 3); say(kc, 'It has stopped screaming. I had forgotten what quiet was. Go on — barrier is up.'); note('Marigold\'s fitters mended the Karsk sluice motor for passage.');
      }
      M.route([S.ford, S.high]); M.halt = false;
      /* what Head Office did */
      await until(() => stDist(M.pos, S.toll) > 170);
      await tell(hale, 'Assessor Hale. Head Office has reviewed my conduct at the Gap and has taken a decision over my signature. I want you to know that it was not my signature. Get her off the low ground. Now.');
      sl.inv = false; killEnt(sl, 2); for (let i = 0; i < 5; i++) { const [x, z] = stOff(S.weir, rand(TAU), rand(30)); explode(FD.fx, V3(x, S.weir.y + rand(4, 14), z), rand(2, 4)); } sfx.play('boom', 1.6); P.shake += .6; look(S.weir, 'SENNET WEIR');
      await tell(xo, 'That was Sennet Weir. They have blown the sluice. Everything the monsoon put behind it is coming down this valley, and the ford goes under first.');
      const w0 = EV.wl, t1 = ms.t + 185; msg('THE WEIR IS GONE — THE RIVER IS RISING', 4); sfx.play('alarm');
      stTick(dt => { if (ms.over) return false; EV.wl = Math.min(w0 + 7, EV.wl + dt * 7 / 170); FD.water.position.y = EV.wl; return true; });
      setObj('f', () => `Get Marigold over the ford before the crest — ${secs(t1)}`); chatter(pip, "Biscuit, the river's in the KITCHEN.");
      (async () => { await until(() => ms.t >= t1 && !ms.v.clear); M.halt = true; lose('The crest came down the valley and took the engine deck. Marigold sits in the ford with the river running through her streets.', .1); })();
      /* the ford: she bogs. Nobody briefed pushing a town */
      await until(() => stDist(M.pos, S.ford) < 60); ms.v.bog = true; M.slow = .1;
      await tell(ma, 'She is bogged. Tracks are turning and we are not. I need another thousand horsepower and I do not have it.');
      await tell(pip, 'BISCUIT. GET BEHIND US AND PUSH.'); setObj('p', 'Put your mech against her stern and push'); let pushed = 0, told = 0;
      const stern = () => _v2.set(M.pos.x - Math.sin(M.yaw) * 30, 0, M.pos.z - Math.cos(M.yaw) * 30);
      stTick(dt => {
        if (ms.over || !ms.v.bog) return false; const s = stern(), on = Math.hypot(P.pos.x - s.x, P.pos.z - s.z) < 17 && !P.dead; M.slow = on ? 1.05 : .1;
        if (on) { pushed += dt; P.heat += 3 * dt; if (Math.random() < .5) { _v.set(rand(-9, 9), 1, -24); M.obj.localToWorld(_v); puff(FD.fx, _v, 2, 3.5, .45, .35, 2, 4); } if (pushed > 2 && !told) { told = 1; msg('SHOULDER TO THE HULL — KEEP PUSHING', 3); chatter(pip, "IT'S WORKING! MA! BISCUIT'S PUSHING THE WHOLE TOWN!"); } }
        return true;
      });
      stFrom(.7, M.pos, back() + .4, 300, { ...vo, focus: PE }); spawn({ drone: 3 }, ...stOff(M.pos, back() - .6, 240), 0, 40, 1);
      await until(() => stDist(M.pos, S.high) < stDist(S.ford, S.high) - 75);
      ms.v.bog = false; ms.v.clear = true; M.slow = 1; setObj('p', null, 1); setObj('f', null, 1); stSet('pip', 1);
      await tell(ma, 'She is out! Gravel under the tracks. Mercenary, in thirty years nobody has ever pushed my town, and I am not sure how I feel about it.');
      look(stFrom(.9, M.pos, stAng(M.pos, S.high) + .7, 260, { ...vo, focus: M })[0], 'V-O PURSUIT'); say(xo, 'Last of the pursuit, cutting the corner to get ahead of her before the hill. Break them and she is clear.');
      await until(() => stDist(M.pos, S.high) < 40); M.halt = true;
      await tell(ma, 'Bell Hill. Rock under us and the river where it belongs — which is down there, with Vance-Okoro. Long Acre tomorrow. You will come and see it, mercenary. That is not a request.');
      win('Marigold crossed the Sennet in flood, shoved over the ford by her own escort, and is on Bell Hill above the water.');
    },
    epi: (ok, f) => ok ? [
      [STC.pip, 'Biscuit! I told EVERYONE you pushed the town. Nobody believes me. Ma says to tell them she was there.'],
      [CREW.chief, 'Boss. There are track marks on your shoulder plates. Track marks. I am not going to ask. I am going to buff them out and think about it for a long time.'],
      f['mar.toll'] === 3 ? [CREW.intel, 'The Sennet toll-captain has logged Marigold as "maintenance contractors, exempt". Karsk thinks rather better of us this week.'] : f['mar.toll'] === 2 ? [CREW.intel, 'Karsk has noticed that it is short one toll booth. They know whose escort it was.'] : null,
      [STC.ma, 'Head Office blew a weir to stop one old woman moving her house. That is not debt collection any more. Whatever comes next will not be bailiffs.'],
    ] : [
      [STC.ma, 'We are on the roofs with the river going past the windows. Nobody drowned. She will dry out — she has before. Come back when the water drops and we will try it again.'],
      [STC.pip, "Biscuit, there's a FISH in my ROOM."],
    ],
    prize(D, add, f) { stGift(D, 'gear.cool', 2); add("Marigold fitters' guild, whip-round", 12000); if (f['mar.toll'] === 3) repAdd('kar', 4, 'the Sennet toll: a sluice motor mended instead of a fight'); },
  }, {
    /* ---------------- III ---------------- */
    title: 'Marigold Stands', kind: 'garrison', biome: 'forest', mood: 1, seed: 91043, diff: 3, pay: 260000, salv: 35, site: 'Long Acre', op: 'FRONT PORCH',
    tease: 'Marigold is parked on her own claim at Long Acre: filed, stamped, and paid for with the last of the ore. Vance-Okoro has stopped sending bailiffs. It has hired a contract battalion, with guns, to remove an obstruction from a property it does not own. The town has pulled her tracks for the winter and cannot run. The Mayor asks whether you would care to come and stand on her front porch.',
    wire: 'Vance-Okoro has let a contract for "site clearance" at Long Acre. The site is a town. The town has hired back.',
    sites: { lz: [-170, 400, 40, 'LZ'], town: [0, 40, 84, 'MARIGOLD · LONG ACRE'], north: [-90, -640, 46, 'NORTH ROAD'], west: [-660, -80, 46, 'WEST CUT'], bat: [560, -430, 74, 'KESSEL RIDGE'] },
    roads: [['town', 'bat']], guests: [STC.ma, STC.pip],
    brf: [
      { t: 'We have guests. Mayor Oyelaran of Marigold, and her signals officer. Mayor, it is your town — tell them.', show: [['site', 'lz', 'LZ · DROPSHIP', '#8dff6a'], ['site', 'town', 'MARIGOLD', '#ffc94a'], ['card', 'THE JOB', ['Hold Long Acre against a contract battalion', 'Marigold is parked on her own claim', 'Tracks are pulled for winter. She cannot run']]] },
      { by: STC.ma, t: 'Long Acre is ours. Filed, stamped, paid for with the last of the ore. Vance-Okoro\'s answer was to stop sending bailiffs and hire soldiers. I have two hundred people, forty fitters, and one mining laser. And you.' },
      { by: STC.pip, t: "I'm the gunner! It's on the ROOF. Ma says I only shoot what Biscuit is looking at, that's the rule. Is it true your mech has a toilet?" },
      { t: '...Moving on. The battalion will come down the north road and through the west cut. Three waves, if they follow their own manual. They are paid by the day, so they will not hurry and they will not be brave.', show: [['foe', 'north', 'BATTALION — NORTH ROAD'], ['foe', 'west', 'BATTALION — WEST CUT'], ['route', ['north', 'town'], '#ff5a3a'], ['route', ['west', 'town'], '#ff5a3a']] },
      { by: CREW.intel, t: 'They also have guns. Siege guns: I have the purchase order, not the position. Somewhere within eight hundred metres with a line to the town. I have three candidate ridges and no way to choose.', show: [['unk', 'bat', 'GUNS?'], ['unk', [470, 380], 'GUNS?'], ['unk', [-520, -520], 'GUNS?'], ['ring', 'town', 800, 'SIEGE GUN RANGE']] },
      { by: CREW.chief, t: "The laser's a Hadley drill head, boss. Meant for cutting basalt. It'll go through a mech like a hot spoon — if the kid can hit one. She fires where your reticle sits. Paint the target and count to six.", show: [['card', 'THE DRILL LASER', ['Roof-mounted, crewed by P. Oyelaran (11)', 'Fires on whatever you are aiming at', 'About six seconds to recharge', 'The fitters will patch you between waves']]] },
      { t: 'Hold the porch. Break three waves. If the guns open up, we find them then. Marigold cannot move, so there is nowhere to fall back to — which does simplify the planning.', show: [['clear'], ['site', 'town', 'MARIGOLD', '#ffc94a'], ['foe', 'north', 'NORTH ROAD'], ['foe', 'west', 'WEST CUT'], ['unk', 'bat', 'GUNS?']] },
    ],
    async run(ms) {
      const S = ms.S, ma = STC.ma, pip = STC.pip, hale = STC.hale, xo = ms.ops, vo = { paint: FAC.vom.paint }, M = stCrawler(S.town, [], { halt: true, gun: true, hp: 3800 }); fieldWho(ma, M); fieldWho(pip, M);
      M.onKill = () => lose('The guns found the engine deck. Marigold is burning on her own claim, and Vance-Okoro is filing for the salvage.', .1);
      nav('m', M, 'MARIGOLD', '#ffc94a'); setObj('m', 'Hold Long Acre — keep the battalion off the town');
      /* Pip's rule: she shoots what Biscuit is looking at */
      let zt = 4, hits = 0; stTick(dt => { if (ms.over || M.dead) return false; if ((zt -= dt) > 0) return true; const tg = nearestToAim(); if (!tg || tg.kind === 'struct' || stDist(tg.pos, M.pos) > 520) { zt = .4; return true; } zt = 6; M.zap(tg, 230); if (tg.dead && ++hits % 3 === 1) chatter(pip, pick(['GOT ONE!', "That's the rule! You look, I shoot!", 'Did you SEE that? MA, DID YOU SEE?'])); return true; });
      const wave = (k, site, label, o = {}) => { const W = stFrom(k, S[site], stAng(S[site], S.town), 60, { ...vo, focus: M, ...o }); look(W[0], label); msg(`${label} — INBOUND`, 3); sfx.play('alarm'); return W; };
      const mend = () => { stMend(.3, "MARIGOLD'S FITTERS ARE PATCHING YOUR ARMOUR"); M.hp = Math.min(M.max, M.hp + 500); };
      await after(3); await tell(ma, 'Welcome to Long Acre, mercenary. It is not much. It is ours. Park on the porch — they will be along.');
      chatter(pip, 'Biscuit! Look UP! I have a LASER.');
      await after(8); let W = wave(1, 'north', 'FIRST WAVE'); say(xo, 'First wave on the north road. Contract troops: they will probe before they commit. Make the probe expensive.');
      await until(() => !alive(W)); setObj('w', 'First wave broken', 1); mend(); chatter(ma, 'Come in under the crane. My fitters will hammer you straight while there is a quiet minute.');
      await after(14); W = wave(1.1, 'west', 'SECOND WAVE'); W.push(...spawn({ drone: 3 }, S.north.x, S.north.z, 0, 40, 1).map(e => (e.alert = true, e))); say(xo, 'Second wave, west cut, with a drone flight coming round from the north to keep you looking the wrong way.');
      await until(() => !alive(W)); setObj('w', 'Second wave broken', 1); mend();
      /* the guns */
      const G = [0, 1, 2, 3].map(i => mkStruct('arty', ...stOff(S.bat, i * TAU / 4 + .5, 30), 1, { ry: stAng(S.bat, S.town), hpK: 1.4, name: 'SIEGE GUN · CASEMATED' })); for (const g of G) g.inv = true; spawn({ turret: 2 }, S.bat.x, S.bat.z, 44, 56);   /* under four metres of concrete: nothing a mech carries opens these. Something heavier will have to */
      await after(8); await tell(hale, 'Assessor Hale. I am calling from Kessel Ridge, where I have been posted as an observer, so that there is someone to blame. The guns are about to open. I filed an objection. It was noted, and then I believe it was eaten.');
      let shelling = true, sT = 1; stTick(dt => { if (ms.over || !shelling || !alive(G)) return false; if ((sT -= dt) > 0) return true; sT = rand(1.6, 2.8); const moving = M.up > .5, [x, z] = stOff(M.pos, rand(TAU), moving ? rand(50, 110) : rand(8, 70)); shell(x, z, 70, 16, 2.4); return true; });
      nav('b', S.bat, 'SIEGE BATTERY', '#ff5a3a'); look(G[0], 'SIEGE BATTERY · KESSEL RIDGE');
      await tell(xo, 'Battery on Kessel Ridge, seven hundred metres east. Four guns, casemated under four metres of concrete. Nothing you carry will open them. They are going to take that town apart, and the third wave is forming on the north road.');
      await after(9);
      await tell(ma, 'Seven hundred metres, you said. ...Pip. Ring the bell. Everybody off the washing lines and into the hull. Mercenary — you will want to stand back from us. Further than that.');
      msg('MARIGOLD — ALL HANDS BRACE', 4); sfx.play('alarm'); P.shake += .4; await M.stand(); P.shake += .9; sfx.play('boom', 1.2); msg('MARIGOLD STANDS', 5);
      await tell(pip, 'MA. MA. WE HAVE GOT LEGS.');
      await tell(ma, 'We have always had legs. Your great-grandmother parked her in a hurry. I am unparking her.');
      M.path = stRoad([S.town, S.bat]).slice(0, -1); M.wp = 0; M.speed = 10; M.turn = .45; M.halt = false; setObj('m', () => `Walk with Marigold to Kessel Ridge — ${Math.round(stDist(M.pos, S.bat) / 10) * 10} m`); setObj('g', () => `Siege guns — ${alive(G)} of 4 still firing`);
      await after(10); W = wave(1.2, 'north', 'THIRD WAVE', { focus: M }); say(xo, 'Third wave, and they have just watched a town stand up. I would call their advance tentative. Keep them off her legs.');
      /* Kessel Ridge: she puts her foot through it */
      await until(() => stDist(M.pos, S.bat) < 95 || !alive(G));
      for (const g of G) { if (g.dead) continue; M.path = [g.pos]; M.wp = 0; await until(() => g.dead || stDist(M.pos, g.pos) < 30); if (!g.dead) { const at = g.pos.clone(); at.y += 3; killEnt(g, 2); explode(FD.fx, at, 3.4); sfx.play('step', 2); P.shake += .7; puff(FD.fx, at, 20, 6, .5, .4, 3, 12); } }
      shelling = false; M.halt = true; setObj('g', 'Siege guns — stepped on', 1); unnav('b'); msg('MARIGOLD HAS PUT HER FOOT THROUGH THE BATTERY', 5); stShow(M.pos, 7, 70);
      leave(FD.ents.filter(e => e.team === 1 && e.kind !== 'struct' && e.kind !== 'turret'));
      await tell(xo, 'The battalion is withdrawing. Their contract has a clause for this. I believe it is called "not being paid enough".');
      fieldWho(hale, S.ridge); look(S.ridge, 'KESSEL RIDGE · WHAT IS LEFT OF IT');
      const r = await ask(hale, 'Assessor Hale. I am standing in what was a battery, holding what was a foreclosure order, underneath what I am told is a kitchen. I appear to be your prisoner. What happens now?', ['Go home, Hale.', 'Mayor — he is yours.', 'Vance-Okoro can have him back. For a price.'], 22, 0);
      stSet('hale', r + 1);
      if (r === 0) say(hale, 'Thank you. ...For the record — and I shall see that there is a record — I always thought it was rather a nice town.');
      else if (r === 1) { await tell(ma, 'Can you keep books, Mr Hale? Honestly?'); await tell(hale, 'It is the only way I know how to keep them.'); say(ma, 'Then you start on Monday. Pip, show Mr Hale where the kettle is.'); }
      else { stPay('Ransom: one assessor, lightly used', 60000); say(hale, 'Itemised at last. I suppose it was inevitable.'); }
      await after(2); win('Marigold stood up, walked to Kessel Ridge and stepped on the guns. Long Acre is hers.');
    },
    epi: (ok, f) => ok ? [
      [STC.ma, 'Long Acre has a town standing on it. Standing — I shall never get her to sit back down. If you are ever in a corner, mercenary, you call Marigold. She can come to you now.'],
      [STC.pip, "Biscuit! Ma says when I'm sixteen I can apply. To YOUR company. I've done the form already. It's in crayon but it's a real form."],
      f['mar.hale'] === 2 ? [STC.hale, 'Hale, Marigold municipal accounts. I am pleased to report a surplus for the first time in the town\'s history. The surplus is one mining laser. The Mayor would like you to have it.'] : f['mar.hale'] === 1 ? [CREW.intel, 'Hale resigned from Vance-Okoro this morning. The letter runs to nine pages and is, I am told, impeccably formatted.'] : [CREW.intel, 'Vance-Okoro paid for Hale without arguing the price. Then they demoted him. I do not think he minded.'],
    ] : [
      [STC.ma, 'She is hurt, and we are still on our claim, and they are still on their ridge. Nobody is finished. Mend your machine and come back to my porch.'],
      [STC.pip, "Biscuit, I didn't even get to shoot the big one."],
    ],
    prize(D, add, f) { stGift(D, 'gear.core', 1); stGift(D, 'arm.pls', 1); add('Long Acre first-ore dividend', 30000); repAdd('tyr', 8, 'stood with Marigold at Long Acre'); repAdd('vom', -6, 'Long Acre: a foreclosure that did not go through'); },
  }],
};

