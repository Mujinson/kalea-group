import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// The glass cube shell
const GlassCube = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
      meshRef.current.rotation.x = Math.sin(Date.now() * 0.0003) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2.4, 2.4, 2.4]} />
      <meshPhysicalMaterial
        transparent
        opacity={0.15}
        roughness={0.05}
        metalness={0.1}
        transmission={0.9}
        thickness={0.5}
        envMapIntensity={1.5}
        clearcoat={1}
        clearcoatRoughness={0.05}
        ior={1.5}
        color="#d4ecf7"
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// Glass edges for the cube wireframe look
const GlassEdges = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
      groupRef.current.rotation.x = Math.sin(Date.now() * 0.0003) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(2.42, 2.42, 2.42)]} />
        <lineBasicMaterial color="#8ec8e0" transparent opacity={0.6} />
      </lineSegments>
    </group>
  );
};

// White mineral MgO base at the bottom of the cube
const MineralBase = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
      meshRef.current.rotation.x = Math.sin(Date.now() * 0.0003) * 0.1;
    }
  });

  // Create a wavy surface using a custom geometry
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(2.2, 2.2, 32, 32);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getY(i);
      const height = 
        Math.sin(x * 2.5) * 0.12 + 
        Math.cos(z * 3) * 0.08 + 
        Math.sin(x * z * 1.5) * 0.06;
      pos.setZ(i, height);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group>
      <mesh ref={meshRef} position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <primitive object={geometry} />
        <meshPhysicalMaterial
          color="#f5f0eb"
          roughness={0.7}
          metalness={0.05}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
};

// Golden fiber strands inside the cube
const Fibers = ({ count = 40 }: { count?: number }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
      groupRef.current.rotation.x = Math.sin(Date.now() * 0.0003) * 0.1;
    }
  });

  const fibers = useMemo(() => {
    const result: THREE.BufferGeometry[] = [];
    for (let i = 0; i < count; i++) {
      const points: THREE.Vector3[] = [];
      const startX = (Math.random() - 0.5) * 1.8;
      const startY = -0.3 + Math.random() * 0.8;
      const startZ = (Math.random() - 0.5) * 1.8;
      
      const segments = 6 + Math.floor(Math.random() * 6);
      for (let j = 0; j <= segments; j++) {
        const t = j / segments;
        points.push(new THREE.Vector3(
          startX + Math.sin(t * Math.PI * 2 + i) * 0.3,
          startY + t * 0.5,
          startZ + Math.cos(t * Math.PI * 1.5 + i * 0.7) * 0.3
        ));
      }
      
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 12, 0.008 + Math.random() * 0.006, 4, false);
      result.push(tubeGeo);
    }
    return result;
  }, [count]);

  return (
    <group ref={groupRef}>
      {fibers.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshPhysicalMaterial
            color={i % 3 === 0 ? "#c4a35a" : i % 3 === 1 ? "#d4b06a" : "#b89545"}
            roughness={0.4}
            metalness={0.2}
            transparent
            opacity={0.7 + Math.random() * 0.3}
          />
        </mesh>
      ))}
    </group>
  );
};

// Floating particles (mineral dust)
const Particles = ({ count = 80 }: { count?: number }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);

  const { positions, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 2;
      pos[i * 3 + 1] = -0.2 + Math.random() * 1.2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2;
      sz[i] = 0.02 + Math.random() * 0.03;
    }
    return { positions: pos, sizes: sz };
  }, [count]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
      groupRef.current.rotation.x = Math.sin(Date.now() * 0.0003) * 0.1;
    }
    if (pointsRef.current) {
      const pos = pointsRef.current.geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        const y = pos.getY(i);
        pos.setY(i, y + Math.sin(Date.now() * 0.001 + i) * 0.0003);
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
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
          size={0.025}
          color="#ffffff"
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>
    </group>
  );
};

// Pedestal base
const Pedestal = () => {
  return (
    <mesh position={[0, -1.65, 0]}>
      <boxGeometry args={[2.8, 0.4, 2.8]} />
      <meshStandardMaterial
        color="#2a2722"
        roughness={0.3}
        metalness={0.4}
      />
    </mesh>
  );
};

const GlassCubeScene = () => {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#f0f0ff" />
      <directionalLight position={[-3, 4, -2]} intensity={0.5} color="#e0e8f0" />
      <spotLight
        position={[0, 6, 0]}
        angle={0.4}
        penumbra={0.8}
        intensity={1.5}
        color="#ffffff"
        castShadow
      />
      <pointLight position={[2, 2, 2]} intensity={0.3} color="#87ceeb" />
      <pointLight position={[-2, 1, -2]} intensity={0.2} color="#b0c4de" />

      {/* Scene elements */}
      <group position={[0, 0.2, 0]}>
        <GlassCube />
        <GlassEdges />
        <MineralBase />
        <Fibers count={35} />
        <Particles count={60} />
        <Pedestal />
      </group>
    </>
  );
};

export default GlassCubeScene;
