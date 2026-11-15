/* ============ ICONOGRAPHY: ONE GLYPH PER COMPONENT, COLOURED BY CATEGORY; THE COMPANY EMBLEM ============ */
/* 48-unit line art. class f = solid, h = tinted fill, d = dimmed, t = thin */
const GLYPH = {
  'legs.bip': '<path class="f" d="M12 6h24v5H12z"/><path d="M17 11l-3 12 3 13M31 11l3 12-3 13"/><circle class="f" cx="14" cy="23" r="2.6"/><circle class="f" cx="34" cy="23" r="2.6"/><path class="f" d="M9 37h13v5H9zM26 37h13v5H26z"/>',
  'legs.rap': '<path class="f" d="M17 5h16v6H17z"/><path class="d" d="M30 11L20 22l12 11 9 7"/><path d="M22 11L11 22l13 11 10 7M24 33l-8 7"/><circle class="f" cx="11" cy="22" r="2.6"/><circle class="f" cx="24" cy="33" r="2.2"/>',
  'legs.hvy': '<path class="f" d="M7 5h34v6H7z"/><path class="h" d="M9 12h12v22H9zM27 12h12v22H27z"/><path d="M9 12h12v22H9zM27 12h12v22H27zM9 23h12M27 23h12"/><path class="f" d="M5 35h18v8H5zM25 35h18v8H25z"/>',
  'legs.quad': '<circle class="h" cx="24" cy="17" r="7"/><circle cx="24" cy="17" r="7"/><circle class="f" cx="24" cy="17" r="2.4"/><path d="M18 19L8 13 4 40M30 19l10-6 4 27M20 23l-5 4-1 15M28 23l5 4 1 15"/><circle class="f" cx="8" cy="13" r="2"/><circle class="f" cx="40" cy="13" r="2"/>',
  'legs.trk': '<path class="h" d="M13 21l4-10h14l4 10z"/><path d="M13 21l4-10h14l4 10"/><rect x="4" y="21" width="40" height="20" rx="10"/><circle class="f" cx="13" cy="31" r="3.2"/><circle class="f" cx="20.5" cy="31" r="3.2"/><circle class="f" cx="27.5" cy="31" r="3.2"/><circle class="f" cx="35" cy="31" r="3.2"/>',
  'torso.pod': '<path class="h" d="M5 27l9-10h16l13 8-13 8H12z"/><path d="M5 27l9-10h16l13 8-13 8H12z"/><path class="f" d="M27 20l9 5-9 3z"/><path d="M12 25h10"/><path class="f" d="M18 34h8v6h-8z"/>',
  'torso.bas': '<path class="h" d="M15 9h18l6 9v14l-6 7H15l-6-7V18z"/><path d="M15 9h18l6 9v14l-6 7H15l-6-7V18z"/><path d="M18 19h12M18 24h12M18 29h12"/><path class="f" d="M3 16h5v10H3zM40 16h5v10h-5z"/>',
  'torso.jug': '<path class="h" d="M10 5h28l5 6v26l-5 6H10l-5-6V11z"/><path d="M10 5h28l5 6v26l-5 6H10l-5-6V11z"/><circle cx="24" cy="25" r="9"/><circle class="f" cx="24" cy="25" r="3.6"/><path d="M14 11h20"/>',
  'torso.sti': '<path class="h" d="M4 31L41 12l3 7-13 16H9z"/><path d="M4 31L41 12l3 7-13 16H9z"/><path d="M13 30l22-11"/><path class="f" d="M17 35h8v6h-8z"/>',
  'torso.brd': '<path class="h" d="M17 9h14v30H17z"/><path d="M17 9h14v30H17zM3 13h12v18H3zM33 13h12v18H33z"/><path d="M6 19h6M6 25h6M36 19h6M36 25h6M21 16h6M21 22h6"/>',
  'head.can': '<path class="h" d="M9 33a15 18 0 0130 0z"/><path d="M9 33a15 18 0 0130 0zM24 15v18M16 19q3 7 3 14M32 19q-3 7-3 14"/><path class="f" d="M6 34h36v5H6z"/>',
  'head.vis': '<path class="h" d="M9 37V20l7-10h16l7 10v17z"/><path d="M9 37V20l7-10h16l7 10v17z"/><path class="f" d="M13 21h22v5H13z"/><path d="M19 32h10"/>',
  'head.dom': '<path class="h" d="M9 37a15 15 0 0130 0z"/><path d="M9 37a15 15 0 0130 0zM11 29h26M24 22V8"/><circle class="f" cx="24" cy="7" r="2.6"/><circle class="f" cx="24" cy="29" r="3"/>',
  'head.skl': '<path class="h" d="M12 9h24l5 15-9 17H16L7 24z"/><path d="M12 9h24l5 15-9 17H16L7 24z"/><path class="f" d="M13 21l9 3-1 5-7-3zM35 21l-9 3 1 5 7-3z"/><path d="M21 35h6"/>',
  'head.arr': '<circle class="h" cx="18" cy="25" r="10"/><circle cx="18" cy="25" r="10"/><circle class="f" cx="18" cy="25" r="4"/><circle cx="35" cy="15" r="6"/><circle class="f" cx="35" cy="15" r="2.2"/><circle cx="36" cy="33" r="4.6"/><circle class="f" cx="36" cy="33" r="1.6"/>',
  'arm.las': '<path class="h" d="M4 17h16v14H4z"/><path d="M4 17h16v14H4zM20 21h9v6h-9zM23 19v10M26 19v10"/><path class="f" d="M30 22.6h14v2.8H30z"/><path class="t" d="M34 17l4 3M34 31l4-3M42 15l-2 4M42 33l-2-4"/>',
  'arm.acn': '<path class="h" d="M4 15h14v18H4z"/><path d="M4 15h14v18H4zM18 19h24M18 24h24M18 29h24M37 16v16M42 16v16"/><circle class="f" cx="11" cy="24" r="3.6"/>',
  'arm.mis': '<path class="h" d="M6 8h26v32H6z"/><path d="M6 8h26v32H6z"/><circle class="f" cx="13.5" cy="17" r="4"/><circle class="f" cx="24.5" cy="17" r="4"/><circle class="f" cx="13.5" cy="31" r="4"/><circle class="f" cx="24.5" cy="31" r="4"/><path d="M35 24h9M40 20l4 4-4 4"/>',
  'arm.pls': '<path class="h" d="M4 19h12l10-7v24l-10-7H4z"/><path d="M4 19h12l10-7v24l-10-7H4z"/><circle class="h" cx="37" cy="24" r="7"/><circle cx="37" cy="24" r="7"/><circle class="f" cx="37" cy="24" r="3"/>',
  'arm.gau': '<path class="f" d="M3 16h8v16H3z"/><path d="M11 21h34M11 27h34"/><path class="h" d="M15 17h4v14h-4zM23 17h4v14h-4zM31 17h4v14h-4zM39 17h4v14h-4z"/><path d="M15 17h4v14h-4zM23 17h4v14h-4zM31 17h4v14h-4zM39 17h4v14h-4z"/>',
  'arm.claw': '<path class="h" d="M4 18h12v12H4z"/><path d="M4 18h12v12H4zM16 20q12-14 26-5l-7 3M16 28q12 14 26 5l-7-3M16 24h11"/><circle class="f" cx="31" cy="24" r="1.7"/><circle class="f" cx="36" cy="22" r="1.5"/><circle class="f" cx="36" cy="26.5" r="1.5"/>',
  'back.jet': '<path class="h" d="M9 6h11l2 16H7zM28 6h11l2 16H26z"/><path d="M9 6h11l2 16H7zM28 6h11l2 16H26z"/><path class="f" d="M9 25h11l-5.500 18zM28 25h11l-5.500 18z"/>',
  'back.rak': '<path class="h" d="M6 7h36v27H6z"/><path d="M6 7h36v27H6zM15 34v8M33 34v8"/><circle class="f" cx="13" cy="15" r="2.8"/><circle class="f" cx="20.5" cy="15" r="2.8"/><circle class="f" cx="27.5" cy="15" r="2.8"/><circle class="f" cx="35" cy="15" r="2.8"/><circle class="f" cx="13" cy="26" r="2.8"/><circle class="f" cx="20.5" cy="26" r="2.8"/><circle class="f" cx="27.5" cy="26" r="2.8"/><circle class="f" cx="35" cy="26" r="2.8"/>',
  'back.rad': '<path class="h" d="M7 20q17 20 34 0z"/><path d="M7 20q17 20 34 0zM24 30v-9M18 43l6-13 6 13z"/><circle class="f" cx="24" cy="19" r="2.6"/><path class="t" d="M17 12q7-6 14 0M13 7q11-8 22 0"/>',
  'back.snk': '<path d="M9 6v21M15 6v21M21 6v21M27 6v21M33 6v21M39 6v21"/><path class="f" d="M5 27h38v5H5z"/><path class="t" d="M24 34v10M19.700 36.500l8.600 5M28.300 36.500l-8.600 5"/>',
  'back.plt': '<path class="h" d="M24 5l16 6v15q0 11-16 17Q8 37 8 26V11z"/><path d="M24 5l16 6v15q0 11-16 17Q8 37 8 26V11z"/><path d="M24 13l9 3.500v9.500q0 6-9 10-9-4-9-10v-9.500z"/>',
  'gear.sink': '<path d="M11 9v20M15.500 9v20M20 9v20M24.500 9v20M29 9v20M33.500 9v20M38 9v20"/><path class="f" d="M7 29h34v9H7z"/><path class="t" d="M11 42h26"/>',
  'gear.kit': '<rect class="h" x="6" y="16" width="36" height="24" rx="3"/><rect x="6" y="16" width="36" height="24" rx="3"/><path d="M18 16v-6h12v6"/><path class="f" d="M21.500 20h5v6h6v5h-6v6h-5v-6h-6v-5h6z"/>',
  'gear.cool': '<rect class="h" x="14" y="11" width="20" height="31" rx="4"/><rect x="14" y="11" width="20" height="31" rx="4"/><path class="f" d="M19 5h10v6H19z"/><path class="f" d="M24 17q7 10 0 16-7-6 0-16z"/>',
  'gear.scrap': '<path class="h" d="M7 31l6-19 13-5 4 9 11-2-3 19-10 8-17-3z"/><path d="M7 31l6-19 13-5 4 9 11-2-3 19-10 8-17-3z"/><path class="t" d="M19 13l5 10-6 7M30 16l-3 8"/><circle class="f" cx="31" cy="30" r="2.4"/><circle class="f" cx="16" cy="33" r="1.6"/>',
  'gear.core': '<path class="h" d="M24 5l16 9.500v19L24 43 8 33.500v-19z"/><path d="M24 5l16 9.500v19L24 43 8 33.500v-19z"/><circle cx="24" cy="24" r="8.500"/><circle class="f" cx="24" cy="24" r="3.400"/><path class="t" d="M24 10v5M24 33v5M12 17l4.300 2.500M31.700 28.500L36 31M36 17l-4.300 2.500M16.300 28.500L12 31"/>',
  all: '<path class="f" d="M7 7h14v14H7zM27 7h14v14H27zM7 27h14v14H7zM27 27h14v14H27z"/>',
  none: '<circle class="t" cx="24" cy="24" r="16" stroke-dasharray="4 5"/><path d="M24 16v16M16 24h16"/>',
  warn: '<path class="h" d="M24 5l20 36H4z"/><path d="M24 5l20 36H4z"/><path class="f" d="M22 18h4v12h-4zM22 33h4v4h-4z"/>',
};
Object.assign(GLYPH, {
  'legs.lgt': '<path class="f" d="M17 6h14v4H17z"/><path d="M20 10l-4 12 4 14M28 10l4 12-4 14"/><circle class="f" cx="16" cy="22" r="2"/><circle class="f" cx="32" cy="22" r="2"/><path class="f" d="M13 37h10v4H13zM25 37h10v4H25z"/><path class="t" d="M5 13h6M3 20h6M5 27h5"/>',
  'legs.sup': '<path class="f" d="M4 4h40v7H4z"/><path class="h" d="M6 12h14v20H6zM28 12h14v20H28z"/><path d="M6 12h14v20H6zM28 12h14v20H28zM6 20h14M28 20h14M6 26h14M28 26h14"/><path class="f" d="M2 33h20v10H2zM26 33h20v10H26z"/>',
  'legs.hex': '<ellipse class="h" cx="24" cy="18" rx="10" ry="6"/><ellipse cx="24" cy="18" rx="10" ry="6"/><circle class="f" cx="24" cy="18" r="2.4"/><path d="M15 16L6 10 3 38M33 16l9-6 3 28M14 20l-6 4-2 18M34 20l6 4 2 18M19 23l-3 5v14M29 23l3 5v14"/>',
  'legs.hov': '<path class="h" d="M8 22l5-10h22l5 10z"/><path d="M8 22l5-10h22l5 10z"/><path class="f" d="M4 22h40l-4 8H8z"/><path class="t" d="M12 35v6M20 35v8M28 35v8M36 35v6"/><circle class="f" cx="24" cy="17" r="2.4"/>',
  'torso.wsp': '<path class="h" d="M10 28l7-9h12l9 6-9 7H15z"/><path d="M10 28l7-9h12l9 6-9 7H15z"/><path class="f" d="M29 22l6 3-6 3z"/><path class="t" d="M17 19L8 8M19 32L9 41"/>',
  'torso.cen': '<path class="h" d="M14 12h20l6 8v12l-6 8H14l-6-8V20z"/><path d="M14 12h20l6 8v12l-6 8H14l-6-8V20z"/><path class="f" d="M3 9h13v6H3zM32 9h13v6H32z"/><circle cx="24" cy="27" r="5"/><circle class="f" cx="24" cy="27" r="1.8"/>',
  'torso.rhn': '<path class="h" d="M4 34l8-20h20l10 12-6 12H10z"/><path d="M4 34l8-20h20l10 12-6 12H10z"/><path class="f" d="M32 14l14 12-10 2z"/><path d="M12 30h16M14 24h12"/>',
  'torso.orb': '<circle class="h" cx="24" cy="24" r="16"/><circle cx="24" cy="24" r="16"/><path d="M8 24h10M30 24h10"/><circle cx="24" cy="24" r="6"/><circle class="f" cx="24" cy="24" r="2.6"/>',
  'torso.ctd': '<path class="h" d="M9 8h30v34H9z"/><path d="M9 8h30v34H9zM9 16h30M9 34h30M16 21h16M16 25h16M16 29h16"/><path class="f" d="M2 5h11v8H2zM35 5h11v8H35z"/>',
  'head.mon': '<path class="h" d="M12 38V16l6-6h12l6 6v22z"/><path d="M12 38V16l6-6h12l6 6v22z"/><circle cx="24" cy="23" r="7"/><circle class="f" cx="24" cy="23" r="3"/>',
  'head.kab': '<path class="h" d="M12 40V24l6-8h12l6 8v16z"/><path d="M12 40V24l6-8h12l6 8v16z"/><path class="f" d="M14 27h20v4H14z"/><path d="M17 16L9 5M31 16l8-11"/><path class="f" d="M22 16l2-8 2 8z"/>',
  'head.bnk': '<path class="h" d="M6 38V20l6-8h24l6 8v18z"/><path d="M6 38V20l6-8h24l6 8v18z"/><path class="f" d="M12 21h24v3.500H12z"/><path d="M6 30h36"/><circle class="f" cx="14" cy="34" r="1.4"/><circle class="f" cx="34" cy="34" r="1.4"/>',
  'head.fly': '<circle class="h" cx="16" cy="24" r="9"/><circle cx="16" cy="24" r="9"/><circle class="h" cx="32" cy="24" r="9"/><circle cx="32" cy="24" r="9"/><path class="t" d="M14 15L8 5M34 15l6-10"/><path class="f" d="M19 36h10v5H19z"/>',
  'back.lrk': '<path class="h" d="M5 8h38v24H5z"/><path d="M5 8h38v24H5zM14 32v10M34 32v10"/><circle class="f" cx="11" cy="15" r="2"/><circle class="f" cx="17.500" cy="15" r="2"/><circle class="f" cx="24" cy="15" r="2"/><circle class="f" cx="30.500" cy="15" r="2"/><circle class="f" cx="37" cy="15" r="2"/><circle class="f" cx="11" cy="25" r="2"/><circle class="f" cx="17.500" cy="25" r="2"/><circle class="f" cx="24" cy="25" r="2"/><circle class="f" cx="30.500" cy="25" r="2"/><circle class="f" cx="37" cy="25" r="2"/>',
  'back.art': '<path class="f" d="M5 30h17v11H5z"/><path class="h" d="M11 27l5-8 8 5-5 8z"/><path d="M11 27l5-8 8 5-5 8zM20 21L40 8"/><circle class="f" cx="41" cy="7" r="3.200"/>',
  'back.shd': '<path d="M7 30a17 17 0 0134 0"/><path class="t" d="M13 30a11 11 0 0122 0"/><path class="f" d="M20 30h8v11h-8z"/><path class="t" d="M3 20l4 3M45 20l-4 3M24 5v5"/>',
  'back.ecm': '<path class="f" d="M19 31h10v11H19z"/><path d="M24 31V11M15 31L9 14M33 31l6-17"/><circle class="f" cx="24" cy="9" r="2.4"/><path class="t" d="M16 9q8-8 16 0"/><path class="t" d="M5 42L43 6"/>',
  'back.bst': '<circle class="h" cx="24" cy="19" r="13"/><circle cx="24" cy="19" r="13"/><path d="M24 6v26M11 19h26M15 10l18 18M33 10L15 28"/><circle class="f" cx="24" cy="19" r="3"/><path class="t" d="M16 37l-2 6M24 37v8M32 37l2 6"/>',
});
{
  const fam = {
    lp: '<path class="h" d="M4 14h14v12H4z"/><path d="M4 14h14v12H4zM18 18h7v4h-7z"/><path class="f" d="M27 19h5v2h-5zM34 19h5v2h-5zM41 19h4v2h-4z"/>',
    bm: '<path class="h" d="M4 12h12v16H4z"/><path d="M4 12h12v16H4zM16 16l8-4v16l-8-4"/><path class="f" d="M25 18h20v4H25z"/><path class="t" d="M27 13h16M27 27h16"/>',
    mg: '<path class="h" d="M4 14h16v10H4z"/><path d="M4 14h16v10H4zM20 17h24M20 21h24"/><path class="f" d="M8 24h8v8H8z"/>',
    ac: '<path class="h" d="M3 12h18v16H3z"/><path d="M3 12h18v16H3zM7 12V7h10v5"/><path class="f" d="M21 17h20v6H21zM40 14h5v12h-5z"/>',
    sg: '<path class="h" d="M4 13h14v14H4z"/><path d="M4 13h14v14H4zM18 15h14M18 20h14M18 25h14"/><path class="t" d="M35 10l8-5M36 16l9-2M36 24l9 2M35 30l8 5"/><circle class="f" cx="41" cy="20" r="1.600"/>',
    sr: '<path class="h" d="M5 8h22v24H5z"/><path d="M5 8h22v24H5z"/><circle class="f" cx="12" cy="15" r="3"/><circle class="f" cx="20" cy="15" r="3"/><circle class="f" cx="12" cy="25" r="3"/><circle class="f" cx="20" cy="25" r="3"/><path d="M31 20h9M36 16l4 4-4 4"/>',
    lr: '<path class="h" d="M4 8h18v28H4z"/><path d="M4 8h18v28H4zM4 17h18M4 27h18M13 8v28"/><path d="M26 32q6-28 16-10M38 19l5 3 1-6"/>',
    rk: '<circle class="h" cx="16" cy="20" r="12"/><circle cx="16" cy="20" r="12"/><circle class="f" cx="16" cy="20" r="2.200"/><circle class="f" cx="16" cy="12.500" r="1.800"/><circle class="f" cx="16" cy="27.500" r="1.800"/><circle class="f" cx="9.500" cy="16" r="1.800"/><circle class="f" cx="22.500" cy="16" r="1.800"/><circle class="f" cx="9.500" cy="24" r="1.800"/><circle class="f" cx="22.500" cy="24" r="1.800"/><path d="M32 20h12M40 16l4 4-4 4"/>',
    pr: '<path class="h" d="M4 15h14l6-4v18l-6-4H4z"/><path d="M4 15h14l6-4v18l-6-4H4z"/><circle class="h" cx="33" cy="20" r="5"/><circle cx="33" cy="20" r="5"/><circle class="f" cx="33" cy="20" r="2"/><path class="t" d="M40 20h5"/>',
    gs: '<path class="f" d="M3 12h8v16H3z"/><path d="M11 20h30"/><path class="h" d="M14 13h5v14h-5zM23 13h5v14h-5zM32 13h5v14h-5z"/><path d="M14 13h5v14h-5zM23 13h5v14h-5zM32 13h5v14h-5z"/><path class="f" d="M41 17.500h4v5h-4z"/>',
    fl: '<path class="h" d="M4 12h14v10H4z"/><path d="M4 12h14v10H4zM18 17h7M6 22v7h10v-7"/><path class="f" d="M26 17q7-12 9-3 6-6 9 3-2 13-10 6-5 5-8-6z"/>',
    fs: '<path class="h" d="M14 8h22v22H14z"/><path d="M14 8h22v22H14zM14 16h22M21.500 8v8M29 8v8"/><path class="f" d="M3 13h11v12H3z"/><path class="t" d="M39 10l5-3M40 19h6M39 28l5 3"/>',
    sw: '<circle class="h" cx="29" cy="19" r="13"/><circle cx="29" cy="19" r="13" stroke-dasharray="5 3.200"/><circle class="f" cx="29" cy="19" r="3.400"/><path class="f" d="M3 15h13v8H3z"/>',
    tb: '<path class="f" d="M3 25h10v7H3z"/><path class="h" d="M13 23L45 5l-5 10-23 16z"/><path d="M13 23L45 5l-5 10-23 16z"/><path class="t" d="M18 25l20-12"/>',
    mau: '<path d="M6 36L30 15"/><path class="h" d="M24 4l17 7-7 16-16-7z"/><path d="M24 4l17 7-7 16-16-7z"/><path class="f" d="M3 34l5-4 4 5-5 4z"/>',
    mt: '<path class="f" d="M4 28h20v8H4z"/><path class="h" d="M10 28l10-18 8 4-8 16z"/><path d="M10 28l10-18 8 4-8 16z"/><path class="t" d="M27 8q10-6 16 6"/><circle class="f" cx="43" cy="16" r="2.400"/>',
    ar: '<path class="h" d="M4 14h12v12H4z"/><path d="M4 14h12v12H4zM16 16h9l6-6M16 24h9l6 6"/><path d="M33 20l4-5 2 8 5-6"/><circle class="f" cx="29" cy="20" r="2.400"/>',
    io: '<circle class="h" cx="11" cy="20" r="8"/><circle cx="11" cy="20" r="8"/><path d="M19 20h26M25 14v12M31 15v10M37 16v8"/><circle class="f" cx="11" cy="20" r="3"/>',
  };
  for (const [id, lv, f] of ARM_FAM) GLYPH['arm.' + id] = fam[f] + (f === 'mau' ? '' : `<path class="f" d="${[0, 1, 2].slice(0, lv).map(i => `M${4 + i * 6} 40h4v5h-4z`).join('')}"/>`);
}
for (const [c, k] of [['legs', 'legs.bip'], ['torso', 'torso.bas'], ['head', 'head.vis'], ['arm', 'arm.las'], ['back', 'back.jet'], ['gear', 'gear.kit']]) GLYPH[c] = GLYPH[k];
const iconSvg = (key, px = 40, col) => `<svg class="ic" viewBox="0 0 48 48" width="${px}" height="${px}" style="color:${col || (ICAT[key.split('.')[0]] || {}).col || '#ffb21a'}">${GLYPH[key] || GLYPH.none}</svg>`;

/* the company emblem: a field shape, a charge, three colours. Drawn on a unit square so it can go on a button or a blast door */
const LOGO_SHAPES = [
  ['SHIELD', g => { g.moveTo(-.82, -.86); g.lineTo(.82, -.86); g.lineTo(.82, .08); g.quadraticCurveTo(.8, .68, 0, .98); g.quadraticCurveTo(-.8, .68, -.82, .08); g.closePath(); }],
  ['ROUNDEL', g => { g.arc(0, 0, .93, 0, TAU); }],
  ['HEX', g => { for (let i = 0; i < 6; i++) g.lineTo(Math.sin(i * TAU / 6) * .96, -Math.cos(i * TAU / 6) * .96); g.closePath(); }],
  ['DIAMOND', g => { g.moveTo(0, -.98); g.lineTo(.86, 0); g.lineTo(0, .98); g.lineTo(-.86, 0); g.closePath(); }],
  ['PLATE', g => { g.moveTo(-.6, -.88); g.lineTo(.6, -.88); g.lineTo(.88, -.6); g.lineTo(.88, .6); g.lineTo(.6, .88); g.lineTo(-.6, .88); g.lineTo(-.88, .6); g.lineTo(-.88, -.6); g.closePath(); }],
  ['COG', g => { for (let i = 0; i < 12; i++) { const a = i * TAU / 12, w = TAU / 48; for (const [da, r] of [[-w * 1.5, .78], [-w, .96], [w, .96], [w * 1.5, .78]]) g.lineTo(Math.sin(a + da) * r, -Math.cos(a + da) * r); } g.closePath(); }],
  ['PENNANT', g => { g.moveTo(-.76, -.9); g.lineTo(.76, -.9); g.lineTo(.76, .42); g.lineTo(0, .98); g.lineTo(-.76, .42); g.closePath(); }],
  ['DELTA', g => { g.moveTo(0, -.96); g.lineTo(.96, .8); g.lineTo(-.96, .8); g.closePath(); }],
];
const logoPoly = (g, pts) => { g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); };
const logoSword = g => { logoPoly(g, [0, -1, .13, -.78, .13, .3, -.13, .3, -.13, -.78]); logoPoly(g, [-.42, .3, .42, .3, .42, .44, -.42, .44]); logoPoly(g, [-.09, .44, .09, .44, .09, .86, -.09, .86]); g.moveTo(.16, .93); g.arc(0, .93, .16, 0, TAU); };
const LOGO_SYMS = [
  ['ANVIL', g => { g.beginPath(); g.moveTo(-.78, -.46); g.lineTo(.42, -.46); g.lineTo(.92, -.3); g.lineTo(.42, -.12); g.lineTo(.2, -.12); g.quadraticCurveTo(.1, .2, .4, .34); g.lineTo(.5, .34); g.lineTo(.5, .62); g.lineTo(-.6, .62); g.lineTo(-.6, .34); g.lineTo(-.5, .34); g.quadraticCurveTo(-.2, .2, -.3, -.12); g.lineTo(-.78, -.12); g.closePath(); g.fill(); }],
  ['GEAR', g => { g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * TAU / 8, w = TAU / 32; for (const [da, r] of [[-w * 1.6, .66], [-w, .92], [w, .92], [w * 1.6, .66]]) g.lineTo(Math.sin(a + da) * r, -Math.cos(a + da) * r); } g.closePath(); g.moveTo(.3, 0); g.arc(0, 0, .3, 0, TAU, true); g.fill('evenodd'); }],
  ['BOLT', g => { g.beginPath(); logoPoly(g, [.2, -.95, -.5, .1, -.06, .1, -.24, .95, .52, -.22, .08, -.22]); g.fill(); }],
  ['SKULL', g => { g.beginPath(); g.arc(0, -.2, .66, 0, TAU); g.moveTo(-.1, -.16); g.arc(-.29, -.16, .19, 0, TAU, true); g.moveTo(.48, -.16); g.arc(.29, -.16, .19, 0, TAU, true); g.moveTo(-.09, .3); g.lineTo(0, .06); g.lineTo(.09, .3); g.closePath(); g.fill('evenodd'); g.beginPath(); g.rect(-.38, .4, .76, .42); for (const x of [-.19, 0, .19]) g.rect(x - .03, .52, .06, .3); g.fill('evenodd'); }],
  ['RETICLE', g => { g.lineWidth = .14; g.beginPath(); g.arc(0, 0, .62, 0, TAU); g.stroke(); g.beginPath(); for (const [x, y] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) { g.moveTo(x * .34, y * .34); g.lineTo(x * .94, y * .94); } g.stroke(); g.beginPath(); g.arc(0, 0, .1, 0, TAU); g.fill(); }],
  ['STAR', g => { g.beginPath(); for (let i = 0; i < 10; i++) { const a = i * TAU / 10, r = i & 1 ? .4 : .96; g.lineTo(Math.sin(a) * r, -Math.cos(a) * r); } g.closePath(); g.fill(); }],
  ['SWORD', g => { g.beginPath(); logoSword(g); g.fill(); }],
  ['HAMMER', g => { g.save(); g.rotate(-.6); g.beginPath(); logoPoly(g, [-.56, -.86, .56, -.86, .56, -.34, -.56, -.34]); logoPoly(g, [-.1, -.34, .1, -.34, .1, .94, -.1, .94]); g.fill(); g.restore(); }],
  ['CHEVRONS', g => { g.beginPath(); for (const y of [-.7, -.2, .3]) logoPoly(g, [-.78, y, 0, y + .42, .78, y, .78, y + .26, 0, y + .68, -.78, y + .26]); g.fill(); }],
  ['FLAME', g => { g.beginPath(); g.moveTo(0, -.96); g.bezierCurveTo(.1, -.4, .76, -.2, .62, .4); g.bezierCurveTo(.5, .86, -.5, .86, -.62, .4); g.bezierCurveTo(-.7, .02, -.34, -.1, -.3, -.46); g.bezierCurveTo(-.1, -.36, -.06, -.6, 0, -.96); g.moveTo(0, .1); g.bezierCurveTo(-.34, .36, -.26, .7, 0, .7); g.bezierCurveTo(.26, .7, .34, .36, 0, .1); g.fill('evenodd'); }],
  ['VISOR', g => { g.beginPath(); logoPoly(g, [-.5, -.82, .5, -.82, .82, -.3, .82, .5, .4, .86, -.4, .86, -.82, .5, -.82, -.3]); logoPoly(g, [-.6, -.16, -.6, .12, .6, .12, .6, -.16]); g.fill('evenodd'); }],
  ['WINGS', g => { g.beginPath(); for (const s of [-1, 1]) { g.moveTo(0, .5); g.lineTo(s * .16, -.3); g.quadraticCurveTo(s * .6, -.74, s * .98, -.6); g.lineTo(s * .78, -.3); g.lineTo(s * .9, -.12); g.lineTo(s * .62, .04); g.lineTo(s * .7, .22); g.lineTo(s * .4, .3); g.closePath(); } g.fill(); g.beginPath(); g.arc(0, -.5, .18, 0, TAU); g.fill(); }],
  ['CROWN', g => { g.beginPath(); logoPoly(g, [-.84, -.5, -.42, 0, 0, -.74, .42, 0, .84, -.5, .68, .5, -.68, .5]); logoPoly(g, [-.68, .6, .68, .6, .68, .78, -.68, .78]); g.fill(); }],
  ['BLADES', g => { for (const a of [-.7, .7]) { g.save(); g.rotate(a); g.beginPath(); logoSword(g); g.fill(); g.restore(); } }],
];
function drawLogo(g, cx, cy, r, L = YARD.logo, flat) {
  g.save(); g.translate(cx, cy); g.scale(r, r); g.lineJoin = 'round';
  g.beginPath(); LOGO_SHAPES[L.shape][1](g); g.fillStyle = L.c1; g.fill(); if (!flat) { const gr = g.createLinearGradient(0, -1, 0, 1); gr.addColorStop(0, 'rgba(255,255,255,.16)'); gr.addColorStop(.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,.3)'); g.fillStyle = gr; g.fill(); }
  g.lineWidth = .1; g.strokeStyle = L.c3; g.stroke(); g.save(); g.clip(); g.scale(.86, .86); g.beginPath(); LOGO_SHAPES[L.shape][1](g); g.lineWidth = .028; g.strokeStyle = L.c3; g.globalAlpha = .6; g.stroke(); g.restore();
  const k = [.52, .56, .56, .44, .56, .48, .5, .4][L.shape], dy = [-.08, 0, 0, 0, 0, 0, -.1, .2][L.shape]; g.translate(0, dy); g.scale(k, k); g.fillStyle = g.strokeStyle = L.c2; LOGO_SYMS[L.sym][1](g); g.restore();
}
const LOGO_INKS = ['#1b1e22', '#f1ead9', '#ffb21a', '#ff5a1f', '#b3201a', '#7fe7ff', '#1f5fa8', '#8dff6a', '#2e6b3a', '#c9a0ff', '#5d6b3e', '#70767d'];
/* a logo canvas at a given pixel size; callers cache it against YARD.logoV */
function logoCanvas(px, L = YARD.logo) { const c = document.createElement('canvas'); c.width = c.height = px; drawLogo(c.getContext('2d'), px / 2, px / 2, px / 2 - 2, L); return c; }

