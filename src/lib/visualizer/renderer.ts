import type { Mat3 } from "./homography";

const VS = `#version 300 es
in vec2 p; out vec2 vUv;
void main(){ vUv = vec2(p.x*0.5+0.5, 0.5-p.y*0.5); gl_Position = vec4(p,0.,1.); }`;

const FS = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uPhoto, uMask, uFloor;
uniform mat3 uH;          // image(0..1) -> floor metres
uniform float uTile;      // texture repeat size in metres
uniform float uAspect;    // texture h/w
uniform float uRot;       // radians
uniform float uShadow;    // 0..1
uniform float uSplit;     // 0..1 (x < split shows render)
uniform float uLod;
void main(){
  vec4 photo = texture(uPhoto, vUv);
  float m = texture(uMask, vUv).r;
  if (vUv.x > uSplit || m < 0.003) { o = photo; return; }
  vec3 q = uH * vec3(vUv, 1.0);
  vec2 f = q.xy / q.z;
  float c = cos(uRot), s = sin(uRot);
  f = mat2(c, -s, s, c) * f;
  vec2 tc = vec2(f.x / uTile, f.y / (uTile * uAspect));
  vec3 tex = texture(uFloor, tc).rgb;
  float L = dot(photo.rgb, vec3(0.2126, 0.7152, 0.0722));
  float Lb = dot(textureLod(uPhoto, vUv, uLod).rgb, vec3(0.2126, 0.7152, 0.0722));
  float ratio = clamp(L / max(Lb, 0.02), 0.4, 1.6);
  vec3 col = tex * mix(1.0, ratio, uShadow);
  o = vec4(mix(photo.rgb, col, m), 1.0);
}`;

export class FloorRenderer {
  gl: WebGL2RenderingContext;
  prog: WebGLProgram;
  photo: WebGLTexture; mask: WebGLTexture; floor: WebGLTexture;
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
    this.photo = gl.createTexture()!; this.mask = gl.createTexture()!; this.floor = gl.createTexture()!;
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

  render(o: { H: Mat3; tileM: number; rotDeg: number; shadow: number; split: number }) {
    const gl = this.gl, p = this.prog;
    const u = (n: string) => gl.getUniformLocation(p, n);
    gl.uniform1i(u("uPhoto"), 0); gl.uniform1i(u("uMask"), 1); gl.uniform1i(u("uFloor"), 2);
    // mat3 column-major: transpose row-major H
    const H = o.H;
    gl.uniformMatrix3fv(u("uH"), false, [H[0], H[3], H[6], H[1], H[4], H[7], H[2], H[5], H[8]]);
    gl.uniform1f(u("uTile"), o.tileM);
    gl.uniform1f(u("uAspect"), this.floorAspect);
    gl.uniform1f(u("uRot"), (o.rotDeg * Math.PI) / 180);
    gl.uniform1f(u("uShadow"), o.shadow);
    gl.uniform1f(u("uSplit"), o.split);
    gl.uniform1f(u("uLod"), Math.log2(Math.max(this.photoW, this.photoH) / 16));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
