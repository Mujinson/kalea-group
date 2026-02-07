import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const CUBE_SIZE = 2.0;
const HALF = CUBE_SIZE / 2 - 0.05;

// Shared rotation state for physics
export const rotationState = {
  velocityY: 0,
  velocityX: 0,
};

// Single rotating group for all elements
const RotatingGroup = ({ children }: { children: React.ReactNode }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      const prevY = groupRef.current.rotation.y;
      const prevX = groupRef.current.rotation.x;

      groupRef.current.rotation.y += 0.003;
      groupRef.current.rotation.x = Math.sin(Date.now() * 0.00025) * 0.06;

      rotationState.velocityY = groupRef.current.rotation.y - prevY;
      rotationState.velocityX = groupRef.current.rotation.x - prevX;
    }
  });

  return <group ref={groupRef}>{children}</group>;
};

// Glass cube
const GlassCube = () => (
  <mesh>
    <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} />
    <meshPhysicalMaterial
      transparent
      opacity={0.08}
      roughness={0.05}
      metalness={0.05}
      transmission={0.95}
      thickness={0.3}
      clearcoat={1}
      clearcoatRoughness={0.05}
      ior={1.45}
      color="#c8e4f0"
      side={THREE.DoubleSide}
    />
  </mesh>
);

const GlassEdges = () => (
  <lineSegments>
    <edgesGeometry args={[new THREE.BoxGeometry(CUBE_SIZE + 0.02, CUBE_SIZE + 0.02, CUBE_SIZE + 0.02)]} />
    <lineBasicMaterial color="#9dd4e8" transparent opacity={0.5} />
  </lineSegments>
);

// ============================================================
// Dense white powder mass — solid-looking base filling ~42% of cube
// Uses a large point cloud with overlapping points for solid appearance
// ============================================================
const MgoPowderMass = ({ count = 250000 }: { count?: number }) => {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const fillHeight = CUBE_SIZE * 0.42;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const x = (Math.random() - 0.5) * (CUBE_SIZE - 0.04);
      const z = (Math.random() - 0.5) * (CUBE_SIZE - 0.04);
      // Undulating surface: sine waves create natural hills
      const surfaceWave = Math.sin(x * 3.5) * 0.06 + Math.cos(z * 4.0) * 0.05 + Math.sin(x * 1.5 + z * 2.0) * 0.04;
      const maxY = -HALF + fillHeight + surfaceWave;
      // Concentrate more particles near the surface for density
      const t = Math.random();
      const y = -HALF + t * t * (maxY + HALF - (-HALF)) + (-HALF - (-HALF));
      positions[i3] = x;
      positions[i3 + 1] = -HALF + Math.pow(Math.random(), 0.7) * (fillHeight + surfaceWave);
      positions[i3 + 2] = z;
    }
    return { positions, velocities };
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const dt = Math.min(delta, 0.04);
    const rotVY = rotationState.velocityY;
    const rotVX = rotationState.velocityX;
    const p = positions;
    const v = velocities;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      let x = p[i3], y = p[i3 + 1], z = p[i3 + 2];
      let vx = v[i3], vy = v[i3 + 1], vz = v[i3 + 2];

      // Rotation force — sand shifts like hourglass
      vx += rotVY * 10 * z;
      vz -= rotVY * 10 * x;
      vy -= rotVX * 4;

      // Gravity
      vy -= 5.0 * dt;

      // Tiny jitter
      vx += (Math.random() - 0.5) * 0.005;
      vz += (Math.random() - 0.5) * 0.005;

      // Heavy damping — sand is dense
      vx *= 0.90;
      vy *= 0.90;
      vz *= 0.90;

      x += vx * dt;
      y += vy * dt;
      z += vz * dt;

      // Cube bounds
      if (x > HALF) { x = HALF; vx *= -0.1; }
      if (x < -HALF) { x = -HALF; vx *= -0.1; }
      if (y < -HALF) { y = -HALF; vy *= -0.05; }
      if (y > HALF) { y = HALF; vy *= -0.15; }
      if (z > HALF) { z = HALF; vz *= -0.1; }
      if (z < -HALF) { z = -HALF; vz *= -0.1; }

      p[i3] = x;
      p[i3 + 1] = y;
      p[i3 + 2] = z;
      v[i3] = vx;
      v[i3 + 1] = vy;
      v[i3 + 2] = vz;
    }

    (geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.028}
        sizeAttenuation
        transparent
        opacity={0.92}
        depthWrite={false}
        color="#f0ebe4"
        blending={THREE.NormalBlending}
      />
    </points>
  );
};

// ============================================================
// Floating dust — fine particles suspended in the air
// ============================================================
const MgoDust = ({ count = 200 }: { count?: number }) => {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 1.7;
      positions[i3 + 1] = -HALF + CUBE_SIZE * 0.3 + Math.random() * CUBE_SIZE * 0.65;
      positions[i3 + 2] = (Math.random() - 0.5) * 1.7;
    }
    return { positions, velocities };
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const dt = Math.min(delta, 0.04);
    const rotVY = rotationState.velocityY;
    const p = positions;
    const v = velocities;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      let x = p[i3], y = p[i3 + 1], z = p[i3 + 2];
      let vx = v[i3], vy = v[i3 + 1], vz = v[i3 + 2];

      vx += rotVY * 14 * z;
      vz -= rotVY * 14 * x;
      vy -= 0.15 * dt;

      vx += (Math.random() - 0.5) * 0.04;
      vy += (Math.random() - 0.5) * 0.025;
      vz += (Math.random() - 0.5) * 0.04;

      vx *= 0.91; vy *= 0.95; vz *= 0.91;

      x += vx * dt; y += vy * dt; z += vz * dt;

      if (x > HALF) { x = HALF; vx *= -0.1; }
      if (x < -HALF) { x = -HALF; vx *= -0.1; }
      if (y < -HALF) { y = -HALF; vy *= -0.05; }
      if (y > HALF) { y = HALF; vy *= -0.1; }
      if (z > HALF) { z = HALF; vz *= -0.1; }
      if (z < -HALF) { z = -HALF; vz *= -0.1; }

      p[i3] = x; p[i3 + 1] = y; p[i3 + 2] = z;
      v[i3] = vx; v[i3 + 1] = vy; v[i3 + 2] = vz;
    }

    (geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.008}
        sizeAttenuation
        transparent
        opacity={0.35}
        depthWrite={false}
        color="#ffffff"
      />
    </points>
  );
};

// ============================================================
// Natural fibers — long, curved, tangled strands sitting on
// top of the powder mass, partially embedded
// ============================================================
const NaturalFibers = ({ count = 70 }: { count?: number }) => {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  const fiberState = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const angles = new Float32Array(count * 3);
    const angVel = new Float32Array(count * 3);
    const powderTop = -HALF + CUBE_SIZE * 0.42;

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1.2;
      // Some embedded in powder, some sitting on top, some floating above
      const layerRoll = Math.random();
      if (layerRoll < 0.3) {
        // Embedded in powder
        positions[i * 3 + 1] = -HALF + Math.random() * CUBE_SIZE * 0.35;
      } else if (layerRoll < 0.75) {
        // On the surface / tangled nest
        positions[i * 3 + 1] = powderTop - 0.05 + Math.random() * 0.35;
      } else {
        // Floating higher
        positions[i * 3 + 1] = powderTop + 0.1 + Math.random() * 0.4;
      }
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.2;
      angles[i * 3] = Math.random() * Math.PI;
      angles[i * 3 + 1] = Math.random() * Math.PI * 2;
      angles[i * 3 + 2] = Math.random() * Math.PI;
    }
    return { positions, velocities, angles, angVel };
  }, [count]);

  // Create curved fiber geometries — tangled, natural look
  const fiberGeometries = useMemo(() => {
    return Array.from({ length: count }, () => {
      const numPoints = 4 + Math.floor(Math.random() * 4); // 4-7 control points
      const totalLen = 0.12 + Math.random() * 0.28; // 12-40cm equivalent
      const points: THREE.Vector3[] = [];

      // Generate curvy path with random bends
      let cx = 0, cy = 0, cz = 0;
      for (let j = 0; j < numPoints; j++) {
        points.push(new THREE.Vector3(cx, cy, cz));
        const segLen = totalLen / (numPoints - 1);
        // Random direction for each segment — creates tangled look
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 0.6 + Math.PI * 0.2;
        cx += Math.sin(phi) * Math.cos(theta) * segLen;
        cy += Math.sin(phi) * Math.sin(theta) * segLen * 0.5;
        cz += Math.cos(phi) * segLen;
      }

      const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
      const thickness = 0.0012 + Math.random() * 0.0012;
      return new THREE.TubeGeometry(curve, 12, thickness, 4, false);
    });
  }, [count]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.04);
    const { positions: p, velocities: v, angles: a, angVel: av } = fiberState;
    const rotVY = rotationState.velocityY;
    const rotVX = rotationState.velocityX;

    for (let i = 0; i < count; i++) {
      const mesh = meshRefs.current[i];
      if (!mesh) continue;

      let x = p[i * 3], y = p[i * 3 + 1], z = p[i * 3 + 2];
      let vx = v[i * 3], vy = v[i * 3 + 1], vz = v[i * 3 + 2];

      vx += rotVY * 8 * z;
      vz -= rotVY * 8 * x;
      vy -= rotVX * 3;
      vy -= 2.0 * dt;

      vx += (Math.random() - 0.5) * 0.008;
      vz += (Math.random() - 0.5) * 0.008;

      vx *= 0.93; vy *= 0.93; vz *= 0.93;

      x += vx * dt; y += vy * dt; z += vz * dt;

      if (x > HALF) { x = HALF; vx *= -0.15; }
      if (x < -HALF) { x = -HALF; vx *= -0.15; }
      if (y < -HALF) { y = -HALF; vy *= -0.08; }
      if (y > HALF) { y = HALF; vy *= -0.15; }
      if (z > HALF) { z = HALF; vz *= -0.15; }
      if (z < -HALF) { z = -HALF; vz *= -0.15; }

      p[i * 3] = x; p[i * 3 + 1] = y; p[i * 3 + 2] = z;
      v[i * 3] = vx; v[i * 3 + 1] = vy; v[i * 3 + 2] = vz;

      // Angular momentum from rotation
      av[i * 3] += rotVY * 3;
      av[i * 3 + 1] += rotVX * 2;
      av[i * 3 + 2] += rotVY * 1.5;
      av[i * 3] *= 0.96; av[i * 3 + 1] *= 0.96; av[i * 3 + 2] *= 0.96;
      a[i * 3] += av[i * 3] * dt;
      a[i * 3 + 1] += av[i * 3 + 1] * dt;
      a[i * 3 + 2] += av[i * 3 + 2] * dt;

      mesh.position.set(x, y, z);
      mesh.rotation.set(a[i * 3], a[i * 3 + 1], a[i * 3 + 2]);
    }
  });

  const colors = ["#c4a050", "#b89545", "#a88430", "#d4b56a", "#9a7a35", "#cba855", "#ae8e3d"];

  return (
    <group>
      {fiberGeometries.map((geo, i) => (
        <mesh key={i} ref={(el) => { meshRefs.current[i] = el; }} geometry={geo}>
          <meshStandardMaterial
            color={colors[i % colors.length]}
            roughness={0.65}
            metalness={0.05}
          />
        </mesh>
      ))}
    </group>
  );
};

// Pedestal
const Pedestal = () => (
  <mesh position={[0, -1.35, 0]}>
    <boxGeometry args={[2.4, 0.3, 2.4]} />
    <meshStandardMaterial color="#1a1816" roughness={0.2} metalness={0.6} />
  </mesh>
);

const GlassCubeScene = () => (
  <>
    <ambientLight intensity={0.45} />
    <directionalLight position={[5, 8, 5]} intensity={1.3} color="#f0f0ff" />
    <directionalLight position={[-3, 4, -2]} intensity={0.5} color="#e0e8f0" />
    <spotLight position={[0, 6, 0]} angle={0.4} penumbra={0.8} intensity={2.5} color="#ffffff" />
    <pointLight position={[2, 1, 2]} intensity={0.3} color="#87ceeb" />

    <RotatingGroup>
      <GlassCube />
      <GlassEdges />
      <MgoPowderMass count={250000} />
      <MgoDust count={200} />
      <NaturalFibers count={70} />
      <Pedestal />
    </RotatingGroup>
  </>
);

export default GlassCubeScene;
