/* ============ VOICES: EVERY LINE OF DIALOGUE IS SPOKEN ALOUD IN A MADE-UP LANGUAGE — NONSENSE WORDS WITH REAL INTONATION, THROUGH A THROAT THAT IS HALF PERSON, HALF MUTED TROMBONE ============ */
/* nothing is sampled. A small formant synthesiser renders each line as it is spoken: a buzzing source at the speaker's pitch, shaped by three moving resonances (the mouth), with hiss and breath for the consonants.
   A voice is a throat (pitch, size, buzz, breath, gravel), a way of talking (pace, melody, how crisply the mouth moves) and a private vocabulary built from its own handful of sounds — so a character always sounds like themselves,
   and people of one faction share a tongue. The words mean nothing; the punctuation of the real line decides how they are said: questions rise, orders fall, shouting is shouted, and a line cut off with a dash stops dead. */
const VOX_SR = 22050, VOX_HOP = 55;   /* control frames of 2.5 ms */
/* vowels: the first three resonances of an average adult mouth */
const VOX_V = { a: [730, 1090, 2440], A: [660, 1720, 2410], e: [530, 1840, 2480], E: [500, 1500, 2500], i: [270, 2290, 3010], I: [390, 1990, 2550], o: [500, 870, 2400], O: [570, 840, 2410], u: [300, 870, 2240], U: [440, 1020, 2240], y: [280, 1750, 2150], q: [400, 1450, 2300] };
/* consonants: each a short run of [ms, voicing, breath, hiss, hiss centre Hz, hiss width Hz, mouth shape (null = already forming the vowel that follows), nasal].
   j is the y of "yes", S sh, Z zh, c ch, J the j of "judge", R a rolled r, x the ch of "loch", ! a click, ' a catch in the throat */
const VOX_C = {
  w: [[60, .7, 0, 0, 0, 0, [300, 620, 2300]]], j: [[55, .7, 0, 0, 0, 0, [270, 2250, 3000]]], l: [[55, .6, 0, 0, 0, 0, [360, 1150, 2750]]], r: [[55, .65, 0, 0, 0, 0, [420, 1250, 1650]]],
  R: [[20, .12, 0, 0, 0, 0, [450, 1350, 2300]], [22, .8, 0, 0, 0, 0, [450, 1350, 2300]], [20, .12, 0, 0, 0, 0, [450, 1350, 2300]], [22, .8, 0, 0, 0, 0, [450, 1350, 2300]]],
  m: [[65, .5, 0, 0, 0, 0, [250, 1050, 2300], 1]], n: [[60, .5, 0, 0, 0, 0, [250, 1600, 2600], 1]],
  b: [[50, .12, 0, 0, 0, 0, [200, 800, 2200]], [8, .3, 0, .5, 900, 1200, null]], d: [[45, .12, 0, 0, 0, 0, [200, 1750, 2600]], [8, .3, 0, .6, 3800, 1800, null]], g: [[50, .12, 0, 0, 0, 0, [200, 2100, 2400]], [10, .3, 0, .6, 2200, 1200, null]],
  p: [[55, 0, 0, 0, 0, 0, [200, 800, 2200]], [8, 0, 0, .6, 900, 1200, null], [28, 0, .5, 0, 0, 0, null]], t: [[50, 0, 0, 0, 0, 0, [200, 1750, 2600]], [10, 0, 0, .8, 4200, 2000, null], [28, 0, .5, 0, 0, 0, null]],
  k: [[55, 0, 0, 0, 0, 0, [200, 2100, 2400]], [12, 0, 0, .8, 2300, 1200, null], [32, 0, .5, 0, 0, 0, null]],
  s: [[90, 0, 0, .5, 6200, 2600, null]], S: [[90, 0, 0, .55, 3000, 1400, null]], f: [[75, 0, 0, .22, 4500, 5000, null]], h: [[65, 0, .65, 0, 0, 0, null]], x: [[80, 0, .2, .45, 1700, 900, null]],
  z: [[70, .5, 0, .28, 6000, 2600, [260, 1700, 2600]]], Z: [[70, .5, 0, .32, 3000, 1400, [260, 1900, 2500]]], v: [[60, .55, 0, .1, 4500, 5000, [280, 1100, 2300]]],
  c: [[45, 0, 0, 0, 0, 0, [200, 1800, 2600]], [60, 0, 0, .5, 3200, 1500, null]], J: [[40, .12, 0, 0, 0, 0, [200, 1800, 2600]], [50, .4, 0, .35, 3000, 1400, null]],
  '!': [[25, 0, 0, 0, 0, 0, null], [6, 0, 0, 1, 3500, 3000, null], [20, 0, 0, 0, 0, 0, null]], "'": [[45, 0, 0, 0, 0, 0, null]],
};
/* six tongues: [onsets, vowels, codas] — a sound listed twice turns up twice as often, a dot is "none". Everyone who speaks for a faction draws their words from its tongue */
const VOX_LANG = [
  ['wwmmbnndl.j', 'aaoouE', '.....nm'],     /* 0 round and brassy */
  ['ttkkssSpr.', 'iieeaI', '....nsk'],      /* 1 clipped and bright */
  ['ggddbbrrx.', 'aaoOuU', '....rkx'],      /* 2 from the back of the throat */
  ['llmmnnvzj.', 'eeaaioq', '.....lns'],    /* 3 liquid */
  ['SSccttjh.s', 'iIeEay', '....Sn'],       /* 4 quick and hissing */
  ['RRddllmb.f', 'aaeiou', '.....nr'],      /* 5 rolled */
];
const VOX_FAC = { hel: 3, kar: 2, tyr: 0, ord: 5, vom: 1, maw: 4 };
const VOX_DEF = { f0: 140, tr: 1, rate: 5, range: 5, brass: .3, breath: .1, rough: .1, tilt: 2600, vib: 0, nas: 0, crisp: 1, stac: .2, lilt: 1, dip: .15, emoP: .14, emo: ['hm', 'ah', 'uh'] };
/* the named cast. f0 pitch · tr size of the throat (below 1 is a bigger body) · rate syllables a second · range how far the melody travels, in semitones · brass 0 a person … 1 a trombone with a plunger ·
   breath, rough (gravel) · tilt how bright the buzz is · vib vibrato · nas through the nose · crisp how fast the mouth moves · stac 0 legato … 1 clipped · lilt how much the tune wanders · dip how often a vowel slides into another · ph their own sounds */
const VOX_CAST = {
  xo: { f0: 186, tr: 1.07, rate: 5, range: 4.5, brass: .22, crisp: 1.25, stac: .5, tilt: 3200, lilt: .6, ph: ['ttkkddrvsn.', 'aaeeio', '.....nrs'], emo: ['hm', 'ah'], emoP: .08 },                        /* Cmdr. Ilsa Varga: clipped, even, used to being obeyed */
  intel: { f0: 236, tr: 1.16, rate: 6.4, range: 6, brass: .1, breath: .32, crisp: 1.35, stac: .15, tilt: 3000, ph: ['ssSSmmnktj.', 'iieeauy', '.....nS'], emo: ['hm', 'mhm', 'eh'], emoP: .2 },             /* Mira Sato: quick, quiet, half to herself */
  chief: { f0: 92, tr: .86, rate: 4, range: 5.5, brass: .72, rough: .32, crisp: .7, tilt: 2300, dip: .3, ph: ['bbddmmwwgl.', 'ooaauO', '.....mn'], emo: ['ha', 'grunt', 'oh'], emoP: .22 },                   /* "Dutch" Okonkwo: a low warm rumble, never in a hurry */
  rook: { f0: 212, tr: 1.12, rate: 6.1, range: 8.5, brass: .14, crisp: 1.3, tilt: 3600, lilt: 1.4, dip: .35, ph: ['rrkklljpc.', 'iiaaeE', '.....kn'], emo: ['ha', 'eh', 'ah'], emoP: .25 },                    /* Rook: young, bright, sure of herself */
  anvil: { f0: 76, tr: .82, rate: 3.5, range: 2.4, brass: .5, rough: .62, crisp: .75, stac: .55, tilt: 1900, lilt: .4, ph: ['ggddbbmnr.', 'oouuaU', '....mnk'], emo: ['grunt', 'hm'], emoP: .2 },              /* Anvil: very low, very slow, gravel */
  keep: { f0: 164, tr: 1, rate: 4.4, range: 6, brass: .42, breath: .24, rough: .26, crisp: .85, tilt: 2500, dip: .3, ph: ['mmnnllwwhd.', 'aaooeE', '.....nl'], emo: ['hm', 'mhm', 'ha', 'sigh'], emoP: .22 },  /* "Mother" Brandt: husky and unhurried */
  load: { f0: 118, tr: .92, rate: 4.8, range: 3.6, brass: .35, nas: .65, crisp: .95, stac: .35, tilt: 2700, lilt: .7, ph: ['bbggddnhr.', 'AAaaOE', '....nkr'], emo: ['grunt', 'uh', 'ha'], emoP: .18 },         /* Strand: blunt, through the nose */
  sig: { f0: 224, tr: 1.15, rate: 6.8, range: 5, brass: .08, crisp: 1.45, stac: .4, tilt: 3500, ph: ['ttddppkknl.s', 'iieeaI', '....ntk'], emo: ['eh', 'hm', 'ah'], emoP: .16 },                              /* Banerjee: light, exact, rapid */
  broker: { f0: 140, tr: .98, rate: 4.3, range: 5, brass: .3, crisp: .8, stac: 0, vib: .012, tilt: 2600, dip: .4, ph: ['llssmmvvzw.', 'oouueeaq', '.....ls'], emo: ['hm', 'ah'], emoP: .1 },                    /* Calloway: smooth as an invoice */
  drink: { f0: 150, tr: .95, rate: 4.7, range: 8.5, brass: .5, rough: .3, crisp: .9, tilt: 3000, lilt: 1.3, dip: .3, ph: ['bbgghhjjrw.', 'aaooqyu', '.....rn'], emo: ['ha', 'ah', 'oh'], emoP: .3 },           /* "Ballast": big, loud, enjoying herself */
  arm: { f0: 84, tr: .84, rate: 4.2, range: 3, brass: .4, rough: .7, crisp: .9, stac: .6, tilt: 2200, lilt: .5, ph: ['kkggbbttdm.', 'aaUUoe', '....kmn'], emo: ['grunt', 'ha'], emoP: .18 },                    /* "Vise": a bass with not much to say */
  cob: { f0: 170, tr: 1.03, rate: 4.2, range: 3.6, brass: .3, crisp: .9, stac: .12, vib: .008, tilt: 2700, lilt: .5, dip: .2, ph: ['vvllddnnrsm.', 'aaeeoi', '.....nrl'], emo: ['hm'], emoP: .06 },             /* Col. Ferreira, Cobalt Lance: grave, formal, every word placed */
  car: { f0: 150, tr: .97, rate: 5.3, range: 10.5, brass: .36, crisp: 1.1, vib: .03, tilt: 3300, lilt: 1.6, dip: .45, ph: ['RRllbbddttmfc.', 'aaiiooeu', '.....nrl'], emo: ['ha', 'ah', 'oh', 'ha'], emoP: .38 },   /* the Maestro, the Carnival: a tenor playing to the back row */
  ver: { f0: 156, tr: 1.02, rate: 5.9, range: 4.6, brass: .18, breath: .3, rough: .66, crisp: 1.2, stac: .25, tilt: 2900, lilt: .9, ph: ['ssSSkkttcczh.', 'IIeeaaE', '....Skn'], emo: ['tsk', 'ha', 'hm', 'eh'], emoP: .3 },   /* "Jackdaw" Halloran, Verdigris: a quick sly rasp, all sibilants */
  zz: { f0: 110, tr: .93, rate: 3.2, range: 2, brass: .6, breath: .4, rough: .4, crisp: .5, tilt: 1800, lilt: .3, ph: ['mmnnwwbl.', 'ooEEuU', '.....mn'], emo: ['sigh', 'hm', 'uh'], emoP: .5 },             /* somebody's rigger, asleep in the booth */
};
/* which seed is which of them (a character is its seed everywhere else in the game too) */
const VOX_WHO = { 11: 'xo', 23: 'intel', 37: 'chief', 51: 'rook', 67: 'anvil', 311: 'keep', 331: 'load', 347: 'sig', 359: 'broker', 373: 'drink', 389: 'arm', 409: 'zz', 7401: 'cob', 8587: 'car', 7866: 'ver' };
/* the story threads bring their own people, and each of them a voice */
Object.assign(VOX_CAST, {
  ma: { f0: 166, tr: 1.01, rate: 3.9, range: 5.5, brass: .42, breath: .2, rough: .5, crisp: .8, tilt: 2400, lilt: .9, dip: .3, ph: ['mmbbddwwgl.h', 'aaooEu', '.....mn'], emo: ['hm', 'ha', 'sigh', 'tsk'], emoP: .2 },          /* "Ma" Oyelaran: has been shouting over engines for fifty years */
  pip: { f0: 318, tr: 1.3, rate: 6.7, range: 10, brass: .06, crisp: 1.4, tilt: 3900, lilt: 1.7, dip: .3, ph: ['bbppttkkwjl.', 'iieeaay', '.....nk'], emo: ['ha', 'oh', 'eh', 'ah'], emoP: .38 },                                 /* Pip: eleven, and all of it at once */
  hale: { f0: 134, tr: .97, rate: 5.3, range: 2.4, brass: .2, nas: .68, crisp: 1.25, stac: .5, tilt: 2900, lilt: .35, ph: ['ttppkkssfn.', 'iieeIq', '....ntk'], emo: ['hm', 'eh'], emoP: .1 },                                          /* Assessor Hale: reads everything as if it were a form */
  und: { f0: 180, tr: 1.04, rate: 5.5, range: 9.5, brass: .3, breath: .26, vib: .022, crisp: 1.05, tilt: 3000, lilt: 1.5, dip: .45, ph: ['llssvvddRmc.', 'aaiiooeq', '.....nrl'], emo: ['ha', 'ah', 'sigh', 'oh'], emoP: .3 },       /* the Understudy: a leading voice that never got the lead */
  dex: { f0: 138, tr: .96, rate: 7, range: 8.5, brass: .46, crisp: 1.45, stac: .3, tilt: 3300, lilt: 1.4, ph: ['bbddggttkkRn.', 'aaeeiiO', '....nks'], emo: ['ha', 'oh', 'ah'], emoP: .3 },                                              /* Dex Halloway: calls a firefight like a horse race */
  lan: { f0: 121, tr: .9, rate: 3.3, range: 1.1, brass: .66, breath: .3, rough: .3, crisp: .55, stac: .7, tilt: 1900, lilt: .15, dip: .05, ph: ['nnmmlldk.', 'ooEEuq', '.....nm'], emo: ['hm'], emoP: .02 },                           /* LANTERN: a dead man's voice, played back by a machine that is running out of tape */
  abb: { f0: 97, tr: .88, rate: 3.5, range: 6, brass: .5, vib: .02, crisp: .7, stac: 0, tilt: 2200, lilt: .9, dip: .35, ph: ['RRddllmmvb.', 'aaoouu', '.....mnr'], emo: ['hm', 'oh'], emoP: .12 },                                      /* Brother-Mechanic Thorne: everything is half a chant */
  cas: { f0: 206, tr: 1.09, rate: 5, range: 3, brass: .12, breath: .1, crisp: 1.4, stac: .45, tilt: 3400, lilt: .4, ph: ['ssttkkllvz.', 'iieeay', '.....ns'], emo: ['hm'], emoP: .05 },                                                 /* Director Castellan, Helion: cold, exact, already bored */
  liz: { f0: 174, tr: 1.03, rate: 5.6, range: 7.5, brass: .36, rough: .56, crisp: 1.05, tilt: 2800, lilt: 1.25, dip: .3, ph: ['bbddggjjrl.h', 'aaAAoey', '.....nr'], emo: ['ha', 'ha', 'oh', 'eh'], emoP: .32 },                       /* "Tin Lizzie" Brandt: thirty years of racing and a laugh like a bad gearbox */
  bar: { f0: 103, tr: .9, rate: 4.1, range: 5, brass: .56, nas: .3, vib: .018, crisp: .85, stac: .1, tilt: 2300, lilt: .8, dip: .35, ph: ['vvbbddllmmf.', 'oouuaaq', '.....lmn'], emo: ['hm', 'ah', 'ha'], emoP: .14 },                /* Baron Drescher: champion, and would like you to know it */
  krait: { f0: 147, tr: .96, rate: 3.7, range: 6.5, brass: .45, breath: .18, rough: .2, vib: .014, crisp: .8, stac: 0, tilt: 2500, lilt: 1.1, dip: .4, ph: ['mmllnnvvSh.', 'aaooEEu', '.....mnl'], emo: ['hm', 'ah', 'sigh'], emoP: .1 },   /* "Mother" Krait: never raises her voice, never needs to */
  brick: { f0: 111, tr: .9, rate: 5, range: 7.5, brass: .6, rough: .36, crisp: .95, tilt: 2500, lilt: 1.3, dip: .3, ph: ['bbggddwwhm.', 'aaooAU', '.....mk'], emo: ['ha', 'oh', 'grunt', 'ha'], emoP: .3 },                             /* Sgt. "Brick" Adeyemi: big, loud, and delighted to be here */
  deacon: { f0: 127, tr: .95, rate: 4.4, range: 2.3, brass: .2, breath: .66, rough: .5, crisp: 1.1, stac: .3, tilt: 3000, lilt: .4, ph: ['ssSShhkkxt.', 'iiIIeE', '....Skx'], emo: ['hm', 'tsk'], emoP: .08 },                          /* the Deacon: says his prayers through his teeth */
});
Object.assign(VOX_CAST, {
  mav: { f0: 262, tr: 1.2, rate: 5.1, range: 11, brass: .1, vib: .03, crisp: 1.3, stac: .1, tilt: 3700, lilt: 1.9, dip: .4, ph: ['mmllnnwwdbp.', 'aaeeiioy', '.....nl'], emo: ['oh', 'ah', 'ha'], emoP: .3 },            /* MAVIS: an elocution mistress on a loop, delighted with everybody */
  snips: { f0: 143, tr: .97, rate: 5.9, range: 7, brass: .34, nas: .5, rough: .42, crisp: 1.15, stac: .3, tilt: 3000, lilt: 1.2, dip: .3, ph: ['ssSSkkttccnh.', 'iiIIeeay', '....Skn'], emo: ['ha', 'tsk', 'eh', 'ha'], emoP: .3 },   /* "Snips" Halvard: a market trader with a cutting torch */
});
Object.assign(VOX_WHO, { 9201: 'mav', 9203: 'snips', 9101: 'ma', 9103: 'pip', 9107: 'hale', 9121: 'und', 9123: 'dex', 9141: 'lan', 9143: 'abb', 9145: 'cas', 9161: 'liz', 9163: 'bar', 9181: 'krait', 9183: 'brick', 9185: 'deacon' });
/* everyone else is cut from one of eight cloths (four low, four high), then nudged so that no two are quite alike */
const VOX_KIND = [
  { f0: 104, tr: .9, rate: 4.6, range: 4, brass: .5, rough: .3, tilt: 2400 }, { f0: 122, tr: .95, rate: 5.2, range: 5, brass: .3, tilt: 2800 }, { f0: 142, tr: .99, rate: 5.6, range: 6.5, brass: .2, nas: .35, tilt: 3200 }, { f0: 96, tr: .87, rate: 4.1, range: 3, brass: .6, rough: .5, tilt: 2100 },
  { f0: 196, tr: 1.08, rate: 5.2, range: 5.5, brass: .3, breath: .2, tilt: 3000 }, { f0: 226, tr: 1.14, rate: 6.1, range: 7, brass: .15, tilt: 3600 }, { f0: 178, tr: 1.04, rate: 4.7, range: 4, brass: .4, rough: .3, breath: .25, tilt: 2600 }, { f0: 208, tr: 1.11, rate: 5.6, range: 5, brass: .2, nas: .4, tilt: 3400 },
];
const VOX_LOW = /^(Tobias|Bastien|Kofi|Soren|Dmitri|Hugo|Omar|Jonas|Ezra|Viktor|Idris|Teodor)$/, VOX_HIGH = /^(Ilsa|Mira|Juno|Anya|Yara|Lena|Nadia|Vera|Priya|Malia|Sabine|Greta|Amara)$/;
/* a vocabulary: twenty-two words of one to three syllables from the speaker's sounds. The first three are the ones they lean on */
function voxLex(ph, seed, dip) {
  const R = mulberry(seed * 7919 + 13), pk = s => s[(R() * s.length) | 0], dot = c => c === '.' ? '' : c, W = [];
  const syl = () => { const v = pk(ph[1]), s = { on: dot(pk(ph[0])), v, co: dot(pk(ph[2])) }; if (R() < dip) { const w = pk(ph[1]); if (w !== v) s.v2 = w; } return s; };
  for (let i = 0; i < 22; i++) { const r = R(), n = r < .42 ? 1 : r < .87 ? 2 : 3, w = []; for (let j = 0; j < n; j++) w.push(syl()); if (n === 1 && !w[0].on && !w[0].co) w[0].on = dot(pk(ph[0].replace(/\./g, '') || 'm')); W.push(w); }
  return W;
}
const VOX_Z = new Map();
function voxOf(ch) {
  const seed = (ch && ch.seed) | 0, fk = ch && ch.role && typeof FAC !== 'undefined' ? Object.keys(VOX_FAC).find(f => FAC[f] && ch.role.startsWith(FAC[f].short)) : null, key = seed + '|' + (fk || '');
  let z = VOX_Z.get(key); if (z) return z;
  const who = VOX_CAST[VOX_WHO[seed]], R = mulberry(seed * 71 + 29);
  if (who) z = { ...VOX_DEF, ...who, lex: voxLex(who.ph, seed * 31 + 7, who.dip ?? VOX_DEF.dip) };
  else {
    const f = ch && ch.first, low = f && VOX_LOW.test(f) ? true : f && VOX_HIGH.test(f) ? false : R() < .5, K = VOX_KIND[(low ? 0 : 4) + ((R() * 4) | 0)], j = (v, k) => v * (1 + (R() - .5) * k), li = fk ? VOX_FAC[fk] : (R() * VOX_LANG.length) | 0;
    z = { ...VOX_DEF, ...K, f0: j(K.f0, .2), tr: j(K.tr, .07), rate: j(K.rate, .2), range: j(K.range, .4), brass: clamp(j(K.brass, .5), 0, .8), tilt: j(K.tilt, .25), crisp: j(1, .4), stac: R() * .5, lilt: .6 + R() * .8, dip: .1 + R() * .25,
      emo: [['hm', 'ah', 'uh'], ['grunt', 'hm', 'ha'], ['eh', 'ah', 'mhm'], ['oh', 'tsk', 'hm']][(R() * 4) | 0], lex: voxLex(VOX_LANG[li], fk ? 900 + li : 950 + ((R() * 3) | 0) * 7 + li, .1 + R() * .25) };   /* one faction, one vocabulary; strangers share a few between them */
  }
  if (VOX_Z.size > 240) VOX_Z.clear(); VOX_Z.set(key, z); return z;
}
/* render one line. Returns the samples, a loudness envelope per control frame (it moves the speaker's mouth) and the length in seconds. o.fx: 'radio' — a cockpit set, 'holo' — a projection on the deck. o.seed fixes the take */
function voxRender(z, text, o = {}) {
  const R = mulberry((o.seed ?? Math.random() * 1e9) | 0), rr = (a, b) => a + R() * (b - a), HS = VOX_HOP / VOX_SR, K = HS * 1000, MAXF = Math.ceil(5.4 / HS), sr = VOX_SR;
  const T = {}; for (const k of ['f1', 'f2', 'f3', 'av', 'ah', 'af', 'ff', 'fb', 'ns', 'p']) T[k] = new Float32Array(MAXF);
  const sc = F => [F[0] * z.tr, F[1] * z.tr, F[2] * z.tr], cz = clamp(5 / z.rate, .72, 1.3); let n = 0, Fl = sc(VOX_V.E), pl = 0;
  /* hold a target for some milliseconds; the pitch travels from p0 to p1 (semitones about the speaker's own note) */
  const put = (ms, av, ah, af, ff, fb, F, ns, p0, p1) => { const m = Math.max(1, Math.round(ms / K)); for (let i = 0; i < m && n < MAXF; i++, n++) { T.f1[n] = F[0]; T.f2[n] = F[1]; T.f3[n] = F[2]; T.av[n] = av; T.ah[n] = ah; T.af[n] = af; T.ff[n] = ff || 3000; T.fb[n] = fb || 1500; T.ns[n] = ns || 0; T.p[n] = p0 + (p1 - p0) * (m > 1 ? i / (m - 1) : 0); } Fl = F; pl = p1; };
  const rest = ms => put(ms, 0, 0, 0, 0, 0, Fl, 0, pl, pl);
  const cons = (c, Fv, amp, p) => { for (const g of VOX_C[c] || []) put(g[0] * cz, g[1] * amp, g[2] * amp, g[3] * amp, g[4], g[5], g[6] ? sc(g[6]) : Fv, g[7], p, p); };
  const consMs = c => (VOX_C[c] || []).reduce((s, g) => s + g[0] * cz, 0);
  /* one syllable: onset, vowel (the tune moves through it; a brassy throat closes over the end like a plunger over a bell), coda */
  const syl = (s, ms, amp, p0, p1, gap) => {
    const Fv = sc(VOX_V[s.v]), F2 = s.v2 ? sc(VOX_V[s.v2]) : null, scoop = z.brass * 1.6, close = z.brass > .25 ? 28 + 50 * z.brass : 0, vd = Math.max(45, ms - consMs(s.on) - consMs(s.co) - close - gap);
    if (s.on) cons(s.on, Fv, amp, p0 - scoop);
    if (F2) { const pm = lerp(p0, p1, .45); put(vd * .45, amp, 0, 0, 0, 0, Fv, z.nas * .5, p0 - scoop, pm); put(vd * .55, amp, 0, 0, 0, 0, F2, z.nas * .5, pm, p1); } else put(vd, amp, 0, 0, 0, 0, Fv, z.nas * .5, p0 - scoop, p1);
    if (close) put(close, amp * .5, 0, 0, 0, 0, sc([330, 720, 2300]), z.nas * .5, p1, p1 - .6);
    if (s.co) cons(s.co, F2 || Fv, amp * .8, p1); if (gap) rest(gap);
  };
  /* the sounds people make that are not words */
  const Fm = sc([250, 1050, 2300]), Fa = sc(VOX_V.a), EMO = {
    hm: () => { put(170, .5, 0, 0, 0, 0, Fm, 1, 0, -2.5); put(190, .5, 0, 0, 0, 0, Fm, 1, -2.5, 1.5); },
    mhm: () => { put(120, .5, 0, 0, 0, 0, Fm, 1, -2, -2); put(45, 0, .25, 0, 0, 0, Fm, 0, -2, 3); put(190, .55, 0, 0, 0, 0, Fm, 1, 3, 2); },
    uh: () => put(230, .7, 0, 0, 0, 0, sc(VOX_V.E), 0, -1.5, -2.5),
    ah: () => { put(40, 0, .5, 0, 0, 0, Fa, 0, 4, 4); put(210, 1, 0, 0, 0, 0, Fa, 0, 4.5, -1.5); },
    oh: () => put(270, .9, 0, 0, 0, 0, sc(VOX_V.o), 0, 2.5, -3.5),
    eh: () => put(200, .85, 0, 0, 0, 0, sc(VOX_V.e), 0, -1, 5.5),
    ha: () => { const k = 3 + ((R() * 2) | 0); for (let i = 0; i < k; i++) { put(48, 0, .7, 0, 0, 0, Fa, 0, 5 - i * 1.6, 5 - i * 1.6); put(82, 1 - i * .15, 0, 0, 0, 0, Fa, 0, 5 - i * 1.6, 3.6 - i * 1.6); } },
    sigh: () => { put(260, 0, .8, 0, 0, 0, sc(VOX_V.E), 0, 1, -2); put(240, .35, .4, 0, 0, 0, sc(VOX_V.E), 0, 0, -5); },
    tsk: () => { for (let i = 0; i < 2; i++) { put(8, 0, 0, 1, 3600, 3000, Fl, 0, 0, 0); rest(110); } },
    grunt: () => put(140, 1, .2, 0, 0, 0, sc(VOX_V.U), 0, -3, -5),
    snore: () => { for (let k = 0; k < 2; k++) { for (let i = 0; i < 22; i++) put(38, .12, i % 2 ? .8 : .3, 0, 0, 0, sc([380, 950, 2200]), 1, -7, -7); rest(260); put(520, 0, .3, .12, 2600, 1800, sc(VOX_V.u), 0, -7, -7); rest(380); } },
  };
  const emote = k => { (EMO[k] || EMO.hm)(); rest(rr(90, 150)); };
  /* ---- read the real line for its shape: how many phrases, how long each is, and how each one ends ---- */
  const txt = String(text == null ? '' : text).trim(), C = [];
  txt.replace(/[^.!?,;:\n—…]+[.!?,;:\n—…]*/g, m => { const w = m.match(/[A-Za-z0-9¢']+/g) || []; if (w.length) C.push({ w: w.length, m: m.trim(), end: /\?\s*$/.test(m) ? 'Q' : /!\s*$/.test(m) ? 'X' : /(\.\.\.|…)\s*$/.test(m) ? 'T' : /—\s*$/.test(m) ? 'D' : /[,;:]\s*$/.test(m) ? 'C' : 'S', loud: w.filter(x => x.length > 2 && /[A-Z]/.test(x) && x === x.toUpperCase()).length * 2 >= w.length }); return m; });
  if (C.length && C[C.length - 1].end === 'D') C[C.length - 1].end = 'K';   /* a dash in the middle is a breath; a dash at the very end is somebody being cut off */
  const L = C.length > 3 ? [C[0], C[1], C[C.length - 1]] : C, lex = z.lex, word = first => (first && R() < .45) || R() < .14 ? lex[(R() * 3) | 0] : lex[3 + ((R() * (lex.length - 3)) | 0)];
  let budget = Math.max(2, Math.round(z.rate * 2.3));
  const phrase = (c, nw, first) => {
    const S = []; let prev = null; for (let i = 0; i < nw && (S.length < budget || !i); i++) { let w = word(first && !i); if (w === prev) w = word(false); prev = w; const st = w.length > 2 && R() < .3 ? 1 : 0; w.forEach((s, j) => S.push({ s, st: j === st, w0: j === 0 })); }
    budget -= S.length; const N = S.length, rg = z.range * (c.loud ? 1.25 : 1), up = (c.end === 'X' ? rg * .3 : 0) + (c.loud ? 2.5 : 0), slow = (c.end === 'T' ? 1.25 : 1) * (c.loud ? 1.12 : 1); let nuc = N - 1; while (nuc > 0 && !S[nuc].st) nuc--;
    S.forEach((y, i) => {
      const x = N > 1 ? i / (N - 1) : 1, fin = i === N - 1, amp = (y.st ? 1 : .74) * (c.loud ? 1.2 : 1) * (c.end === 'T' ? lerp(1, .6, x) : 1);
      let p = up + lerp(.3, -.3, x) * rg + (y.st ? rg * rr(.12, .3) : -rg * .06) + (i === nuc ? rg * .2 : 0) + (R() - .5) * rg * .4 * z.lilt, q = p + (R() - .5) * rg * .3 * z.lilt, ms = 1000 / z.rate * (y.st ? 1.14 : .86) * rr(.88, 1.12) * slow;
      if (fin) { ms *= c.end === 'K' ? .7 : 1.42; if (c.end === 'Q') { p = up + rg * .05; q = p + rg * .85; } else if (c.end === 'C' || c.end === 'D') q = p + rg * .28; else if (c.end === 'X') { p = up + rg * .45; q = up - rg * .55; } else if (c.end === 'T') p = q = up - rg * .35; else if (c.end === 'S') { p = Math.min(p, up - rg * .1); q = p - rg * .5; } }
      syl(y.s, ms, amp, p, q, fin ? 0 : z.stac * (S[i + 1].w0 ? 55 : 28));
    });
  };
  rest(20);
  if (/^\(/.test(txt)) emote(/snor/i.test(txt) ? 'snore' : 'hm');   /* a stage direction, not speech */
  else {
    if (/^(\.\.\.|…)/.test(txt)) emote(R() < .5 ? 'uh' : 'hm'); else if (/^(Ha|Heh)\b/.test(txt)) emote('ha'); else if (/^(Hm+|Huh|Well)\b/.test(txt)) emote('hm'); else if (/^(Oh|Ah)\b/.test(txt)) emote(/^Oh/.test(txt) ? 'oh' : 'ah'); else if (L.length && R() < z.emoP) emote(z.emo[(R() * z.emo.length) | 0]);
    const tw = L.reduce((s, c) => s + c.w, 0) || 1;
    L.forEach((c, i) => { if (budget <= 0 && i) return; phrase(c, clamp(Math.round(c.w * (tw > 14 ? .34 : .55) + rr(0, .8)), 1, 5), !i); if (i < L.length - 1) rest(c.end === 'C' || c.end === 'D' ? rr(80, 130) : c.end === 'T' ? rr(260, 340) : rr(170, 250)); });
    if (L.length && L[L.length - 1].end === 'Q' && tw < 4 && R() < .4) { rest(90); emote('eh'); }
    if (!L.length) emote(z.emo[0]);
  }
  if (!(L.length && L[L.length - 1].end === 'K')) rest(70); else rest(12);
  /* ---- the mouth cannot jump: every target is approached, quickly by a crisp speaker, lazily by a brassy one ---- */
  const sm = (a, tau) => { const k = 1 - Math.exp(-HS / tau); let y = a[0]; for (let i = 0; i < n; i++) { y += (a[i] - y) * k; a[i] = y; } };
  const tf = .02 / z.crisp + .016 * z.brass; sm(T.f1, tf); sm(T.f2, tf); sm(T.f3, tf * 1.1); sm(T.av, .007); sm(T.ah, .005); sm(T.af, .004); sm(T.ns, .01); sm(T.p, .022 + .03 * z.brass);
  /* ---- the throat: a band-limited buzz (with breath and gravel) through four resonators in a row; hiss takes its own road ---- */
  const N = n * VOX_HOP, pcm = new Float32Array(N), env = new Float32Array(n), TP = TAU / sr, kT = 1 - Math.exp(-TP * z.tilt), bwK = lerp(1.2, .72, z.brass), F4 = Math.min(4600, 3500 * z.tr);
  let sd = ((R() * 0x7fffffff) | 0) || 1; const rnd = () => { sd ^= sd << 13; sd ^= sd >>> 17; sd ^= sd << 5; return (sd >>> 0) / 4294967296; };
  let ph = R(), cyc = 0, jit = 1, shim = 1, lpS = 0, a1 = 0, a2 = 0, b1 = 0, b2 = 0, c1 = 0, c2 = 0, d1 = 0, d2 = 0, g1 = 0, g2 = 0, k = 0, hx = 0, hy = 0;
  const r4 = Math.exp(-PI * 300 / sr), D4c = -r4 * r4, D4b = 2 * r4 * Math.cos(TP * F4), D4a = 1 - D4b - D4c;
  for (let f = 0; f < n; f++) {
    const ns = T.ns[f], av = T.av[f], ah = T.ah[f], af = T.af[f], F1 = clamp(T.f1[f], 160, 1300), F2 = clamp(T.f2[f], 480, 3500), F3 = clamp(T.f3[f], 1300, 4400), th = TP * clamp(T.ff[f], 500, 9000);
    const dp = clamp(z.f0 * Math.pow(2, T.p[f] / 12) * (1 + z.vib * Math.sin(TAU * 5.6 * f * HS)), 45, 520) / sr;
    const r1 = Math.exp(-PI * bwK * (70 + 110 * ns) / sr), A1c = -r1 * r1, A1b = 2 * r1 * Math.cos(TP * F1), A1a = 1 - A1b - A1c, r2 = Math.exp(-PI * bwK * (100 + 260 * ns) / sr), B2c = -r2 * r2, B2b = 2 * r2 * Math.cos(TP * F2), B2a = 1 - B2b - B2c;
    const r3 = Math.exp(-PI * bwK * (160 + 300 * ns) / sr), C3c = -r3 * r3, C3b = 2 * r3 * Math.cos(TP * F3), C3a = 1 - C3b - C3c, rf = Math.exp(-PI * T.fb[f] / sr), Gc = -rf * rf, Gb = 2 * rf * Math.cos(th), Ga = (1 - rf) * Math.sqrt(1 - 2 * rf * Math.cos(2 * th) + rf * rf);
    let e = 0;
    for (let i = 0; i < VOX_HOP; i++) {
      const dd = dp * jit; ph += dd; if (ph >= 1) { ph -= 1; cyc++; jit = 1 + (rnd() - .5) * z.rough * .09; shim = 1 - z.rough * (.3 * (cyc & 1) + .2 * rnd()); }
      let s = 2 * ph - 1; if (ph < dd) { const q = ph / dd; s -= q + q - q * q - 1; } else if (ph > 1 - dd) { const q = (ph - 1) / dd; s -= q * q + q + q + 1; }
      lpS += (s - lpS) * kT; const x = lpS * av * shim + (rnd() * 2 - 1) * ah * .1;
      const y1 = A1a * x + A1b * a1 + A1c * a2; a2 = a1; a1 = y1; const y2 = B2a * y1 + B2b * b1 + B2c * b2; b2 = b1; b1 = y2; const y3 = C3a * y2 + C3b * c1 + C3c * c2; c2 = c1; c1 = y3; const y4 = D4a * y3 + D4b * d1 + D4c * d2; d2 = d1; d1 = y4;
      const fr = Ga * (rnd() * 2 - 1) * af + Gb * g1 + Gc * g2; g2 = g1; g1 = fr;
      const v = y4 + fr * .5; hy = v - hx + .985 * hy; hx = v; pcm[k++] = hy; e += hy * hy;
    }
    env[f] = Math.sqrt(e / VOX_HOP);
  }
  /* ---- level it: every line leaves at the same loudness whoever speaks it, then whatever it is heard through ---- */
  let sq = 0, m = 0, pk = 0; for (let f = 0; f < n; f++) { if (env[f] > pk) pk = env[f]; } for (let f = 0; f < n; f++) if (env[f] > pk * .12) { sq += env[f] * env[f]; m++; }
  const g = m && sq > 0 ? .17 / Math.sqrt(sq / m) : 0;
  if (o.fx) {
    /* a small speaker: no bottom, no top, a stage that rounds the loud parts off. Nothing is added: no hiss, no click, no static */
    const radio = o.fx === 'radio', bq = (type, fc, q) => { const w = TP * fc, cs = Math.cos(w), al = Math.sin(w) / (2 * q), a0 = 1 + al, hpf = type === 'hp'; return [(hpf ? (1 + cs) / 2 : (1 - cs) / 2) / a0, (hpf ? -(1 + cs) : 1 - cs) / a0, (hpf ? (1 + cs) / 2 : (1 - cs) / 2) / a0, -2 * cs / a0, (1 - al) / a0]; };
    const run = c => { let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < N; i++) { const x = pcm[i], y = c[0] * x + c[1] * x1 + c[2] * x2 - c[3] * y1 - c[4] * y2; x2 = x1; x1 = x; y2 = y1; y1 = y; pcm[i] = y; } };
    run(bq('hp', radio ? 420 : 230, .8)); run(bq('lp', radio ? 2800 : 4300, .9)); if (radio) run(bq('hp', 420, .7));
    const drive = radio ? 1.5 : 1.2; let mk = 1; if (radio) { let q = 0, c = 0; for (let i = 0; i < N; i++) { const v = pcm[i] * g; if (v > .03 || v < -.03) { q += v * v; c++; } } if (c) mk = clamp(.15 / Math.sqrt(q / c), 1, 3.5); }   /* the small speaker throws most of a low voice away: bring what is left back up to the level of everybody else */
    for (let i = 0; i < N; i++) { let v = Math.tanh(pcm[i] * g * mk * drive) / Math.tanh(drive * .5) * .5; if (!radio) v *= 1 + .05 * Math.sin(TAU * 31 * i / sr); pcm[i] = v; }
  } else for (let i = 0; i < N; i++) pcm[i] = Math.tanh(pcm[i] * g * 1.6) / 1.6;
  const fade = Math.min(N, 80); for (let i = 0; i < fade; i++) { pcm[i] *= i / fade; pcm[N - 1 - i] *= i / fade; }
  if (pk > 0) for (let f = 0; f < n; f++) env[f] = Math.min(1, env[f] / pk * 1.15);
  return { pcm, env, dur: N / sr };
}
/* the engine: one voice at a time. say() renders the line and plays it; whoever speaks next cuts the last speaker off */
const vox = (() => {
  let ac = null, out = null, cur = null; const lvl = () => .9 * CFG.vol * CFG.voice;
  return {
    boot(ctx) { if (out) return; ac = ctx; out = ac.createGain(); out.gain.value = lvl(); out.connect(ac.destination); },
    vol() { if (out) out.gain.setTargetAtTime(lvl(), ac.currentTime, .05); },
    say(ch, text, fx) {
      this.stop(); if (!out || !ch || lvl() <= 0) return 0; if (ac.state === 'suspended') ac.resume();
      let r; try { r = voxRender(voxOf(ch), text, { fx }); } catch (e) { console.error('voice', e); return 0; }
      for (let i = 0; i < r.pcm.length; i++) if (!isFinite(r.pcm[i])) return 0;   /* never hand the mixer a bad sample */
      const b = ac.createBuffer(1, r.pcm.length, VOX_SR), s = ac.createBufferSource(), g = ac.createGain(), t0 = ac.currentTime + .13; b.copyToChannel(r.pcm, 0); s.buffer = b; s.connect(g).connect(out); s.start(t0);
      const me = cur = { s, g, t0, env: r.env, dur: r.dur }; s.onended = () => { if (cur === me) cur = null; }; return r.dur;
    },
    stop() { const c = cur; if (!c) return; cur = null; try { c.g.gain.setTargetAtTime(0, ac.currentTime, .012); c.s.stop(ac.currentTime + .07); } catch (e) { } },
    busy() { return !!cur && ac.currentTime < cur.t0 + cur.dur; },
    /* how wide the speaker's mouth is right now, 0..1 */
    level() { if (!cur) return 0; const i = Math.floor((ac.currentTime - cur.t0) * VOX_SR / VOX_HOP); return i >= 0 && i < cur.env.length ? cur.env[i] : 0; },
  };
})();

