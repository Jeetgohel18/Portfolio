import * as THREE from 'three';
import { sfx } from './audio';
import { buildClient, buildCollectible, buildDesigner, buildObstacle, LOW, mat, OVER, PAL, TALL } from './models';
import type { CollectKind, Obstacle, ObstacleKind, Rig } from './models';

/** Design Dash engine: a small, self-contained Three.js endless runner (3 lanes, pooled obstacles/collectibles). */
export type GameState = 'ready' | 'playing' | 'paused' | 'over';
export type Action = 'left' | 'right' | 'jump' | 'slide';
export type Hud = { score: number; items: number; speed: number; chase: number };
export type Callbacks = { onHud: (h: Hud) => void; onState: (s: GameState) => void; onEvent: (e: 'hit' | 'collect' | 'over') => void };

const LANE_X = [-2.4, 0, 2.4];
const CHUNK = 36, CHUNKS = 7, SPAWN_Z = -125, DESPAWN_Z = 14;
const BASE_SPEED = 15, MAX_SPEED = 34, RAMP = 0.2;
const GRAVITY = 46, JUMP_V = 16.2;
const SLIDE_TIME = 0.7, PLAYER_H = 1.7, SLIDE_H = 0.75;
const PHRASES = ['ONE MORE CHANGE!', 'Make the logo bigger!', 'Can we see more options?', 'Quick tweak?!', 'Needs more POP!', 'ASAP!!', 'Love it! Now redo it.', 'Can it be… bluer?'];

type Ob = { o: Obstacle; kind: ObstacleKind; lane: number; z: number; active: boolean; spent: boolean; uid: number };
type Col = { obj: THREE.Object3D; kind: CollectKind; lane: number; z: number; y: number; active: boolean; spin: number };
type Part = { m: THREE.Mesh; vx: number; vy: number; vz: number; life: number };

export class DashEngine {
  state: GameState = 'ready';
  private R: THREE.WebGLRenderer; private scene = new THREE.Scene(); private cam: THREE.PerspectiveCamera; private sun: THREE.DirectionalLight;
  private raf = 0; private last = 0; private dead = false;
  private player: Rig; private client: Rig; private bubble: THREE.Sprite; private phraseTex: THREE.CanvasTexture[] = []; private bubbleT = 0; private nextBubble = 3;
  private chunks: THREE.Group[] = []; private clouds: THREE.Mesh[] = [];
  private obstacles: Ob[] = []; private cols: Col[] = []; private parts: Part[] = [];
  // run state
  private speed = 0; private dist = 0; private itemsN = 0; private bonus = 0; private elapsed = 0; private chase = 0; private spawnIn = 30;
  private lane = 1; private px = 0; private py = 0; private vy = 0; private slideT = 0; private grounded = true; private invuln = 0; private shake = 0; private stumble = 0;
  private hudT = 0; private frames = 0; private fpsT = 0; fps = 60; private tilt = 0;
  private rowCount = 0; private uidSeq = 0; private peakPy = 0;
  private reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor(private host: HTMLElement, private cb: Callbacks) {
    this.R = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });   // throws if WebGL is unavailable
    this.R.shadowMap.enabled = true; this.R.shadowMap.type = THREE.PCFShadowMap; this.R.outputColorSpace = THREE.SRGBColorSpace;
    this.R.domElement.className = 'dd-canvas'; host.appendChild(this.R.domElement);
    this.scene.background = new THREE.Color('#bfe3ff'); this.scene.fog = new THREE.Fog('#cfe9ff', 45, 135);
    this.cam = new THREE.PerspectiveCamera(62, 1, 0.1, 220);
    this.scene.add(new THREE.HemisphereLight('#ffffff', '#ffd9c2', 1.15));
    this.sun = new THREE.DirectionalLight('#fff1d6', 2.2); this.sun.position.set(9, 18, 8); this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(1024, 1024); const sc = this.sun.shadow.camera; sc.left = -16; sc.right = 16; sc.top = 22; sc.bottom = -22; sc.near = 1; sc.far = 60; this.sun.shadow.bias = -0.0006;
    this.scene.add(this.sun, this.sun.target);
    this.buildWorld();
    this.player = buildDesigner(); this.scene.add(this.player.group);
    this.client = buildClient(); this.scene.add(this.client.group);
    this.bubble = this.buildBubble(); this.scene.add(this.bubble);
    this.pool();
    this.resize(); this.resetRun(false);
    this.raf = requestAnimationFrame(this.loop);
  }

  /* ------------------------------ world building ------------------------------ */
  private windowTex() {
    const c = document.createElement('canvas'); c.width = 128; c.height = 128; const g = c.getContext('2d')!;
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 128, 128); g.fillStyle = 'rgba(40,60,110,.55)';
    for (let y = 0; y < 4; y++) for (let x = 0; x < 3; x++) g.fillRect(14 + x * 38, 12 + y * 30, 26, 18);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  private buildWorld() {
    const wt = this.windowTex(); const BC = [PAL.coral, PAL.cobalt, PAL.butter, PAL.lavender, PAL.mint, PAL.pink, PAL.orange, '#8fd3ff'];
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const road = mat('#2d2d38', { rough: 0.9 }), walk = mat('#f3ecdc'), curb = mat(PAL.coral), dash = mat('#ffd75e', { emissive: '#ffd75e', ei: 0.2 }), trunk = mat('#8a5a3a'), leaf = mat('#5fcf8a'), pole = mat('#444'), lamp = mat('#fff3b0', { emissive: '#fff3b0', ei: 1 });
    for (let i = 0; i < CHUNKS; i++) {
      const g = new THREE.Group();
      const r = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.2, CHUNK), road); r.position.y = -0.1; r.receiveShadow = true; g.add(r);
      for (const sx of [-1.2, 1.2]) for (let k = 0; k < 7; k++) { const d = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.02, 2), dash); d.position.set(sx, 0.01, -CHUNK / 2 + 2.6 + k * 5.1); g.add(d); }
      for (const s of [-1, 1]) {
        const w = new THREE.Mesh(new THREE.BoxGeometry(4, 0.3, CHUNK), walk); w.position.set(s * 5.4, 0.05, 0); w.receiveShadow = true; g.add(w);
        const cb = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.32, CHUNK), curb); cb.position.set(s * 3.55, 0.06, 0); g.add(cb);
        for (let b = 0; b < 3; b++) {
          const bw = rnd(5, 8), bh = rnd(9, 26), bd = CHUNK / 3 - 1.2;
          const geo = new THREE.BoxGeometry(bw, bh, bd); const uv = geo.attributes.uv as THREE.BufferAttribute;
          for (let u = 0; u < uv.count; u++) uv.setXY(u, uv.getX(u) * (bd / 5), uv.getY(u) * (bh / 5));
          const m = new THREE.MeshStandardMaterial({ color: BC[Math.floor(Math.random() * BC.length)], map: wt, roughness: 0.8 });
          const bl = new THREE.Mesh(geo, m); bl.position.set(s * (7.4 + bw / 2), bh / 2, -CHUNK / 2 + (b + 0.5) * (CHUNK / 3)); bl.receiveShadow = true; g.add(bl);
          const roof = new THREE.Mesh(new THREE.BoxGeometry(bw * 0.5, rnd(0.8, 2.2), bd * 0.5), mat(BC[Math.floor(Math.random() * BC.length)])); roof.position.set(bl.position.x, bh + 0.7, bl.position.z); g.add(roof);
        }
        // street lamp + tree
        const lp = new THREE.Group(); const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4.2, 8), pole); p.position.y = 2.1; lp.add(p);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), lamp); head.position.y = 4.3; lp.add(head); lp.position.set(s * 3.9, 0, -8); g.add(lp);
        const tr = new THREE.Group(); const tk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.4, 8), trunk); tk.position.y = 0.8; const lf = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 10), leaf); lf.position.y = 2.0; lf.castShadow = true; tr.add(tk, lf); tr.position.set(s * 4.5, 0, 9); g.add(tr);
      }
      g.position.z = -i * CHUNK + CHUNK; this.scene.add(g); this.chunks.push(g);
    }
    const cm = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.9, fog: false });
    for (let i = 0; i < 7; i++) { const c = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), cm); c.scale.set(rnd(6, 12), rnd(1.4, 2.4), rnd(2, 4)); c.position.set(rnd(-50, 50), rnd(30, 44), -rnd(30, 150)); this.scene.add(c); this.clouds.push(c); }
  }
  private buildBubble() {
    const mk = (t: string) => { const c = document.createElement('canvas'); c.width = 512; c.height = 160; const g = c.getContext('2d')!; g.fillStyle = '#ffffff'; g.strokeStyle = PAL.ink; g.lineWidth = 8; g.beginPath(); g.roundRect(8, 8, 496, 120, 34); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(230, 126); g.lineTo(256, 156); g.lineTo(282, 126); g.fillStyle = '#ffffff'; g.fill(); g.fillStyle = PAL.burgundy; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `800 ${t.length > 18 ? 40 : 52}px 'Bricolage Grotesque Variable','Bricolage Grotesque',Arial Black,sans-serif`; g.fillText(t, 256, 68); const x = new THREE.CanvasTexture(c); x.colorSpace = THREE.SRGBColorSpace; return x; };
    this.phraseTex = PHRASES.map(mk);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.phraseTex[0], transparent: true, depthTest: false, fog: false })); s.scale.set(3.4, 1.06, 1); s.visible = false; s.renderOrder = 10; return s;
  }
  private pool() {
    const kinds: ObstacleKind[] = ['barrier', 'cardboard', 'coffee', 'docs', 'board', 'frame', 'palette', 'cursor'];
    for (const k of kinds) for (let i = 0; i < 7; i++) { const o = buildObstacle(k); o.group.visible = false; this.scene.add(o.group); this.obstacles.push({ o, kind: k, lane: 0, z: 0, active: false, spent: false, uid: 0 }); }
    const defs: [CollectKind, number][] = [['coin', 36], ['gem', 14], ['star', 8], ['token', 10]];
    for (const [k, n] of defs) for (let i = 0; i < n; i++) { const obj = buildCollectible(k, i); obj.visible = false; this.scene.add(obj); this.cols.push({ obj, kind: k, lane: 0, z: 0, y: 1, active: false, spin: Math.random() * 6 }); }
    const pm = new THREE.SphereGeometry(0.1, 6, 5);
    for (let i = 0; i < 36; i++) { const m = new THREE.Mesh(pm, new THREE.MeshBasicMaterial({ color: '#fff' })); m.visible = false; this.scene.add(m); this.parts.push({ m, vx: 0, vy: 0, vz: 0, life: 0 }); }
  }

  /* --------------------------------- control --------------------------------- */
  resize = () => {
    const w = this.host.clientWidth || 800, h = this.host.clientHeight || 600;
    this.R.setPixelRatio(Math.min(window.devicePixelRatio || 1, w < 700 ? 1.5 : 1.75)); this.R.setSize(w, h, false);
    this.R.domElement.style.width = '100%'; this.R.domElement.style.height = '100%';
    this.cam.aspect = w / h; this.cam.fov = w / h < 0.8 ? 74 : 62; this.cam.updateProjectionMatrix();
  };
  private resetRun(running: boolean) {
    this.speed = running ? BASE_SPEED : 7; this.dist = 0; this.itemsN = 0; this.bonus = 0; this.elapsed = 0; this.chase = 0; this.lane = 1; this.px = 0; this.py = 0; this.vy = 0; this.slideT = 0; this.grounded = true;
    this.invuln = 0; this.shake = 0; this.stumble = 0; this.spawnIn = 26; this.rowCount = 0; this.bubble.visible = false; this.bubbleT = 0; this.nextBubble = 3;
    for (const o of this.obstacles) { o.active = false; o.o.group.visible = false; }
    for (const c of this.cols) { c.active = false; c.obj.visible = false; }
    this.emitHud(true);
  }
  start() { this.resetRun(true); this.setState('playing'); sfx.go(); }
  pause() { if (this.state === 'playing') this.setState('paused'); }
  resume() { if (this.state === 'paused') { this.last = 0; this.setState('playing'); } }
  private setState(s: GameState) { this.state = s; this.cb.onState(s); }
  input(a: Action) {
    if (this.state !== 'playing') return;
    if (a === 'left' && this.lane > 0) { this.lane--; sfx.lane(); }
    else if (a === 'right' && this.lane < 2) { this.lane++; sfx.lane(); }
    else if (a === 'jump' && this.grounded) { this.vy = JUMP_V; this.grounded = false; this.slideT = 0; sfx.jump(); }
    else if (a === 'slide') { if (!this.grounded) this.vy = Math.min(this.vy, -22); this.slideT = SLIDE_TIME; sfx.slide(); }
  }
  dispose() {
    this.dead = true; cancelAnimationFrame(this.raf);
    this.scene.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.geometry?.dispose(); const mm = m.material; (Array.isArray(mm) ? mm : [mm]).forEach((x) => { (x as THREE.MeshStandardMaterial).map?.dispose(); x.dispose(); }); } });
    this.R.dispose(); this.R.domElement.remove();
  }

  /* ---------------------------------- spawning ---------------------------------- */
  private place(kind: ObstacleKind, lane: number, z: number) {
    const o = this.obstacles.find((q) => !q.active && q.kind === kind); if (!o) return null;
    o.active = true; o.spent = false; o.uid = ++this.uidSeq; o.lane = lane; o.z = z; o.o.group.visible = true; o.o.group.position.set(LANE_X[lane], 0, z); return o;
  }
  private coin(kind: CollectKind, lane: number, z: number, y: number) {
    const c = this.cols.find((q) => !q.active && q.kind === kind); if (!c) return;
    c.active = true; c.lane = lane; c.z = z; c.y = y; c.obj.visible = true; c.obj.position.set(LANE_X[lane], y, z);
  }
  private line(lane: number, zc: number, n: number, y = 1.0, arc = false) {
    const roll = Math.random(), kind: CollectKind = roll < 0.12 ? 'token' : roll < 0.24 ? 'star' : roll < 0.4 ? 'gem' : 'coin';
    for (let i = 0; i < n; i++) { const t = n > 1 ? i / (n - 1) : 0.5; this.coin(kind, lane, zc - (i - (n - 1) / 2) * 2.1, arc ? y + Math.sin(t * Math.PI) * 1.5 : y); }
  }
  /** Fair patterns: never three tall things in a row, there is always a lane / jump / slide that works. */
  private spawnRow() {
    const z = SPAWN_Z, r = Math.random(), diff = Math.min(1, this.elapsed / 90), pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
    this.rowCount++;
    if (this.rowCount <= 2) { const l = Math.floor(Math.random() * 3); this.place(pick(TALL), l, z); this.line((l + 1) % 3, z - 9, 5); return; }
    if (r < 0.34) {                                              // single obstacle, coins in another lane
      const l = Math.floor(Math.random() * 3), k = pick<ObstacleKind>([...LOW, ...TALL, ...OVER]); this.place(k, l, z); this.line((l + 1 + Math.floor(Math.random() * 2)) % 3, z - 8, 6);
    } else if (r < 0.58 && diff > 0.05) {                         // two lanes blocked
      const free = Math.floor(Math.random() * 3); const blockers = this.speed < 22 ? TALL.concat(LOW) : TALL; for (let l = 0; l < 3; l++) if (l !== free) this.place(pick(blockers), l, z); this.line(free, z - 3, 7);
    } else if (r < 0.76) {                                       // full-width low row: jump, coins on an arc
      for (let l = 0; l < 3; l++) this.place(pick(LOW), l, z); this.line(Math.floor(Math.random() * 3), z, 5, 1.2, true);
    } else if (r < 0.9) {                                        // full-width overhead row: slide
      const k = pick(OVER); for (let l = 0; l < 3; l++) this.place(k, l, z); this.line(Math.floor(Math.random() * 3), z - 6, 6, 0.6);
    } else {                                                     // zig-zag pair (needs a quick lane change)
      const l = Math.floor(Math.random() * 3), l2 = l === 1 ? (Math.random() < 0.5 ? 0 : 2) : 1; this.place(pick(TALL), l, z); this.place(pick(TALL), l2, z - Math.max(16, this.speed * 0.8)); this.line(3 - l - l2, z - 8, 5);
    }
  }

  /* ----------------------------------- loop ----------------------------------- */
  private loop = (t: number) => {
    if (this.dead) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = this.last ? Math.min(0.05, (t - this.last) / 1000) : 0.016; this.last = t;
    this.frames++; this.fpsT += dt; if (this.fpsT >= 1) { this.fps = this.frames / this.fpsT; this.frames = 0; this.fpsT = 0; }
    if (this.state !== 'paused') this.update(dt);
    this.R.render(this.scene, this.cam);
  };

  private update(dt: number) {
    const playing = this.state === 'playing', ready = this.state === 'ready' || this.state === 'over';
    if (playing) { this.elapsed += dt; this.speed = Math.min(MAX_SPEED, BASE_SPEED + this.elapsed * RAMP) * (1 - this.stumble * 0.18); }
    else if (ready) this.speed += ((this.state === 'over' ? 0 : 7) - this.speed) * Math.min(1, dt * 3);
    const v = this.speed * dt;
    this.stumble = Math.max(0, this.stumble - dt * 1.4); this.invuln = Math.max(0, this.invuln - dt); this.shake = Math.max(0, this.shake - dt);
    if (playing) { this.dist += v; this.chase = Math.max(0, this.chase - dt * 0.05); }

    // world scroll
    for (const c of this.chunks) { c.position.z += v; if (c.position.z > CHUNK * 1.5) c.position.z -= CHUNK * CHUNKS; }
    for (const c of this.clouds) { c.position.z += v * 0.1 + dt * 1.2; if (c.position.z > 20) { c.position.z = -170; c.position.x = (Math.random() - 0.5) * 100; } }
    if (playing) { this.spawnIn -= v; if (this.spawnIn <= 0) { this.spawnRow(); this.spawnIn = Math.max(19, this.speed * 1.0) + Math.random() * 5; } }
    for (const o of this.obstacles) if (o.active) { o.z += v; o.o.group.position.z = o.z; if (o.z > DESPAWN_Z) { o.active = false; o.o.group.visible = false; } }
    for (const c of this.cols) if (c.active) { c.z += v; c.spin += dt * 3.2; c.obj.position.set(LANE_X[c.lane], c.y + Math.sin(c.spin * 1.3) * 0.12, c.z); c.obj.rotation.y = c.spin; if (c.z > DESPAWN_Z) { c.active = false; c.obj.visible = false; } }

    // player physics
    if (playing) {
      const tx = LANE_X[this.lane]; this.px += (tx - this.px) * Math.min(1, dt * 15); this.tilt += ((tx - this.px) * 0.18 - this.tilt) * Math.min(1, dt * 12);
      if (!this.grounded) { this.vy -= GRAVITY * dt; this.py += this.vy * dt; if (this.py <= 0) { this.py = 0; this.vy = 0; this.grounded = true; } }
      if (this.slideT > 0) this.slideT -= dt;
      this.peakPy = Math.max(this.peakPy, this.py);
    }
    const sliding = this.slideT > 0 && this.grounded;
    this.animatePlayer(sliding, playing || ready);
    if (playing) this.collide(sliding);
    this.animateClient(dt);
    this.updateParticles(dt);
    this.updateCamera(dt);
    this.hudT += dt; if (this.hudT > 0.08) { this.hudT = 0; this.emitHud(); }
  }

  private collide(sliding: boolean) {
    const ph = sliding ? SLIDE_H : PLAYER_H, x0 = this.px - 0.42, x1 = this.px + 0.42, y0 = this.py, y1 = this.py + ph, z0 = -0.4, z1 = 0.4;
    for (const c of this.cols) if (c.active) {
      if (Math.abs(c.z) < 0.9 && Math.abs(LANE_X[c.lane] - this.px) < 0.95 && c.y + 0.45 > y0 && c.y - 0.45 < y1) {
        c.active = false; c.obj.visible = false; this.itemsN++; this.bonus += c.kind === 'coin' ? 5 : c.kind === 'gem' ? 15 : c.kind === 'star' ? 25 : 40; sfx.collect(this.itemsN); this.burst(LANE_X[c.lane], c.y, c.z, c.kind === 'gem' ? PAL.lavender : PAL.butter); this.cb.onEvent('collect');
      }
    }
    if (this.invuln > 0) return;
    for (const o of this.obstacles) {
      if (!o.active || o.spent) continue;
      const hw = o.o.w / 2 - 0.12, ox = LANE_X[o.lane], oy0 = o.o.y0, oy1 = o.o.y0 + o.o.h, d = o.o.d / 2;
      if (x1 > ox - hw && x0 < ox + hw && y1 > oy0 + 0.05 && y0 < oy1 - 0.05 && z1 > o.z - d && z0 < o.z + d) { this.hit(o); break; }
    }
  }
  private hit(o: Ob) {
    o.spent = true; this.invuln = 1.3; this.shake = 0.35; this.stumble = 1; this.chase += 0.55; sfx.hit(); this.cb.onEvent('hit');
    this.burst(this.px, 1, 0, '#ff6a4a');
    if (this.chase >= 1) { this.chase = 1; this.setState('over'); sfx.over(); this.cb.onEvent('over'); this.emitHud(true); }
  }
  private burst(x: number, y: number, z: number, color: string) {
    let n = 0; for (const p of this.parts) { if (p.life > 0 || n >= 9) continue; n++; p.life = 0.5; p.m.visible = true; p.m.position.set(x, y, z); (p.m.material as THREE.MeshBasicMaterial).color.set(color); p.vx = (Math.random() - 0.5) * 6; p.vy = Math.random() * 5 + 1; p.vz = (Math.random() - 0.5) * 4; }
  }
  private updateParticles(dt: number) {
    for (const p of this.parts) if (p.life > 0) { p.life -= dt; p.vy -= 14 * dt; p.m.position.x += p.vx * dt; p.m.position.y += p.vy * dt; p.m.position.z += p.vz * dt + this.speed * dt; p.m.scale.setScalar(Math.max(0.1, p.life * 2)); if (p.life <= 0) p.m.visible = false; }
  }

  /* ------------------------------- animation ------------------------------- */
  private animatePlayer(sliding: boolean, running: boolean) {
    const t = performance.now() / 1000, f = Math.max(0.3, this.speed / BASE_SPEED), cyc = t * 10 * f, P = this.player;
    P.group.position.set(this.px, this.py, 0); P.group.rotation.z = -this.tilt * 0.6; P.group.rotation.y = this.tilt * 0.5;
    const flicker = this.invuln > 0 && Math.floor(t * 18) % 2 === 0; P.group.visible = !flicker;
    if (!this.grounded) { P.legL.rotation.x = -0.9; P.legR.rotation.x = 0.5; P.armL.rotation.x = -2.4; P.armR.rotation.x = -2.4; P.body.rotation.x = 0; P.body.position.y = 0; }
    else if (sliding) { P.body.rotation.x = 1.15; P.body.position.y = -0.55; P.legL.rotation.x = -1.0; P.legR.rotation.x = -1.2; P.armL.rotation.x = -2.8; P.armR.rotation.x = -2.6; }
    else { const s = running ? Math.sin(cyc) : 0; P.body.rotation.x = 0.18; P.body.position.y = Math.abs(Math.cos(cyc)) * 0.08; P.legL.rotation.x = s * 0.95; P.legR.rotation.x = -s * 0.95; P.armL.rotation.x = -s * 1.0; P.armR.rotation.x = s * 1.0; }
    if (this.stumble > 0.4) { P.body.rotation.x += Math.sin(t * 40) * 0.15; }
  }
  private animateClient(dt: number) {
    const t = performance.now() / 1000, C = this.client, f = Math.max(0.5, this.speed / BASE_SPEED), cyc = t * 9 * f;
    const z = 3.9 - this.chase * 2.9 + Math.sin(t * 1.7) * 0.15;                                         // gets closer after every hit
    C.group.position.set(this.px * 0.5, Math.abs(Math.cos(cyc)) * 0.18, z); C.group.rotation.y = Math.sin(t * 1.3) * 0.12;
    C.legL.rotation.x = Math.sin(cyc) * 1.1; C.legR.rotation.x = -Math.sin(cyc) * 1.1;
    C.armL.rotation.x = -2.5 + Math.sin(cyc * 1.4) * 0.5; C.armR.rotation.x = -1.6 + Math.sin(cyc * 1.4 + 1.5) * 0.7; C.armL.rotation.z = -0.35 + Math.sin(cyc * 2) * 0.2; C.armR.rotation.z = 0.2;
    C.body.rotation.x = 0.25 + this.chase * 0.25; C.head.rotation.z = Math.sin(cyc * 0.8) * 0.12;
    const tie = C.body.getObjectByName('tie'); if (tie) tie.rotation.x = 0.6 + Math.sin(cyc * 2) * 0.35;
    const mouth = C.head.getObjectByName('mouth'); if (mouth) mouth.scale.y = 0.6 + Math.abs(Math.sin(cyc * 1.6)) * 0.9;
    // speech bubble
    this.bubbleT -= dt; this.nextBubble -= dt;
    if (this.state === 'playing' && this.nextBubble <= 0) { this.bubble.material.map = this.phraseTex[Math.floor(Math.random() * PHRASES.length)]; this.bubble.material.needsUpdate = true; this.bubbleT = 2.2; this.nextBubble = 5 + Math.random() * 3; }
    if (this.state === 'over') { this.bubble.material.map = this.phraseTex[0]; this.bubbleT = 99; }
    this.bubble.visible = this.bubbleT > 0; this.bubble.position.set(C.group.position.x * 0.6, 4.7 + Math.sin(t * 6) * 0.08, z - 0.4);
  }
  private updateCamera(dt: number) {
    const portrait = this.cam.aspect < 0.8, back = portrait ? 12 : 10, up = portrait ? 8.6 : 7.2;
    const tx = this.px * 0.55, sh = this.reduced ? 0 : this.shake * 0.35;
    this.cam.position.x += (tx - this.cam.position.x) * Math.min(1, dt * 6);
    this.cam.position.y += ((up + this.py * 0.35) - this.cam.position.y) * Math.min(1, dt * 8);
    this.cam.position.z = back + (this.speed - BASE_SPEED) * 0.02;
    this.cam.position.x += (Math.random() - 0.5) * sh; const yy = this.cam.position.y + (Math.random() - 0.5) * sh;
    const ly = 0.6 + this.py * 0.4; this.cam.lookAt(this.cam.position.x * 0.4, ly, -7); this.cam.position.y = yy;
    this.sun.position.set(this.px + 9, 18, 8); this.sun.target.position.set(this.px, 0, -4); this.sun.target.updateMatrixWorld();
  }

  private emitHud(force = false) {
    const score = Math.floor(this.dist * 1.2 + this.bonus);
    void force; this.cb.onHud({ score, items: this.itemsN, speed: this.speed, chase: this.chase });
  }
  /** Test/debug helper. */
  snapshot() {
    return { state: this.state, score: Math.floor(this.dist * 1.2 + this.bonus), items: this.itemsN, lane: this.lane, px: this.px, py: this.py, peakPy: this.peakPy, sliding: this.slideT > 0 && this.grounded, chase: this.chase, speed: this.speed, fps: this.fps, dist: this.dist, invuln: this.invuln,
      obstacles: this.obstacles.map((o) => ({ o })).filter(({ o }) => o.active).map(({ o }) => ({ id: o.uid, k: o.kind, lane: o.lane, z: +o.z.toFixed(1), need: o.o.need })), collectibles: this.cols.filter((c) => c.active).length, clientZ: this.client.group.position.z };
  }
  /** Test helper: teleport the next obstacle row right in front of the player. */
  debugSpawn(kind: ObstacleKind, lane: number, z = -10) { return !!this.place(kind, lane, z); }
  debugCollectible(kind: CollectKind, lane: number, z = -8, y = 1) { this.coin(kind, lane, z, y); }
  /** Test helper: stop random spawning (so a scripted scene is deterministic). */
  debugClear() { this.spawnIn = 1e9; for (const o of this.obstacles) { o.active = false; o.o.group.visible = false; } for (const c of this.cols) { c.active = false; c.obj.visible = false; } }
}
