import { useEffect, useState } from "react";
import * as THREE from "three";
import logoKSrc from "@/assets/logo-kalea-k-cream.png";

const CUBE_SIZE = 2.0;
const HALF = CUBE_SIZE / 2 - 0.05;

/**
 * Loads an image and processes it so that dark pixels become opaque dark-brown
 * and light/white pixels become fully transparent — perfect for glass decals.
 */
const useDarkTransparentTexture = (src: string) => {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imageData.data;

      for (let i = 0; i < d.length; i += 4) {
        const brightness = (d[i] + d[i + 1] + d[i + 2]) / 3;
        // Dark → opaque, Light → transparent
        const alpha = Math.min(255, Math.max(0, (255 - brightness) * 1.6));
        d[i] = 74;      // #4A
        d[i + 1] = 42;  // #2A
        d[i + 2] = 19;  // #13
        d[i + 3] = alpha;
      }

      ctx.putImageData(imageData, 0, 0);
      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      setTexture(tex);
    };
    img.src = src;
  }, [src]);

  return texture;
};

const CubeBranding = () => {
  const kTexture = useDarkTransparentTexture(logoKSrc);
  const qrTexture = useDarkTransparentTexture("/images/qr-kalea.png");

  if (!kTexture || !qrTexture) return null;

  const offset = 0.02;
  // K is portrait-shaped (~2:3 ratio)
  const kW = 0.28;
  const kH = 0.44;
  const qrSize = 0.35;

  const faces = [
    // Front face (z+)
    { pos: [0, 0.25, HALF + offset] as [number, number, number], rot: [0, 0, 0] as [number, number, number] },
    // Back face (z-)
    { pos: [0, 0.25, -(HALF + offset)] as [number, number, number], rot: [0, Math.PI, 0] as [number, number, number] },
  ];

  return (
    <group>
      {faces.map((face, idx) => (
        <group key={idx}>
          {/* K logo — upper half */}
          <mesh position={face.pos} rotation={face.rot} renderOrder={12}>
            <planeGeometry args={[kW, kH]} />
            <meshBasicMaterial
              map={kTexture}
              transparent
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* QR code — lower half */}
          <mesh
            position={[face.pos[0], -0.3, face.pos[2]]}
            rotation={face.rot}
            renderOrder={12}
          >
            <planeGeometry args={[qrSize, qrSize]} />
            <meshBasicMaterial
              map={qrTexture}
              transparent
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export default CubeBranding;
