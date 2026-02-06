import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Single rotating group that contains everything
const RotatingGroup = ({ children }: { children: React.ReactNode }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.004;
      groupRef.current.rotation.x = Math.sin(Date.now() * 0.0003) * 0.08;
    }
  });

  return <group ref={groupRef}>{children}</group>;
};

// The glass cube shell
const GlassCube = () => (
  <mesh>
    <boxGeometry args={[2.2, 2.2, 2.2]} />
    <meshPhysicalMaterial
      transparent
      opacity={0.12}
      roughness={0.05}
      metalness={0.05}
      transmission={0.92}
      thickness={0.3}
      envMapIntensity={1.2}
      clearcoat={1}
      clearcoatRoughness={0.05}
      ior={1.45}
      color="#c8e4f0"
      side={THREE.DoubleSide}
    />
  </mesh>
);

// Glass edges
const GlassEdges = () => (
  <lineSegments>
    <edgesGeometry args={[new THREE.BoxGeometry(2.22, 2.22, 2.22)]} />
    <lineBasicMaterial color="#9dd4e8" transparent opacity={0.5} />
  </lineSegments>
);

// Thick white MgO mineral mass at the bottom of the cube
const MineralBase = () => {
  const geometry = useMemo(() => {
    // Create a thick wavy mass using multiple layers
    const shape = new THREE.BoxGeometry(2.0, 0.8, 2.0, 40, 8, 40);
    const pos = shape.attributes.position;
    
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      
      // Only deform the top surface (y > 0)
      if (y > 0.2) {
        const wave = 
          Math.sin(x * 3.0) * 0.15 + 
          Math.cos(z * 2.5) * 0.12 + 
          Math.sin(x * z * 2) * 0.08 +
          Math.sin(x * 4 + z * 3) * 0.05;
        pos.setY(i, y + wave);
      }
    }
    shape.computeVertexNormals();
    return shape;
  }, []);

  return (
    <mesh position={[0, -0.65, 0]}>
      <primitive object={geometry} />
      <meshPhysicalMaterial
        color="#f0ebe4"
        roughness={0.85}
        metalness={0.02}
        clearcoat={0.2}
        clearcoatRoughness={0.4}
      />
    </mesh>
  );
};

// Secondary mineral layer (slightly transparent frost)
const MineralFrost = () => {
  const geometry = useMemo(() => {
    const shape = new THREE.BoxGeometry(2.05, 0.5, 2.05, 30, 6, 30);
    const pos = shape.attributes.position;
    
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      
      if (y > 0.1) {
        const wave = 
          Math.cos(x * 2.8 + 1) * 0.1 + 
          Math.sin(z * 3.2) * 0.08 +
          Math.sin((x + z) * 2) * 0.06;
        pos.setY(i, y + wave + 0.15);
      }
    }
    shape.computeVertexNormals();
    return shape;
  }, []);

  return (
    <mesh position={[0, -0.45, 0]}>
      <primitive object={geometry} />
      <meshPhysicalMaterial
        color="#ffffff"
        roughness={0.6}
        metalness={0.0}
        transparent
        opacity={0.5}
        clearcoat={0.3}
      />
    </mesh>
  );
};

// Thick visible wood/natural fiber strands
const Fibers = ({ count = 30 }: { count?: number }) => {
  const fibers = useMemo(() => {
    const result: { geo: THREE.BufferGeometry; colorIndex: number }[] = [];
    
    for (let i = 0; i < count; i++) {
      const points: THREE.Vector3[] = [];
      // Start from within the mineral base, extend upward
      const startX = (Math.random() - 0.5) * 1.6;
      const startY = -0.8 + Math.random() * 0.4;
      const startZ = (Math.random() - 0.5) * 1.6;
      
      const segments = 8 + Math.floor(Math.random() * 8);
      const maxHeight = 0.4 + Math.random() * 1.0;
      
      for (let j = 0; j <= segments; j++) {
        const t = j / segments;
        points.push(new THREE.Vector3(
          startX + Math.sin(t * Math.PI * 2.5 + i * 0.8) * (0.15 + t * 0.2),
          startY + t * maxHeight,
          startZ + Math.cos(t * Math.PI * 2 + i * 0.5) * (0.15 + t * 0.15)
        ));
      }
      
      const curve = new THREE.CatmullRomCurve3(points);
      // Thicker tubes for visibility
      const radius = 0.012 + Math.random() * 0.01;
      const tubeGeo = new THREE.TubeGeometry(curve, 16, radius, 6, false);
      result.push({ geo: tubeGeo, colorIndex: i % 4 });
    }
    return result;
  }, [count]);

  const fiberColors = ["#c4a35a", "#d4b06a", "#a88940", "#bfa05c"];

  return (
    <group>
      {fibers.map((fiber, i) => (
        <mesh key={i} geometry={fiber.geo}>
          <meshPhysicalMaterial
            color={fiberColors[fiber.colorIndex]}
            roughness={0.5}
            metalness={0.15}
            clearcoat={0.3}
          />
        </mesh>
      ))}
    </group>
  );
};

// Floating mineral particles / dust
const Particles = ({ count = 50 }: { count?: number }) => {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 1.8;
      pos[i * 3 + 1] = -0.3 + Math.random() * 1.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
    }
    return pos;
  }, [count]);

  useFrame(() => {
    if (pointsRef.current) {
      const pos = pointsRef.current.geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        const y = pos.getY(i);
        pos.setY(i, y + Math.sin(Date.now() * 0.0008 + i * 0.5) * 0.0004);
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#ffffff"
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
};

// Dark pedestal
const Pedestal = () => (
  <mesh position={[0, -1.45, 0]}>
    <boxGeometry args={[2.6, 0.35, 2.6]} />
    <meshStandardMaterial
      color="#252220"
      roughness={0.25}
      metalness={0.5}
    />
  </mesh>
);

const GlassCubeScene = () => {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1.4} color="#f0f0ff" />
      <directionalLight position={[-3, 4, -2]} intensity={0.6} color="#e0e8f0" />
      <spotLight
        position={[0, 7, 0]}
        angle={0.35}
        penumbra={0.8}
        intensity={2}
        color="#ffffff"
        castShadow
      />
      <pointLight position={[2, 1, 2]} intensity={0.4} color="#87ceeb" />
      <pointLight position={[-2, 0.5, -2]} intensity={0.3} color="#b0c4de" />

      {/* All scene elements in a single rotating group */}
      <RotatingGroup>
        <GlassCube />
        <GlassEdges />
        <MineralBase />
        <MineralFrost />
        <Fibers count={30} />
        <Particles count={50} />
        <Pedestal />
      </RotatingGroup>
    </>
  );
};

export default GlassCubeScene;
