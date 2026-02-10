import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import CubeBranding from "./CubeBranding";

const CUBE_SIZE = 2.0;
const HALF = CUBE_SIZE / 2 - 0.05;

// Shared rotation state for physics
export const rotationState = {
  velocityY: 0,
  velocityX: 0,
};

// Rotating group
// Fiber-specific inner bounds — must account for geometry length (~0.35 radius)
const FIBER_MARGIN = 0.45;
const FIBER_HALF = HALF - FIBER_MARGIN;

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

// Glass cube — rendered AFTER internal contents via renderOrder
const GlassCube = () => (
  <mesh renderOrder={10}>
    <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} />
    <meshPhysicalMaterial
      transparent
      opacity={0.08}
      roughness={0.05}
      metalness={0.05}
      transmission={0.92}
      thickness={0.3}
      clearcoat={1}
      clearcoatRoughness={0.05}
      ior={1.45}
      color="#c8e4f0"
      side={THREE.DoubleSide}
      depthWrite={false}
    />
  </mesh>
);

const GlassEdges = () => (
  <lineSegments renderOrder={11}>
    <edgesGeometry args={[new THREE.BoxGeometry(CUBE_SIZE + 0.02, CUBE_SIZE + 0.02, CUBE_SIZE + 0.02)]} />
    <lineBasicMaterial color="#9dd4e8" transparent opacity={0.5} />
  </lineSegments>
);

// ============================================================
// Solid powder body — an opaque white mesh filling the bottom
// ~42% of the cube. This is the BULK of the visible powder.
// Uses a plane with displaced vertices for undulating surface.
// ============================================================
const PowderBody = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const fillHeight = CUBE_SIZE * 0.42;
  const bodyWidth = CUBE_SIZE - 0.08;

  // Create a custom geometry: box with an undulating top face
  const geometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(bodyWidth, fillHeight, bodyWidth, 24, 1, 24);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      // Only displace top vertices
      if (y > fillHeight / 2 - 0.01) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const wave = Math.sin(x * 3.5) * 0.055
          + Math.cos(z * 4.0) * 0.045
          + Math.sin(x * 1.5 + z * 2.0) * 0.035
          + Math.sin(x * 6 + z * 3) * 0.015;
        pos.setY(i, y + wave);
      }
    }
    geo.computeVertexNormals();
    return geo;
  }, [fillHeight, bodyWidth]);

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={[0, -HALF + fillHeight / 2, 0]}
      renderOrder={1}
    >
      <meshStandardMaterial
        color="#f0ebe4"
        roughness={0.95}
        metalness={0.0}
      />
    </mesh>
  );
};

// ============================================================
// Surface grain particles — small spheres on the powder surface
// to give it a granular/sandy texture. Uses InstancedMesh.
// ============================================================
const SurfaceGrains = ({ count = 800 }: { count?: number }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const fillHeight = CUBE_SIZE * 0.42;

  const state = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * (CUBE_SIZE - 0.2);
      const z = (Math.random() - 0.5) * (CUBE_SIZE - 0.2);
      const wave = Math.sin(x * 3.5) * 0.055 + Math.cos(z * 4.0) * 0.045 + Math.sin(x * 1.5 + z * 2.0) * 0.035;
      const surfaceY = -HALF + fillHeight + wave;
      positions[i * 3] = x;
      positions[i * 3 + 1] = surfaceY + Math.random() * 0.15;
      positions[i * 3 + 2] = z;
      // Much larger spheres so they're visible
      scales[i] = 0.025 + Math.random() * 0.025;
    }
    return { positions, velocities, scales };
  }, [count, fillHeight]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const dt = Math.min(delta, 0.04);
    const { positions: p, velocities: v, scales: s } = state;
    const rotVY = rotationState.velocityY;
    const rotVX = rotationState.velocityX;
    // Tight inner bound so spheres never poke through glass
    const WALL = HALF - 0.08;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      let x = p[i3], y = p[i3 + 1], z = p[i3 + 2];
      let vx = v[i3], vy = v[i3 + 1], vz = v[i3 + 2];

      // Strong random impulses for chaotic, non-circular movement
      vx += (Math.random() - 0.5) * 0.15;
      vy += (Math.random() - 0.5) * 0.04;
      vz += (Math.random() - 0.5) * 0.15;
      // Mild reaction to rotation (not circular)
      vx += rotVY * 4 * (Math.random() - 0.3);
      vz -= rotVY * 4 * (Math.random() - 0.3);
      vy -= rotVX * 2;
      // Gravity
      vy -= 3.0 * dt;

      vx *= 0.88; vy *= 0.88; vz *= 0.88;
      x += vx * dt; y += vy * dt; z += vz * dt;

      // Collision with powder surface — pearls stay ON TOP
      const surfaceWave = Math.sin(x * 3.5) * 0.055 + Math.cos(z * 4.0) * 0.045 + Math.sin(x * 1.5 + z * 2.0) * 0.035;
      const powderSurfaceY = -HALF + fillHeight + surfaceWave;
      if (y < powderSurfaceY) { y = powderSurfaceY; vy *= -0.05; vy = Math.max(vy, 0); }

      // Wall collisions — tight bounds
      if (x > WALL) { x = WALL; vx *= -0.4; }
      if (x < -WALL) { x = -WALL; vx *= -0.4; }
      if (y > WALL) { y = WALL; vy *= -0.4; }
      if (z > WALL) { z = WALL; vz *= -0.4; }
      if (z < -WALL) { z = -WALL; vz *= -0.4; }

      p[i3] = x; p[i3 + 1] = y; p[i3 + 2] = z;
      v[i3] = vx; v[i3 + 1] = vy; v[i3 + 2] = vz;

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(s[i]);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} renderOrder={2}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial color="#ffffff" roughness={0.4} metalness={0.1} />
    </instancedMesh>
  );
};

// ============================================================
// Loose powder particles — these ones have physics and shift
// when the cube rotates, creating the hourglass/sand effect.
// Sits on top of the solid body.
// ============================================================
const LoosePowder = ({ count = 4000 }: { count?: number }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const fillHeight = CUBE_SIZE * 0.42;

  const state = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * (CUBE_SIZE - 0.1);
      const z = (Math.random() - 0.5) * (CUBE_SIZE - 0.1);
      const wave = Math.sin(x * 3.5) * 0.055 + Math.cos(z * 4.0) * 0.045 + Math.sin(x * 1.5 + z * 2.0) * 0.035;
      const surfaceY = -HALF + fillHeight + wave;
      positions[i * 3] = x;
      positions[i * 3 + 1] = surfaceY + Math.random() * 0.12;
      positions[i * 3 + 2] = z;
      scales[i] = 0.006 + Math.random() * 0.01;
    }
    return { positions, velocities, scales };
  }, [count, fillHeight]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const dt = Math.min(delta, 0.04);
    const { positions: p, velocities: v, scales: s } = state;
    const rotVY = rotationState.velocityY;
    const rotVX = rotationState.velocityX;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      let x = p[i3], y = p[i3 + 1], z = p[i3 + 2];
      let vx = v[i3], vy = v[i3 + 1], vz = v[i3 + 2];

      vx += rotVY * 10 * z;
      vz -= rotVY * 10 * x;
      vy -= rotVX * 4;
      vy -= 4.0 * dt;

      vx += (Math.random() - 0.5) * 0.01;
      vz += (Math.random() - 0.5) * 0.01;

      vx *= 0.91; vy *= 0.91; vz *= 0.91;

      x += vx * dt; y += vy * dt; z += vz * dt;

      if (x > HALF) { x = HALF; vx *= -0.15; }
      if (x < -HALF) { x = -HALF; vx *= -0.15; }
      if (y < -HALF) { y = -HALF; vy *= -0.06; }
      if (y > HALF) { y = HALF; vy *= -0.2; }
      if (z > HALF) { z = HALF; vz *= -0.15; }
      if (z < -HALF) { z = -HALF; vz *= -0.15; }

      p[i3] = x; p[i3 + 1] = y; p[i3 + 2] = z;
      v[i3] = vx; v[i3 + 1] = vy; v[i3 + 2] = vz;

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(s[i]);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} renderOrder={3}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshStandardMaterial color="#ede8e0" roughness={0.9} metalness={0.02} />
    </instancedMesh>
  );
};

// ============================================================
// Floating dust — very fine particles in the air
// ============================================================
const MgoDust = ({ count = 150 }: { count?: number }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const state = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1.6;
      positions[i * 3 + 1] = -HALF + CUBE_SIZE * 0.35 + Math.random() * CUBE_SIZE * 0.6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.6;
      scales[i] = 0.003 + Math.random() * 0.005;
    }
    return { positions, velocities, scales };
  }, [count]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const dt = Math.min(delta, 0.04);
    const { positions: p, velocities: v, scales: s } = state;
    const rotVY = rotationState.velocityY;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      let x = p[i3], y = p[i3 + 1], z = p[i3 + 2];
      let vx = v[i3], vy = v[i3 + 1], vz = v[i3 + 2];

      vx += rotVY * 14 * z;
      vz -= rotVY * 14 * x;
      vy -= 0.2 * dt;
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

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(s[i]);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} renderOrder={4}>
      <sphereGeometry args={[1, 3, 3]} />
      <meshStandardMaterial color="#ffffff" transparent opacity={0.45} roughness={0.8} />
    </instancedMesh>
  );
};

// ============================================================
// Natural fibers — long curved tangled strands
// ============================================================
const NaturalFibers = ({ count = 90 }: { count?: number }) => {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const fillHeight = CUBE_SIZE * 0.42;
  const powderTop = -HALF + fillHeight;

  const fiberState = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const angles = new Float32Array(count * 3);
    const angVel = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * (CUBE_SIZE - 0.5);
      // Most fibers sit ON TOP of the powder surface
      const layerRoll = Math.random();
      if (layerRoll < 0.15) {
        positions[i * 3 + 1] = powderTop - 0.02 + Math.random() * 0.08;
      } else if (layerRoll < 0.6) {
        positions[i * 3 + 1] = powderTop + Math.random() * 0.15;
      } else {
        positions[i * 3 + 1] = powderTop + 0.05 + Math.random() * 0.2;
      }
      positions[i * 3 + 2] = (Math.random() - 0.5) * (CUBE_SIZE - 0.5);
      angles[i * 3] = Math.random() * Math.PI;
      angles[i * 3 + 1] = Math.random() * Math.PI * 2;
      angles[i * 3 + 2] = Math.random() * Math.PI;
    }
    return { positions, velocities, angles, angVel };
  }, [count, fillHeight, powderTop]);

  const fiberGeometries = useMemo(() => {
    return Array.from({ length: count }, () => {
      const numPoints = 5 + Math.floor(Math.random() * 5);
      // Much LONGER fibers — 0.25 to 0.7 total length
      const totalLen = 0.15 + Math.random() * 0.25;
      const points: THREE.Vector3[] = [];
      let cx = 0, cy = 0, cz = 0;
      for (let j = 0; j < numPoints; j++) {
        points.push(new THREE.Vector3(cx, cy, cz));
        const segLen = totalLen / (numPoints - 1);
        const theta = Math.random() * Math.PI * 2;
        // More horizontal spread to look like tangled shavings
        const phi = Math.random() * Math.PI * 0.4 + Math.PI * 0.3;
        cx += Math.sin(phi) * Math.cos(theta) * segLen;
        cy += Math.sin(phi) * Math.sin(theta) * segLen * 0.3;
        cz += Math.cos(phi) * segLen;
      }
      const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
      // MUCH THICKER fibers — 10x thicker than before (0.008 to 0.018)
      const thickness = 0.008 + Math.random() * 0.01;
      return new THREE.TubeGeometry(curve, 16, thickness, 6, false);
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

      // Collision with powder surface — fibers must stay ON TOP
      const surfaceWave = Math.sin(x * 3.5) * 0.055
        + Math.cos(z * 4.0) * 0.045
        + Math.sin(x * 1.5 + z * 2.0) * 0.035
        + Math.sin(x * 6 + z * 3) * 0.015;
      const powderSurfaceY = -HALF + fillHeight + surfaceWave;
      if (y < powderSurfaceY) { y = powderSurfaceY; vy *= -0.05; vy = Math.max(vy, 0); }

      if (x > FIBER_HALF) { x = FIBER_HALF; vx *= -0.3; }
      if (x < -FIBER_HALF) { x = -FIBER_HALF; vx *= -0.3; }
      if (y > FIBER_HALF) { y = FIBER_HALF; vy *= -0.3; }
      if (z > FIBER_HALF) { z = FIBER_HALF; vz *= -0.3; }
      if (z < -FIBER_HALF) { z = -FIBER_HALF; vz *= -0.3; }

      p[i * 3] = x; p[i * 3 + 1] = y; p[i * 3 + 2] = z;
      v[i * 3] = vx; v[i * 3 + 1] = vy; v[i * 3 + 2] = vz;

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

  // Natural wood/plant fiber colors — golden, amber, straw tones
  const colors = ["#c4a050", "#b89545", "#a88430", "#d4b56a", "#9a7a35", "#cba855", "#ae8e3d", "#c9a84c", "#8b7028"];

  return (
    <group>
      {fiberGeometries.map((geo, i) => (
        <mesh key={i} ref={(el) => { meshRefs.current[i] = el; }} geometry={geo} renderOrder={5}>
          <meshStandardMaterial color={colors[i % colors.length]} roughness={0.7} metalness={0.02} />
        </mesh>
      ))}
    </group>
  );
};

// Pedestal — positioned directly below the cube
const Pedestal = () => (
  <mesh position={[0, -1.25, 0]}>
    <boxGeometry args={[2.4, 0.25, 2.4]} />
    <meshStandardMaterial color="#1a1816" roughness={0.2} metalness={0.6} />
  </mesh>
);

const GlassCubeScene = () => (
  <>
    <ambientLight intensity={0.5} />
    <directionalLight position={[5, 8, 5]} intensity={1.3} color="#f0f0ff" />
    <directionalLight position={[-3, 4, -2]} intensity={0.5} color="#e0e8f0" />
    <spotLight position={[0, 6, 0]} angle={0.4} penumbra={0.8} intensity={2.5} color="#ffffff" />
    <pointLight position={[2, 1, 2]} intensity={0.3} color="#87ceeb" />

    <RotatingGroup>
      {/* Internal contents rendered first */}
      <PowderBody />
      <SurfaceGrains count={3000} />
      <LoosePowder count={4000} />
      <MgoDust count={150} />
      <NaturalFibers count={90} />
      {/* Glass rendered last so contents show through */}
      <GlassCube />
      <GlassEdges />
      {/* Branding decals on two opposite faces */}
      <CubeBranding />
      <Pedestal />
    </RotatingGroup>
  </>
);

export default GlassCubeScene;
