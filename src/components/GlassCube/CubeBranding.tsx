import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import logoKSrc from "@/assets/logo-kalea-k-cream.png";

const CUBE_SIZE = 2.0;
const HALF = CUBE_SIZE / 2 - 0.05;

// Vertex shader shared by both decals
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader: dark pixels → opaque dark color, light pixels → transparent
const fragmentShader = `
  uniform sampler2D uTexture;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    vec4 tex = texture2D(uTexture, vUv);
    float brightness = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
    float alpha = clamp((1.0 - brightness) * 2.0, 0.0, 1.0) * tex.a;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

const useShaderTexture = (src: string) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(src, (tex) => {
      tex.needsUpdate = true;
      setTexture(tex);
    });
  }, [src]);

  return texture;
};

const DecalPlane = ({
  texture,
  width,
  height,
  position,
  rotation,
}: {
  texture: THREE.Texture;
  width: number;
  height: number;
  position: [number, number, number];
  rotation: [number, number, number];
}) => {
  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uColor: { value: new THREE.Color(0x1a1a1a) }, // near-black
    }),
    [texture]
  );

  return (
    <mesh position={position} rotation={rotation} renderOrder={12}>
      <planeGeometry args={[width, height]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const CubeBranding = () => {
  const kTexture = useShaderTexture(logoKSrc);
  const qrTexture = useShaderTexture("/images/qr-kalea.png");

  if (!kTexture || !qrTexture) return null;

  const offset = 0.02;
  const kW = 0.28;
  const kH = 0.44;
  const qrSize = 0.35;

  const faces: { pos: [number, number, number]; rot: [number, number, number] }[] = [
    // Front face (z+)
    { pos: [0, 0.25, HALF + offset], rot: [0, 0, 0] },
    // Back face (z-)
    { pos: [0, 0.25, -(HALF + offset)], rot: [0, Math.PI, 0] },
  ];

  return (
    <group>
      {faces.map((face, idx) => (
        <group key={idx}>
          {/* K logo — upper half */}
          <DecalPlane
            texture={kTexture}
            width={kW}
            height={kH}
            position={face.pos}
            rotation={face.rot}
          />
          {/* QR code — lower half */}
          <DecalPlane
            texture={qrTexture}
            width={qrSize}
            height={qrSize}
            position={[face.pos[0], -0.3, face.pos[2]]}
            rotation={face.rot}
          />
        </group>
      ))}
    </group>
  );
};

export default CubeBranding;
