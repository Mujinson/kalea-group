import { useRef, useMemo, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const CUBE_SIZE = 2.0;
const HALF = CUBE_SIZE / 2 - 0.05;

// Track rotation velocity for physics
const rotationState = {
  prevY: 0,
  velocityY: 0,
  prevX: 0,
  velocityX: 0,
  userDragging: false,
};

// Single rotating group
const RotatingGroup = ({ children }: { children: React.ReactNode }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      const prevRotY = groupRef.current.rotation.y;
      const prevRotX = groupRef.current.rotation.x;
      
      if (!rotationState.userDragging) {
        groupRef.current.rotation.y += 0.003;
      }
      groupRef.current.rotation.x = Math.sin(Date.now() * 0.00025) * 0.06;

      rotationState.velocityY = groupRef.current.rotation.y - prevRotY;
      rotationState.velocityX = groupRef.current.rotation.x - prevRotX;
      rotationState.prevY = groupRef.current.rotation.y;
      rotationState.prevX = groupRef.current.rotation.x;
    }
  });

  return <group ref={groupRef}>{children}</group>;
};

// Glass cube shell
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
      envMapIntensity={1}
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

// MgO powder particles - react to cube rotation like sand
const MgoPowder = ({ count = 600 }: { count?: number }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Store velocities per particle
  const velocities = useMemo(() => {
    const v = new Float32Array(count * 3);
    return v;
  }, [count]);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Distribute as a powder pile at the bottom
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.85;
      pos[i * 3] = Math.cos(angle) * radius; // x
      pos[i * 3 + 1] = -HALF + Math.random() * 0.5 * Math.random(); // y - concentrated at bottom
      pos[i * 3 + 2] = Math.sin(angle) * radius; // z
    }
    return pos;
  }, [count]);

  const sizes = useMemo(() => {
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      s[i] = 0.01 + Math.random() * 0.025;
    }
    return s;
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position;
    const dt = Math.min(delta, 0.05);
    
    const rotVelY = rotationState.velocityY;
    const rotVelX = rotationState.velocityX;
    
    for (let i = 0; i < count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);
      
      let vx = velocities[i * 3];
      let vy = velocities[i * 3 + 1];
      let vz = velocities[i * 3 + 2];
      
      // Apply rotation force - particles drift opposite to rotation
      const rotForce = 8.0;
      vx += rotVelY * rotForce * z;
      vz -= rotVelY * rotForce * x;
      vy -= rotVelX * rotForce * 2;
      
      // Gravity - settles down
      vy -= 2.5 * dt;
      
      // Slight random brownian motion
      vx += (Math.random() - 0.5) * 0.02;
      vz += (Math.random() - 0.5) * 0.02;
      
      // Damping
      vx *= 0.96;
      vy *= 0.96;
      vz *= 0.96;
      
      // Update position
      x += vx * dt;
      y += vy * dt;
      z += vz * dt;
      
      // Contain within cube bounds with bounce
      if (x > HALF) { x = HALF; vx *= -0.3; }
      if (x < -HALF) { x = -HALF; vx *= -0.3; }
      if (y < -HALF) { y = -HALF; vy *= -0.2; }
      if (y > HALF) { y = HALF; vy *= -0.3; }
      if (z > HALF) { z = HALF; vz *= -0.3; }
      if (z < -HALF) { z = -HALF; vz *= -0.3; }
      
      pos.setXYZ(i, x, y, z);
      velocities[i * 3] = vx;
      velocities[i * 3 + 1] = vy;
      velocities[i * 3 + 2] = vz;
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.022}
        color="#f0ebe4"
        transparent
        opacity={0.85}
        sizeAttenuation
      />
    </points>
  );
};

// Fine dust cloud - even smaller particles for atmosphere
const MgoDust = ({ count = 200 }: { count?: number }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const velocities = useMemo(() => new Float32Array(count * 3), [count]);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 1.6;
      pos[i * 3 + 1] = -HALF + Math.random() * 0.8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.6;
    }
    return pos;
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position;
    const dt = Math.min(delta, 0.05);
    
    const rotVelY = rotationState.velocityY;
    
    for (let i = 0; i < count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);
      
      let vx = velocities[i * 3];
      let vy = velocities[i * 3 + 1];
      let vz = velocities[i * 3 + 2];
      
      // Lighter - floats more with rotation
      vx += rotVelY * 12 * z;
      vz -= rotVelY * 12 * x;
      
      // Very light gravity
      vy -= 0.5 * dt;
      
      // Brownian motion
      vx += (Math.random() - 0.5) * 0.06;
      vy += (Math.random() - 0.5) * 0.03;
      vz += (Math.random() - 0.5) * 0.06;
      
      // Heavy damping for floaty feel
      vx *= 0.93;
      vy *= 0.95;
      vz *= 0.93;
      
      x += vx * dt;
      y += vy * dt;
      z += vz * dt;
      
      if (x > HALF) { x = HALF; vx *= -0.2; }
      if (x < -HALF) { x = -HALF; vx *= -0.2; }
      if (y < -HALF) { y = -HALF; vy *= -0.15; }
      if (y > HALF) { y = HALF; vy *= -0.2; }
      if (z > HALF) { z = HALF; vz *= -0.2; }
      if (z < -HALF) { z = -HALF; vz *= -0.2; }
      
      pos.setXYZ(i, x, y, z);
      velocities[i * 3] = vx;
      velocities[i * 3 + 1] = vy;
      velocities[i * 3 + 2] = vz;
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.012}
        color="#ffffff"
        transparent
        opacity={0.35}
        sizeAttenuation
      />
    </points>
  );
};

// Thin short natural fiber segments mixed in the powder
const NaturalFibers = ({ count = 50 }: { count?: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Each fiber is a short thin line with its own physics
  const fiberData = useMemo(() => {
    const data: {
      positions: Float32Array;
      velocities: Float32Array;
      lengths: number[];
      angles: Float32Array; // rotation angles
      angVel: Float32Array; // angular velocities
    } = {
      positions: new Float32Array(count * 3),
      velocities: new Float32Array(count * 3),
      lengths: [],
      angles: new Float32Array(count * 2),
      angVel: new Float32Array(count * 2),
    };
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.75;
      data.positions[i * 3] = Math.cos(angle) * radius;
      data.positions[i * 3 + 1] = -HALF + Math.random() * 0.4 * Math.random();
      data.positions[i * 3 + 2] = Math.sin(angle) * radius;
      data.lengths.push(0.06 + Math.random() * 0.12); // short fibers
      data.angles[i * 2] = Math.random() * Math.PI;
      data.angles[i * 2 + 1] = Math.random() * Math.PI * 2;
    }
    return data;
  }, [count]);

  // Create tube geometries for each fiber - thin and short
  const fiberGeometries = useMemo(() => {
    return fiberData.lengths.map((len) => {
      const curve = new THREE.LineCurve3(
        new THREE.Vector3(0, -len / 2, 0),
        new THREE.Vector3(0, len / 2, 0)
      );
      return new THREE.TubeGeometry(curve, 3, 0.003 + Math.random() * 0.002, 4, false);
    });
  }, [fiberData.lengths]);

  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const rotVelY = rotationState.velocityY;
    const rotVelX = rotationState.velocityX;
    
    for (let i = 0; i < count; i++) {
      const mesh = meshRefs.current[i];
      if (!mesh) continue;
      
      let x = fiberData.positions[i * 3];
      let y = fiberData.positions[i * 3 + 1];
      let z = fiberData.positions[i * 3 + 2];
      let vx = fiberData.velocities[i * 3];
      let vy = fiberData.velocities[i * 3 + 1];
      let vz = fiberData.velocities[i * 3 + 2];
      
      // Rotation forces
      vx += rotVelY * 6 * z;
      vz -= rotVelY * 6 * x;
      vy -= rotVelX * 3;
      
      // Gravity
      vy -= 2.0 * dt;
      
      // Brownian
      vx += (Math.random() - 0.5) * 0.015;
      vz += (Math.random() - 0.5) * 0.015;
      
      // Damping
      vx *= 0.95;
      vy *= 0.95;
      vz *= 0.95;
      
      x += vx * dt;
      y += vy * dt;
      z += vz * dt;
      
      // Bounds
      if (x > HALF) { x = HALF; vx *= -0.3; }
      if (x < -HALF) { x = -HALF; vx *= -0.3; }
      if (y < -HALF) { y = -HALF; vy *= -0.15; }
      if (y > HALF) { y = HALF; vy *= -0.3; }
      if (z > HALF) { z = HALF; vz *= -0.3; }
      if (z < -HALF) { z = -HALF; vz *= -0.3; }
      
      fiberData.positions[i * 3] = x;
      fiberData.positions[i * 3 + 1] = y;
      fiberData.positions[i * 3 + 2] = z;
      fiberData.velocities[i * 3] = vx;
      fiberData.velocities[i * 3 + 1] = vy;
      fiberData.velocities[i * 3 + 2] = vz;
      
      // Angular velocity from rotation
      fiberData.angVel[i * 2] += rotVelY * 3 + (Math.random() - 0.5) * 0.01;
      fiberData.angVel[i * 2 + 1] += rotVelX * 2;
      fiberData.angVel[i * 2] *= 0.97;
      fiberData.angVel[i * 2 + 1] *= 0.97;
      fiberData.angles[i * 2] += fiberData.angVel[i * 2] * dt;
      fiberData.angles[i * 2 + 1] += fiberData.angVel[i * 2 + 1] * dt;
      
      mesh.position.set(x, y, z);
      mesh.rotation.set(fiberData.angles[i * 2], fiberData.angles[i * 2 + 1], 0);
    }
  });

  const fiberColors = ["#b89545", "#a88430", "#c4a050", "#9a7a35", "#d4b56a"];

  return (
    <group ref={groupRef}>
      {fiberGeometries.map((geo, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el; }}
          geometry={geo}
        >
          <meshStandardMaterial
            color={fiberColors[i % fiberColors.length]}
            roughness={0.7}
            metalness={0.05}
          />
        </mesh>
      ))}
    </group>
  );
};

// Dark pedestal
const Pedestal = () => (
  <mesh position={[0, -1.35, 0]}>
    <boxGeometry args={[2.4, 0.3, 2.4]} />
    <meshStandardMaterial color="#252220" roughness={0.25} metalness={0.5} />
  </mesh>
);

const GlassCubeScene = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1.4} color="#f0f0ff" />
      <directionalLight position={[-3, 4, -2]} intensity={0.6} color="#e0e8f0" />
      <spotLight position={[0, 7, 0]} angle={0.35} penumbra={0.8} intensity={2} color="#ffffff" />
      <pointLight position={[2, 1, 2]} intensity={0.4} color="#87ceeb" />

      <RotatingGroup>
        <GlassCube />
        <GlassEdges />
        <MgoPowder count={500} />
        <MgoDust count={150} />
        <NaturalFibers count={40} />
        <Pedestal />
      </RotatingGroup>
    </>
  );
};

export default GlassCubeScene;
