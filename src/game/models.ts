import * as THREE from 'three';

/** All models are original, built from primitives — no external assets. */
export const PAL = { coral: '#ff6a4a', cobalt: '#3b47ff', butter: '#ffd75e', lavender: '#cdbdff', mint: '#bfe6cf', burgundy: '#940428', paper: '#f3ecdc', ink: '#1f1a17', skin: '#f2c29b', orange: '#ff9a2e', pink: '#ffb3c7', green: '#2fbf71' };

const matCache = new Map<string, THREE.MeshStandardMaterial>();
export function mat(color: string, o: { rough?: number; metal?: number; emissive?: string; ei?: number; map?: THREE.Texture | null } = {}) {
  const key = `${color}|${o.rough ?? 0.7}|${o.metal ?? 0}|${o.emissive ?? ''}|${o.ei ?? 0}|${o.map?.uuid ?? ''}`;
  let m = matCache.get(key);
  if (!m) { m = new THREE.MeshStandardMaterial({ color, roughness: o.rough ?? 0.7, metalness: o.metal ?? 0, emissive: o.emissive ?? '#000', emissiveIntensity: o.ei ?? 0, map: o.map ?? null }); matCache.set(key, m); }
  return m;
}
const box = (w: number, h: number, d: number, c: string, o?: Parameters<typeof mat>[1]) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c, o));
const cyl = (rt: number, rb: number, h: number, c: string, seg = 16) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat(c));
const sph = (r: number, c: string, o?: Parameters<typeof mat>[1]) => new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), mat(c, o));
const caps = (r: number, l: number, c: string) => new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 4, 10), mat(c));
const at = <T extends THREE.Object3D>(o: T, x: number, y: number, z: number) => { o.position.set(x, y, z); return o; };

/** Canvas text texture (used for signs/documents). */
export function textTexture(lines: string[], bg: string, fg: string, w = 512, h = 256, accent?: string) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d')!;
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
  const size = Math.min(h / (lines.length + 0.6), w / 7);
  g.font = `800 ${size}px 'Bricolage Grotesque Variable','Bricolage Grotesque',Arial Black,sans-serif`;
  lines.forEach((l, i) => g.fillText(l, w / 2, (h * (i + 1)) / (lines.length + 1)));
  if (accent) { g.fillStyle = accent; g.fillRect(w * 0.12, h - 22, w * 0.76, 10); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

/* ------------------------------- characters ------------------------------- */
export type Rig = { group: THREE.Group; body: THREE.Group; armL: THREE.Group; armR: THREE.Group; legL: THREE.Group; legR: THREE.Group; head: THREE.Group };
const limb = (x: number, y: number, len: number, r: number, c: string, end?: THREE.Object3D) => {
  const g = new THREE.Group(); g.position.set(x, y, 0);
  const m = caps(r, len, c); m.position.y = -len / 2 - r * 0.4; g.add(m);
  if (end) { end.position.y = -len - r * 0.9; g.add(end); }
  return g;
};

/** The designer: coral hoodie, butter beanie, cobalt backpack with a stylus sticking out. Faces −z (away from the camera). */
export function buildDesigner(): Rig {
  const group = new THREE.Group(), body = new THREE.Group(); group.add(body);
  body.add(at(caps(0.3, 0.42, PAL.coral), 0, 1.08, 0));
  body.add(at(box(0.5, 0.14, 0.34, PAL.burgundy), 0, 0.78, 0));                         // belt/waist
  const head = new THREE.Group(); head.position.set(0, 1.66, 0); body.add(head);
  head.add(sph(0.3, PAL.skin));
  const beanie = new THREE.Mesh(new THREE.SphereGeometry(0.325, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), mat(PAL.butter)); beanie.position.y = 0.04; head.add(beanie);
  head.add(at(sph(0.09, PAL.coral), 0, 0.36, 0));                                        // pompom
  head.add(at(box(0.62, 0.07, 0.4, PAL.cobalt), 0, 0.02, 0));                             // headphone band
  const pack = box(0.52, 0.66, 0.26, PAL.cobalt); body.add(at(pack, 0, 1.12, 0.3));        // backpack (faces the camera)
  body.add(at(box(0.4, 0.2, 0.06, PAL.mint), 0, 1.02, 0.45));
  const pen = cyl(0.035, 0.035, 0.6, PAL.lavender, 8); pen.rotation.z = 0.35; body.add(at(pen, 0.12, 1.62, 0.32));
  body.add(at(sph(0.05, PAL.pink), 0.22, 1.9, 0.32));
  const hand = () => sph(0.1, PAL.skin);
  const armL = limb(-0.4, 1.3, 0.42, 0.095, PAL.coral, hand()), armR = limb(0.4, 1.3, 0.42, 0.095, PAL.coral, hand());
  const shoe = () => box(0.2, 0.12, 0.3, '#ffffff'); const s1 = shoe(), s2 = shoe(); s1.position.z = -0.05; s2.position.z = -0.05;
  const legL = limb(-0.15, 0.82, 0.42, 0.12, '#2b3a8f', s1), legR = limb(0.15, 0.82, 0.42, 0.12, '#2b3a8f', s2);
  body.add(armL, armR, legL, legR);
  group.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; } });
  return { group, body, armL, armR, legL, legR, head };
}

/** The client: bigger, burgundy suit, flapping butter tie, briefcase, perpetually shouting. */
export function buildClient(): Rig {
  const group = new THREE.Group(), body = new THREE.Group(); group.add(body);
  body.add(at(caps(0.38, 0.5, PAL.burgundy), 0, 1.12, 0));
  body.add(at(box(0.22, 0.6, 0.08, '#fffaf1'), 0, 1.2, 0.34));
  const tie = box(0.12, 0.7, 0.05, PAL.butter); tie.name = 'tie'; tie.geometry.translate(0, -0.35, 0); tie.position.set(0, 1.55, 0.4); body.add(tie);
  const head = new THREE.Group(); head.position.set(0, 1.84, 0); body.add(head);
  head.add(at(sph(0.4, '#f0b08a'), 0, 0, 0));
  head.add(at(sph(0.1, '#f0b08a'), 0, -0.05, 0.38 * -1 + 0.0));                           // nose (front, −z)
  head.add(at(box(0.7, 0.12, 0.3, '#3a2a22'), 0, 0.3, 0.1));                               // comb-over hair
  head.add(at(box(0.2, 0.04, 0.04, '#222'), -0.16, 0.12, -0.36));                          // angry eyebrows
  head.add(at(box(0.2, 0.04, 0.04, '#222'), 0.16, 0.12, -0.36));
  head.children[head.children.length - 1].rotation.z = -0.4; head.children[head.children.length - 2].rotation.z = 0.4;
  head.add(at(sph(0.07, '#111'), -0.15, 0.02, -0.36)); head.add(at(sph(0.07, '#111'), 0.15, 0.02, -0.36));
  const mouth = box(0.2, 0.16, 0.05, '#5a0a18'); mouth.name = 'mouth'; head.add(at(mouth, 0, -0.2, -0.37));
  body.add(at(box(0.5, 0.38, 0.12, PAL.coral), 0.7, 0.8, 0));                              // briefcase on the right hand (placed in arm)
  body.children[body.children.length - 1].visible = false;
  const hand = () => sph(0.13, '#f0b08a');
  const case_ = box(0.5, 0.38, 0.14, '#6b3b1d'); case_.position.set(0, -0.78, 0);
  const armL = limb(-0.52, 1.42, 0.5, 0.12, PAL.burgundy, hand()), armR = limb(0.52, 1.42, 0.5, 0.12, PAL.burgundy, hand()); armR.add(case_);
  const shoe = () => box(0.26, 0.14, 0.38, '#111');
  const legL = limb(-0.2, 0.84, 0.48, 0.15, '#2a1418', shoe()), legR = limb(0.2, 0.84, 0.48, 0.15, '#2a1418', shoe());
  body.add(armL, armR, legL, legR);
  group.scale.setScalar(1.18);
  group.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.castShadow = true; });
  return { group, body, armL, armR, legL, legR, head };
}

/* ------------------------------- obstacles ------------------------------- */
export type ObstacleKind = 'barrier' | 'cardboard' | 'coffee' | 'docs' | 'board' | 'frame' | 'palette' | 'cursor';
export type Obstacle = { kind: ObstacleKind; group: THREE.Group; w: number; h: number; y0: number; d: number; need: 'jump' | 'slide' | 'switch' };
const shadowed = (g: THREE.Group) => { g.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.castShadow = true; }); return g; };

export function buildObstacle(kind: ObstacleKind): Obstacle {
  const g = new THREE.Group();
  switch (kind) {
    case 'barrier': {
      g.add(at(box(2.0, 0.5, 0.3, '#ffffff'), 0, 0.62, 0));
      for (let i = 0; i < 4; i++) g.add(at(box(0.3, 0.52, 0.32, i % 2 ? '#ffffff' : PAL.coral), -0.75 + i * 0.5, 0.62, 0));
      g.add(at(box(0.14, 0.62, 0.14, '#555'), -0.8, 0.3, 0), at(box(0.14, 0.62, 0.14, '#555'), 0.8, 0.3, 0));
      g.add(at(sph(0.1, PAL.butter, { emissive: PAL.butter, ei: 0.8 }), 0, 1.0, 0));
      return { kind, group: shadowed(g), w: 2.0, h: 0.95, y0: 0, d: 0.5, need: 'jump' };
    }
    case 'cardboard': {
      g.add(at(box(1.6, 0.8, 1.2, '#c9a27e'), 0, 0.4, 0), at(box(1.0, 0.55, 0.9, '#b98f68'), -0.2, 1.07, 0.05));
      g.add(at(box(0.25, 0.82, 1.22, '#e3d3ae'), 0, 0.4, 0), at(box(1.02, 0.18, 0.2, '#e3d3ae'), -0.2, 1.1, 0.05));
      return { kind, group: shadowed(g), w: 1.8, h: 1.3, y0: 0, d: 1.2, need: 'jump' };
    }
    case 'coffee': {
      const cup = cyl(0.85, 0.62, 1.9, '#ffffff', 24); cup.position.y = 0.95; g.add(cup);
      g.add(at(cyl(0.8, 0.7, 0.7, PAL.coral, 24), 0, 0.95, 0), at(cyl(0.9, 0.9, 0.16, PAL.ink, 24), 0, 1.95, 0), at(cyl(0.7, 0.7, 0.08, '#5a3a22', 24), 0, 2.04, 0));
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.09, 8, 16, Math.PI), mat('#ffffff')); handle.rotation.z = -Math.PI / 2; handle.position.set(0.95, 1.1, 0); g.add(handle);
      return { kind, group: shadowed(g), w: 1.7, h: 2.1, y0: 0, d: 1.7, need: 'switch' };
    }
    case 'docs': {
      const tex = textTexture(['REVISION', 'v47_FINAL', 'final2.pdf'], '#ffffff', PAL.burgundy, 256, 384, PAL.coral);
      g.add(at(box(1.7, 2.4, 0.6, '#f7f2e7'), 0, 1.2, 0));
      const face = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.2), mat('#ffffff', { map: tex })); face.position.set(0, 1.2, 0.31); g.add(face);
      g.add(at(box(0.3, 0.5, 0.64, PAL.coral), 0.9, 1.9, 0), at(box(0.3, 0.5, 0.64, PAL.cobalt), 0.9, 1.2, 0), at(box(0.3, 0.5, 0.64, PAL.mint), 0.9, 0.5, 0));
      g.rotation.y = 0.0;
      return { kind, group: shadowed(g), w: 1.9, h: 2.4, y0: 0, d: 0.7, need: 'switch' };
    }
    case 'board': {
      const tex = textTexture(['ONE MORE', 'CHANGE!'], PAL.butter, PAL.burgundy, 512, 256, PAL.coral);
      g.add(at(box(2.3, 1.3, 0.2, PAL.ink), 0, 2.05, 0));
      const face = new THREE.Mesh(new THREE.PlaneGeometry(2.14, 1.14), mat('#ffffff', { map: tex })); face.position.set(0, 2.05, 0.11); g.add(face);
      g.add(at(cyl(0.07, 0.07, 2.7, '#666', 8), -1.05, 1.35, 0), at(cyl(0.07, 0.07, 2.7, '#666', 8), 1.05, 1.35, 0));
      return { kind, group: shadowed(g), w: 2.3, h: 1.3, y0: 1.4, d: 0.3, need: 'slide' };
    }
    case 'frame': {
      const c = PAL.cobalt;
      g.add(at(box(2.3, 0.14, 0.2, c), 0, 3.0, 0), at(box(2.3, 0.14, 0.2, c), 0, 1.4, 0), at(box(0.14, 1.7, 0.2, c), -1.08, 2.2, 0), at(box(0.14, 1.7, 0.2, c), 1.08, 2.2, 0));
      for (const [x, y] of [[-1.08, 3.0], [1.08, 3.0], [-1.08, 1.4], [1.08, 1.4]]) g.add(at(box(0.3, 0.3, 0.26, '#ffffff'), x, y, 0));
      const tex = textTexture(['Frame 12'], PAL.cobalt, '#ffffff', 256, 64);
      const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.26), mat('#ffffff', { map: tex })); tag.position.set(-0.7, 3.28, 0); g.add(tag);
      const fill = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.5), new THREE.MeshStandardMaterial({ color: PAL.lavender, transparent: true, opacity: 0.35, side: THREE.DoubleSide })); fill.position.set(0, 2.2, 0); g.add(fill);
      return { kind, group: shadowed(g), w: 2.3, h: 1.7, y0: 1.4, d: 0.3, need: 'slide' };
    }
    case 'palette': {
      const cols = [PAL.coral, PAL.butter, PAL.cobalt, PAL.mint];
      cols.forEach((c, i) => g.add(at(box(0.5, 0.8 + (i % 2) * 0.12, 0.9, c), -0.75 + i * 0.5, 0.42 + (i % 2) * 0.06, 0)));
      g.add(at(box(2.1, 0.1, 1.0, PAL.ink), 0, 0.05, 0));
      return { kind, group: shadowed(g), w: 2.1, h: 0.95, y0: 0, d: 0.9, need: 'jump' };
    }
    case 'cursor': {
      const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(0, -2.5); s.lineTo(0.62, -1.95); s.lineTo(1.0, -2.8); s.lineTo(1.4, -2.62); s.lineTo(1.02, -1.8); s.lineTo(1.8, -1.8); s.closePath();
      const geo = new THREE.ExtrudeGeometry(s, { depth: 0.35, bevelEnabled: false });
      const m = new THREE.Mesh(geo, mat('#ffffff')); m.position.set(-0.8, 2.7, -0.17); m.rotation.z = 0.0; g.add(m);
      const edge = new THREE.Mesh(geo, mat(PAL.ink)); edge.scale.set(1.12, 1.07, 0.7); edge.position.set(-0.86, 2.74, -0.1); g.add(edge);
      g.add(at(cyl(0.08, 0.08, 1.8, '#999', 8), 0, 0.9, 0));
      return { kind, group: shadowed(g), w: 1.5, h: 2.6, y0: 0, d: 0.6, need: 'switch' };
    }
  }
}
export const LOW: ObstacleKind[] = ['barrier', 'cardboard', 'palette'];
export const TALL: ObstacleKind[] = ['coffee', 'docs', 'cursor'];
export const OVER: ObstacleKind[] = ['board', 'frame'];

/* ------------------------------ collectibles ------------------------------ */
export type CollectKind = 'coin' | 'gem' | 'star' | 'token';
export function buildCollectible(kind: CollectKind, variant = 0): THREE.Object3D {
  const g = new THREE.Group();
  const cols = [PAL.coral, PAL.cobalt, PAL.mint, PAL.lavender, PAL.pink];
  if (kind === 'coin') {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.1, 24), mat(PAL.butter, { metal: 0.6, rough: 0.3, emissive: PAL.orange, ei: 0.25 })); c.rotation.x = Math.PI / 2; g.add(c);
    const r = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 6, 20), mat(PAL.orange)); g.add(r);
  } else if (kind === 'gem') {
    const c = cols[variant % cols.length];
    g.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.46), mat(c, { rough: 0.2, metal: 0.2, emissive: c, ei: 0.35 })));
  } else if (kind === 'star') {
    const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.22 : 0.5; (i ? s.lineTo : s.moveTo).call(s, Math.cos(a) * r, Math.sin(a) * r); } s.closePath();
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.14, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 1 }), mat(PAL.orange, { emissive: PAL.butter, ei: 0.4, rough: 0.35 })); m.position.z = -0.07; g.add(m);
  } else {
    // design token: rounded plate with three colour dots (original arrangement)
    const r = 0.1, w = 0.42, s = new THREE.Shape();
    s.moveTo(-w + r, -w); s.lineTo(w - r, -w); s.quadraticCurveTo(w, -w, w, -w + r); s.lineTo(w, w - r); s.quadraticCurveTo(w, w, w - r, w); s.lineTo(-w + r, w); s.quadraticCurveTo(-w, w, -w, w - r); s.lineTo(-w, -w + r); s.quadraticCurveTo(-w, -w, -w + r, -w);
    g.add(new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: false }), mat('#ffffff', { rough: 0.3 })));
    const dots: [number, number, string][] = [[-0.17, 0.17, PAL.coral], [0.17, 0.17, PAL.cobalt], [0, -0.16, PAL.mint]];
    for (const [x, y, c] of dots) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), mat(c, { emissive: c, ei: 0.3 })); d.position.set(x, y, 0.14); g.add(d); }
    g.position.z = -0.06;
  }
  const wrap = new THREE.Group(); wrap.add(g); wrap.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.castShadow = false; });
  return wrap;
}
