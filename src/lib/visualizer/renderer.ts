import type { Mat3 } from "./homography";

const VS = `#version 300 es
in vec2 p; out vec2 vUv;
void main(){ vUv = vec2(p.x*0.5+0.5, 0.5-p.y*0.5); gl_Position = vec4(p,0.,1.); }`;

const FS = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uPhoto, uMask, uFloor, uShade;
uniform mat3 uH;          // image(0..1) -> floor metres (x across, y depth)
uniform float uTile;      // metres covered by the texture width
uniform float uAspect;    // texture h/w
uniform float uRot;       // radians
uniform float uShadow;    // 0..1
uniform float uSplit;     // 0..1 (x < split shows render)
uniform vec2 uPlank;      // plank/tile width, length (metres)
uniform float uStagger;   // 1 = staggered planks, 0 = grid tiles
uniform float uJoint;     // joint darkness 0..1
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  vec4 photo = texture(uPhoto, vUv);
  float m = smoothstep(0.5, 1.0, texture(uMask, vUv).r); // feather only inward
  if (vUv.x > uSplit || m < 0.003) { o = photo; return; }
  vec3 q = uH * vec3(vUv, 1.0);
  if (q.z <= 0.0) { o = photo; return; }
  vec2 f = q.xy / q.z;
  float c = cos(uRot), s = sin(uRot);
  f = mat2(c, -s, s, c) * f;
  float row = floor(f.x / uPlank.x);
  float off = uStagger * (0.2 + 0.6 * hash(vec2(row, 3.7))) * uPlank.y;
  float col = floor((f.y + off) / uPlank.y);
  vec2 local = vec2(f.x - row * uPlank.x, f.y + off - col * uPlank.y);
  vec2 id = vec2(row, col);
  float h1 = hash(id), h2 = hash(id + 7.13), h3 = hash(id + 19.7);
  vec2 tc, gx, gy;
  if (uStagger > 0.5) {
    // plank: texture X runs along the plank length, random window per plank
    vec2 base = vec2(f.y, f.x) / vec2(uTile, uTile * uAspect);
    tc = vec2(local.y / uTile, local.x / (uTile * uAspect)) + vec2(h1 * 7.0, h2 * 7.0);
    gx = dFdx(base); gy = dFdy(base);
  } else {
    vec2 base = f / uPlank;
    tc = local / uPlank;
    if (h1 > 0.5) tc.x = 1.0 - tc.x;
    if (h2 > 0.5) tc.y = 1.0 - tc.y;
    gx = dFdx(base); gy = dFdy(base);
  }
  vec3 tex = textureGrad(uFloor, tc, gx, gy).rgb * (0.95 + 0.1 * h3);
  // joints between planks/tiles (anti-aliased)
  vec2 aa = fwidth(f) * 1.2 + 0.0015;
  vec2 d = min(local, uPlank - local);
  float jt = min(smoothstep(0.0, aa.x, d.x), smoothstep(0.0, aa.y, d.y));
  tex *= mix(1.0 - uJoint, 1.0, jt);
  float shade = texture(uShade, vUv).r * 2.0;
  vec3 col3 = tex * mix(1.0, shade, uShadow);
  o = vec4(mix(photo.rgb, col3, m), 1.0);
}`;

export class FloorRenderer {
  gl: WebGL2RenderingContext;
  prog: WebGLProgram;
  photo: WebGLTexture; mask: WebGLTexture; floor: WebGLTexture; shade: WebGLTexture;
  aniso: any;
  floorAspect = 1;
  photoW = 1; photoH = 1;

  constructor(public canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2", { preserveDrawingBuffer: true, premultipliedAlpha: false });
    if (!gl) throw new Error("WebGL2 non disponibile su questo dispositivo");
    this.gl = gl;
    const sh = (t: number, src: string) => {
      const s = gl.createShader(t)!; gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader");
      return s;
    };
    const p = gl.createProgram()!;
    gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(p); this.prog = p; gl.useProgram(p);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(p, "p"); gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    this.aniso = gl.getExtension("EXT_texture_filter_anisotropic");
    this.photo = gl.createTexture()!; this.mask = gl.createTexture()!; this.floor = gl.createTexture()!; this.shade = gl.createTexture()!;
  }

  setPhoto(c: HTMLCanvasElement) {
    const gl = this.gl;
    this.canvas.width = c.width; this.canvas.height = c.height;
    this.photoW = c.width; this.photoH = c.height;
    gl.viewport(0, 0, c.width, c.height);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.photo);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  setMask(m: Uint8ClampedArray, w: number, h: number) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.mask);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, w, h, 0, gl.RED, gl.UNSIGNED_BYTE, m);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  setShade(m: Uint8ClampedArray, w: number, h: number) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, this.shade);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, w, h, 0, gl.RED, gl.UNSIGNED_BYTE, m);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  setFloor(img: HTMLImageElement | HTMLCanvasElement, mirror: boolean) {
    const gl = this.gl;
    const w = (img as any).naturalWidth || img.width, h = (img as any).naturalHeight || img.height;
    this.floorAspect = h / w;
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, this.floor);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    const wrap = mirror ? gl.MIRRORED_REPEAT : gl.REPEAT;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    if (this.aniso) gl.texParameterf(gl.TEXTURE_2D, this.aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(16, gl.getParameter(this.aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
  }

  render(o: { H: Mat3; tileM: number; rotDeg: number; shadow: number; split: number; plankM: [number, number]; stagger: boolean; joint?: number }) {
    const gl = this.gl, p = this.prog;
    const u = (n: string) => gl.getUniformLocation(p, n);
    gl.uniform1i(u("uPhoto"), 0); gl.uniform1i(u("uMask"), 1); gl.uniform1i(u("uFloor"), 2); gl.uniform1i(u("uShade"), 3);
    // mat3 column-major: transpose row-major H
    const H = o.H;
    gl.uniformMatrix3fv(u("uH"), false, [H[0], H[3], H[6], H[1], H[4], H[7], H[2], H[5], H[8]]);
    gl.uniform1f(u("uTile"), o.tileM);
    gl.uniform1f(u("uAspect"), this.floorAspect);
    gl.uniform1f(u("uRot"), (o.rotDeg * Math.PI) / 180);
    gl.uniform1f(u("uShadow"), o.shadow);
    gl.uniform1f(u("uSplit"), o.split);
    gl.uniform2f(u("uPlank"), o.plankM[0], o.plankM[1]);
    gl.uniform1f(u("uStagger"), o.stagger ? 1 : 0);
    gl.uniform1f(u("uJoint"), o.joint ?? 0.35);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
