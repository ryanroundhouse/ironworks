/* ============ CATALOG / PRESETS / STATS ============ */
const SLOTS = ['legs', 'torso', 'head', 'armL', 'armR', 'back'];
const CAT = { legs: 'legs', torso: 'torso', head: 'head', armL: 'arm', armR: 'arm', back: 'back' };
const SLOT_LABEL = { legs: 'LEGS / DRIVE', torso: 'TORSO / CORE', head: 'COCKPIT', armL: 'LEFT ARM', armR: 'RIGHT ARM', back: 'BACK UNIT' };
const PRESETS = [
  { name: 'KESTREL', role: 'RECON', legs: 'rap', torso: 'pod', head: 'can', armL: 'las', armR: 'las', back: 'jet', paint: 2 },
  { name: 'WARDEN', role: 'BRAWLER', legs: 'bip', torso: 'bas', head: 'vis', armL: 'claw', armR: 'acn', back: 'jet', paint: 0 },
  { name: 'COLOSSUS', role: 'ASSAULT', legs: 'hvy', torso: 'jug', head: 'skl', armL: 'pls', armR: 'gau', back: 'snk', paint: 3 },
  { name: 'TARANTULA', role: 'FIRE SUPPORT', legs: 'quad', torso: 'brd', head: 'dom', armL: 'mis', armR: 'mis', back: 'rak', paint: 5 },
  { name: 'BULWARK', role: 'SIEGE CRAWLER', legs: 'trk', torso: 'jug', head: 'vis', armL: 'acn', armR: 'mis', back: 'plt', paint: 4 },
  { name: 'SPECTER', role: 'SNIPER', legs: 'bip', torso: 'sti', head: 'arr', armL: 'gau', armR: 'las', back: 'rad', paint: 1 },
];
/* twelve more machines, light to assault. The order is fixed: pilots, wingmen and the story name the first six by number */
PRESETS.push(
  { name: 'GNAT', role: 'SCOUT', legs: 'lgt', torso: 'wsp', head: 'fly', armL: 'mg1', armR: 'lp1', back: 'ecm', paint: 2 },
  { name: 'FERRET', role: 'SKIRMISHER', legs: 'hov', torso: 'pod', head: 'mon', armL: 'sr1', armR: 'lp2', back: 'bst', paint: 1 },
  { name: 'JACKAL', role: 'PUNCHER', legs: 'rap', torso: 'wsp', head: 'kab', armL: 'fs1', armR: 'sg1', back: 'jet', paint: 4 },
  { name: 'LEGIONARY', role: 'TROOPER', legs: 'bip', torso: 'cen', head: 'vis', armL: 'ac2', armR: 'lp2', back: 'snk', paint: 0 },
  { name: 'HOPLITE', role: 'DUELIST', legs: 'bip', torso: 'cen', head: 'kab', armL: 'tb1', armR: 'pr2', back: 'jet', paint: 3 },
  { name: 'FIREDRAKE', role: 'INCINERATOR', legs: 'bip', torso: 'orb', head: 'mon', armL: 'fl2', armR: 'fl2', back: 'snk', paint: 4 },
  { name: 'STORMCROW', role: 'DISRUPTOR', legs: 'bip', torso: 'orb', head: 'arr', armL: 'ar1', armR: 'io1', back: 'rad', paint: 5 },
  { name: 'ARBITER', role: 'MISSILE BOAT', legs: 'quad', torso: 'bas', head: 'dom', armL: 'lr2', armR: 'lr2', back: 'lrk', paint: 2 },
  { name: 'AUROCHS', role: 'CHARGER', legs: 'hvy', torso: 'rhn', head: 'kab', armL: 'fs2', armR: 'sg3', back: 'plt', paint: 1 },
  { name: 'CATAPHRACT', role: 'WALKING BATTERY', legs: 'hex', torso: 'brd', head: 'dom', armL: 'ac2', armR: 'ac2', back: 'art', paint: 0 },
  { name: 'OGRE', role: 'BREACHER', legs: 'hvy', torso: 'rhn', head: 'bnk', armL: 'sw2', armR: 'sg3', back: 'shd', paint: 3 },
  { name: 'GOLIATH', role: 'DREADNOUGHT', legs: 'sup', torso: 'ctd', head: 'skl', armL: 'gs3', armR: 'pr3', back: 'snk', paint: 5 },
);
/* the catalogue by weight class, for whoever has to pick a machine to match a contract */
const PRESET_CLS = { LIGHT: [], MEDIUM: [], HEAVY: [], ASSAULT: [] };
