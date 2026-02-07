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
      opacity={0.1}
      roughness={0.05}
      metalness={0.05}
      transmission={0.93}
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
    <lineBasicMaterial color="#9dd4e8" transparent opacity={0.4} />
  </lineSegments>
);

// Circular point texture for smooth sand grains
const useCircleTexture = () => {
  return useMemo(() => {
    const size = 32;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const center = size / 2;
    const radius = size / 2 - 1;
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius);
    gradient.addColorStop(0, "rgba(237,232,224,1)");
    gradient.addColorStop(0.7, "rgba(230,224,214,0.9)");
    gradient.addColorStop(1, "rgba(220,214,204,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fill();
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);
};

// MgO Sand - massive point cloud that fills half the cube like dense white sand
const MgoSand = ({ count = 200000 }: { count?: number }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const texture = useCircleTexture();

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Densely pack in bottom ~48% of cube
      positions[i3] = (Math.random() - 0.5) * (CUBE_SIZE - 0.06);
      positions[i3 + 1] = -HALF + Math.random() * (CUBE_SIZE * 0.48);
      positions[i3 + 2] = (Math.random() - 0.5) * (CUBE_SIZE - 0.06);
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

      // Rotation force — sand shifts like in an hourglass
      vx += rotVY * 12 * z;
      vz -= rotVY * 12 * x;
      vy -= rotVX * 5;

      // Gravity
      vy -= 4.0 * dt;

      // Very light jitter for natural look
      vx += (Math.random() - 0.5) * 0.008;
      vz += (Math.random() - 0.5) * 0.008;

      // Heavy damping for sand-like behavior
      vx *= 0.92;
      vy *= 0.92;
      vz *= 0.92;

      x += vx * dt;
      y += vy * dt;
      z += vz * dt;

      // Cube bounds with slight bounce
      if (x > HALF) { x = HALF; vx *= -0.15; }
      if (x < -HALF) { x = -HALF; vx *= -0.15; }
      if (y < -HALF) { y = -HALF; vy *= -0.08; }
      if (y > HALF) { y = HALF; vy *= -0.2; }
      if (z > HALF) { z = HALF; vz *= -0.15; }
      if (z < -HALF) { z = -HALF; vz *= -0.15; }

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
        map={texture}
        size={0.012}
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
        color="#ede8e0"
        blending={THREE.NormalBlending}
      />
    </points>
  );
};

// Floating dust — very fine particles suspended in air
const MgoDust = ({ count = 150 }: { count?: number }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const texture = useCircleTexture();

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 1.6;
      positions[i3 + 1] = -HALF + Math.random() * CUBE_SIZE;
      positions[i3 + 2] = (Math.random() - 0.5) * 1.6;
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

      vx += rotVY * 16 * z;
      vz -= rotVY * 16 * x;
      vy -= 0.2 * dt;

      vx += (Math.random() - 0.5) * 0.05;
      vy += (Math.random() - 0.5) * 0.03;
      vz += (Math.random() - 0.5) * 0.05;

      vx *= 0.90;
      vy *= 0.94;
      vz *= 0.90;

      x += vx * dt;
      y += vy * dt;
      z += vz * dt;

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
        map={texture}
        size={0.006}
        sizeAttenuation
        transparent
        opacity={0.4}
        depthWrite={false}
        color="#ffffff"
      />
    </points>
  );
};

// Thin short natural fiber segments mixed into the sand
const NaturalFibers = ({ count = 35 }: { count?: number }) => {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  const fiberState = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const angles = new Float32Array(count * 3);
    const angVel = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1.5;
      positions[i * 3 + 1] = -HALF + Math.random() * (CUBE_SIZE * 0.4);
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
      angles[i * 3] = Math.random() * Math.PI;
      angles[i * 3 + 1] = Math.random() * Math.PI * 2;
      angles[i * 3 + 2] = Math.random() * Math.PI;
    }
    return { positions, velocities, angles, angVel };
  }, [count]);

  const fiberGeometries = useMemo(() => {
    return Array.from({ length: count }, () => {
      const len = 0.04 + Math.random() * 0.06;
      const curve = new THREE.LineCurve3(
        new THREE.Vector3(0, -len / 2, 0),
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.015,
          len / 2,
          (Math.random() - 0.5) * 0.015
        )
      );
      return new THREE.TubeGeometry(curve, 2, 0.0015 + Math.random() * 0.001, 3, false);
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

      vx += rotVY * 10 * z;
      vz -= rotVY * 10 * x;
      vy -= rotVX * 3;
      vy -= 3.0 * dt;

      vx += (Math.random() - 0.5) * 0.01;
      vz += (Math.random() - 0.5) * 0.01;

      vx *= 0.93; vy *= 0.93; vz *= 0.93;

      x += vx * dt; y += vy * dt; z += vz * dt;

      if (x > HALF) { x = HALF; vx *= -0.2; }
      if (x < -HALF) { x = -HALF; vx *= -0.2; }
      if (y < -HALF) { y = -HALF; vy *= -0.1; }
      if (y > HALF) { y = HALF; vy *= -0.2; }
      if (z > HALF) { z = HALF; vz *= -0.2; }
      if (z < -HALF) { z = -HALF; vz *= -0.2; }

      p[i * 3] = x; p[i * 3 + 1] = y; p[i * 3 + 2] = z;
      v[i * 3] = vx; v[i * 3 + 1] = vy; v[i * 3 + 2] = vz;

      av[i * 3] += rotVY * 2;
      av[i * 3 + 1] += rotVX * 1.5;
      av[i * 3] *= 0.97; av[i * 3 + 1] *= 0.97;
      a[i * 3] += av[i * 3] * dt;
      a[i * 3 + 1] += av[i * 3 + 1] * dt;

      mesh.position.set(x, y, z);
      mesh.rotation.set(a[i * 3], a[i * 3 + 1], a[i * 3 + 2]);
    }
  });

  const colors = ["#b89545", "#a88430", "#c4a050", "#9a7a35", "#d4b56a"];

  return (
    <group>
      {fiberGeometries.map((geo, i) => (
        <mesh key={i} ref={(el) => { meshRefs.current[i] = el; }} geometry={geo}>
          <meshStandardMaterial color={colors[i % colors.length]} roughness={0.7} metalness={0.05} />
        </mesh>
      ))}
    </group>
  );
};

// Pedestal
const Pedestal = () => (
  <mesh position={[0, -1.35, 0]}>
    <boxGeometry args={[2.4, 0.3, 2.4]} />
    <meshStandardMaterial color="#252220" roughness={0.25} metalness={0.5} />
  </mesh>
);

const GlassCubeScene = () => (
  <>
    <ambientLight intensity={0.5} />
    <directionalLight position={[5, 8, 5]} intensity={1.4} color="#f0f0ff" />
    <directionalLight position={[-3, 4, -2]} intensity={0.6} color="#e0e8f0" />
    <spotLight position={[0, 7, 0]} angle={0.35} penumbra={0.8} intensity={2} color="#ffffff" />
    <pointLight position={[2, 1, 2]} intensity={0.4} color="#87ceeb" />

    <RotatingGroup>
      <GlassCube />
      <GlassEdges />
      <MgoSand count={200000} />
      <MgoDust count={150} />
      <NaturalFibers count={30} />
      <Pedestal />
    </RotatingGroup>
  </>
);

export default GlassCubeScene;
