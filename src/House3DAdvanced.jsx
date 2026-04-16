import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Box,
  Sphere,
  Html,
  Environment,
  ContactShadows,
} from '@react-three/drei';
import * as THREE from 'three';

// ====== TREES & LANDSCAPING ======

function DeciduousTree({ position, scale = 1 }) {
  const leaves = useMemo(() => [
    { p: [0, 1.7, 0], r: 0.85, c: '#2e7d32' },
    { p: [-0.45, 1.85, 0.25], r: 0.55, c: '#388e3c' },
    { p: [0.4, 1.7, -0.3], r: 0.5, c: '#43a047' },
    { p: [0.1, 2.3, -0.15], r: 0.45, c: '#2e7d32' },
    { p: [-0.3, 1.5, -0.4], r: 0.4, c: '#388e3c' },
  ], []);
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.22, 1.2, 8]} />
        <meshStandardMaterial color="#5d4037" roughness={0.95} />
      </mesh>
      {leaves.map((l, i) => (
        <mesh key={i} position={l.p} castShadow>
          <sphereGeometry args={[l.r, 14, 12]} />
          <meshStandardMaterial color={l.c} roughness={0.9} />
        </mesh>
      ))}
      {/* Mulch ring */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.65, 20]} />
        <meshStandardMaterial color="#4e342e" roughness={1} />
      </mesh>
    </group>
  );
}

function PineTree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.18, 0.8, 8]} />
        <meshStandardMaterial color="#4e342e" roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow>
        <coneGeometry args={[0.85, 1.3, 10]} />
        <meshStandardMaterial color="#1b5e20" roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.9, 0]} castShadow>
        <coneGeometry args={[0.65, 1.1, 10]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.95} />
      </mesh>
      <mesh position={[0, 2.6, 0]} castShadow>
        <coneGeometry args={[0.45, 0.9, 10]} />
        <meshStandardMaterial color="#388e3c" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.55, 20]} />
        <meshStandardMaterial color="#4e342e" roughness={1} />
      </mesh>
    </group>
  );
}

function Bush({ position, scale = 1, color = '#2e7d32' }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow>
        <sphereGeometry args={[0.4, 14, 12]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0.28, 0, 0.15]} castShadow>
        <sphereGeometry args={[0.3, 14, 12]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[-0.25, -0.05, -0.1]} castShadow>
        <sphereGeometry args={[0.28, 14, 12]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Flower({ position, color }) {
  return (
    <mesh position={position} castShadow>
      <sphereGeometry args={[0.09, 8, 6]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.25}
        roughness={0.5}
      />
    </mesh>
  );
}

function Rock({ position, scale = 1 }) {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <dodecahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial color="#78716c" roughness={0.95} />
    </mesh>
  );
}

// Gable end — extruded triangle
function GableEnd({ z, depth = 0.3, color = '#ece6d9' }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-2.25, 0);
    s.lineTo(2.25, 0);
    s.lineTo(0, 1.125);
    s.closePath();
    return s;
  }, []);
  return (
    <mesh position={[0, 4.5, z]} castShadow>
      <extrudeGeometry args={[shape, { depth, bevelEnabled: false }]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  );
}

// Window with frame, sill, and cross mullion
function WindowWithFrame({ position, width, height, sideWall = false }) {
  const thickness = 0.05;
  const glassColor = '#4a90b8';

  if (sideWall) {
    return (
      <group position={position}>
        <Box args={[0.04, height, width]}>
          <meshStandardMaterial
            color={glassColor}
            transparent
            opacity={0.55}
            roughness={0.05}
            metalness={0.5}
          />
        </Box>
        <Box args={[0.06, height + 0.1, thickness]} position={[0, 0, width / 2 + 0.02]}>
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </Box>
        <Box args={[0.06, height + 0.1, thickness]} position={[0, 0, -width / 2 - 0.02]}>
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </Box>
        <Box args={[0.06, thickness, width + 0.1]} position={[0, height / 2 + 0.02, 0]}>
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </Box>
        <Box args={[0.06, thickness, width + 0.1]} position={[0, -height / 2 - 0.02, 0]}>
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </Box>
        <Box args={[0.08, 0.05, width + 0.2]} position={[0, -height / 2 - 0.05, 0]}>
          <meshStandardMaterial color="#f0f0f0" roughness={0.4} />
        </Box>
        <Box args={[0.045, 0.035, width]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#ffffff" />
        </Box>
        <Box args={[0.045, height, 0.035]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#ffffff" />
        </Box>
      </group>
    );
  }

  return (
    <group position={position}>
      <Box args={[width, height, 0.04]}>
        <meshStandardMaterial
          color={glassColor}
          transparent
          opacity={0.55}
          roughness={0.05}
          metalness={0.5}
        />
      </Box>
      <Box args={[thickness, height + 0.1, 0.06]} position={[-width / 2 - 0.02, 0, 0]}>
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </Box>
      <Box args={[thickness, height + 0.1, 0.06]} position={[width / 2 + 0.02, 0, 0]}>
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </Box>
      <Box args={[width + 0.1, thickness, 0.06]} position={[0, height / 2 + 0.02, 0]}>
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </Box>
      <Box args={[width + 0.1, thickness, 0.06]} position={[0, -height / 2 - 0.02, 0]}>
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </Box>
      {/* Sill */}
      <Box args={[width + 0.2, 0.05, 0.08]} position={[0, -height / 2 - 0.05, 0]}>
        <meshStandardMaterial color="#f0f0f0" roughness={0.4} />
      </Box>
      {/* Cross mullion */}
      <Box args={[width, 0.035, 0.045]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>
      <Box args={[0.035, height, 0.045]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>
    </group>
  );
}

// ====== HOUSE ======

function ModernHouse({ hoveredDamage, setHoveredDamage }) {
  const groupRef = useRef();

  const damagePoints = useMemo(() => [
    { position: [-1.2, 4.2, 0.8], severity: 'high', id: 1, size: 'large' },
    { position: [0.3, 4.8, 0.4], severity: 'high', id: 2, size: 'medium' },
    { position: [1.5, 4.1, -0.2], severity: 'medium', id: 3, size: 'medium' },
    { position: [-0.8, 4.5, -0.5], severity: 'high', id: 4, size: 'large' },
    { position: [0.9, 4.6, 0.9], severity: 'medium', id: 5, size: 'small' },
    { position: [-1.8, 3.9, 0.3], severity: 'low', id: 6, size: 'small' },
    { position: [1.1, 4.3, -0.8], severity: 'high', id: 7, size: 'large' },
    { position: [-0.2, 4.9, 0], severity: 'high', id: 8, size: 'medium' },
    { position: [2.1, 3.8, 0.5], severity: 'medium', id: 9, size: 'medium' },
    { position: [-0.5, 4.4, 0.6], severity: 'high', id: 10, size: 'large' },
    { position: [0.7, 4.7, -0.3], severity: 'medium', id: 11, size: 'medium' },
    { position: [-1.5, 4.0, -0.8], severity: 'high', id: 12, size: 'large' },
    { position: [1.8, 4.4, 0.2], severity: 'low', id: 13, size: 'small' },
  ], []);

  return (
    <group ref={groupRef}>
      {/* === FOUNDATION === */}
      <Box args={[6.2, 0.3, 5.2]} position={[0, -0.15, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#9ca09e" roughness={0.95} />
      </Box>
      <Box args={[6.3, 0.1, 5.3]} position={[0, 0.05, 0]}>
        <meshStandardMaterial color="#b8bab6" roughness={0.9} />
      </Box>

      {/* === FIRST FLOOR === */}
      <Box args={[4.5, 2.5, 3.5]} position={[0, 1.25, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#f5f1ea" roughness={0.7} />
      </Box>
      {[0.4, 0.8, 1.2, 1.6, 2.0, 2.4].map((y) => (
        <React.Fragment key={`s1-${y}`}>
          <Box args={[4.52, 0.015, 0.01]} position={[0, y, 1.76]}>
            <meshStandardMaterial color="#c9c0b1" roughness={0.9} />
          </Box>
          <Box args={[4.52, 0.015, 0.01]} position={[0, y, -1.76]}>
            <meshStandardMaterial color="#c9c0b1" roughness={0.9} />
          </Box>
          <Box args={[0.01, 0.015, 3.52]} position={[-2.26, y, 0]}>
            <meshStandardMaterial color="#c9c0b1" roughness={0.9} />
          </Box>
          <Box args={[0.01, 0.015, 3.52]} position={[2.26, y, 0]}>
            <meshStandardMaterial color="#c9c0b1" roughness={0.9} />
          </Box>
        </React.Fragment>
      ))}

      {/* Band between floors */}
      <Box args={[4.7, 0.12, 3.7]} position={[0, 2.55, 0]}>
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </Box>

      {/* === SECOND FLOOR === */}
      <Box args={[4.2, 2, 3.2]} position={[0, 3.5, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#ece6d9" roughness={0.7} />
      </Box>
      {[2.8, 3.2, 3.6, 4.0, 4.4].map((y) => (
        <React.Fragment key={`s2-${y}`}>
          <Box args={[4.22, 0.015, 0.01]} position={[0, y, 1.61]}>
            <meshStandardMaterial color="#c5bdaa" roughness={0.9} />
          </Box>
          <Box args={[4.22, 0.015, 0.01]} position={[0, y, -1.61]}>
            <meshStandardMaterial color="#c5bdaa" roughness={0.9} />
          </Box>
        </React.Fragment>
      ))}

      {/* Corner trim posts */}
      {[[-2.25, 1.76], [2.25, 1.76], [-2.25, -1.76], [2.25, -1.76]].map(([x, z], i) => (
        <Box key={`ct1-${i}`} args={[0.12, 2.52, 0.12]} position={[x, 1.25, z]} castShadow>
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </Box>
      ))}
      {[[-2.1, 1.61], [2.1, 1.61], [-2.1, -1.61], [2.1, -1.61]].map(([x, z], i) => (
        <Box key={`ct2-${i}`} args={[0.1, 2.02, 0.1]} position={[x, 3.5, z]} castShadow>
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </Box>
      ))}

      {/* === GARAGE === */}
      <Box args={[2, 2.3, 3]} position={[3, 1.15, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#ece6d9" roughness={0.7} />
      </Box>
      {[0.4, 0.8, 1.2, 1.6, 2.0].map((y) => (
        <Box key={`gs-${y}`} args={[2.02, 0.015, 0.01]} position={[3, y, 1.51]}>
          <meshStandardMaterial color="#c5bdaa" roughness={0.9} />
        </Box>
      ))}
      {/* Garage door */}
      <Box args={[1.8, 2, 0.1]} position={[3, 1, 1.52]} castShadow>
        <meshStandardMaterial color="#d5d5d5" roughness={0.5} />
      </Box>
      {[0, 1, 2, 3, 4].map((i) => (
        <Box key={`gd-${i}`} args={[1.82, 0.025, 0.06]} position={[3, 0.25 + i * 0.4, 1.56]}>
          <meshStandardMaterial color="#8a8a8a" />
        </Box>
      ))}
      {/* Garage door trim */}
      <Box args={[2, 0.1, 0.08]} position={[3, 2.05, 1.54]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>

      {/* === WINDOWS === */}
      {/* First floor front */}
      <WindowWithFrame position={[-1.5, 1.3, 1.77]} width={1.3} height={1.3} />
      <WindowWithFrame position={[1.5, 1.3, 1.77]} width={1.3} height={1.3} />
      {/* Second floor front — three panes */}
      <WindowWithFrame position={[-1.3, 3.5, 1.62]} width={0.95} height={1.1} />
      <WindowWithFrame position={[0, 3.5, 1.62]} width={0.95} height={1.1} />
      <WindowWithFrame position={[1.3, 3.5, 1.62]} width={0.95} height={1.1} />
      {/* Side windows (second floor) */}
      <WindowWithFrame position={[-2.12, 3.5, 0]} width={0.9} height={1} sideWall />
      <WindowWithFrame position={[2.12, 3.5, 0]} width={0.9} height={1} sideWall />
      {/* Side windows (first floor) */}
      <WindowWithFrame position={[-2.27, 1.4, 0.6]} width={0.8} height={1.1} sideWall />
      <WindowWithFrame position={[-2.27, 1.4, -0.6]} width={0.8} height={1.1} sideWall />

      {/* === FRONT DOOR === */}
      <Box args={[0.85, 1.8, 0.08]} position={[0, 0.9, 1.78]} castShadow>
        <meshStandardMaterial color="#3b2a1f" roughness={0.4} />
      </Box>
      {/* Door panels (recessed look via darker color) */}
      {[0.35, 1.05].map((y, i) => (
        <Box key={`dp-${i}`} args={[0.6, 0.5, 0.02]} position={[0, y, 1.83]}>
          <meshStandardMaterial color="#2a1f15" />
        </Box>
      ))}
      {/* Door knob */}
      <Sphere args={[0.05]} position={[0.3, 0.9, 1.84]}>
        <meshStandardMaterial color="#d4a574" metalness={0.9} roughness={0.2} />
      </Sphere>
      {/* Door trim (left, right, top) */}
      <Box args={[0.06, 2.0, 0.04]} position={[-0.455, 0.9, 1.79]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>
      <Box args={[0.06, 2.0, 0.04]} position={[0.455, 0.9, 1.79]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>
      <Box args={[0.97, 0.06, 0.04]} position={[0, 1.9, 1.79]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>
      {/* Welcome mat */}
      <Box args={[0.95, 0.02, 0.5]} position={[0, 0.12, 2.1]}>
        <meshStandardMaterial color="#78391a" roughness={0.9} />
      </Box>

      {/* === ENTRY PORCH === */}
      <Box args={[1.9, 0.14, 1.3]} position={[0, 2.1, 2.35]} castShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </Box>
      <Box args={[0.12, 1.95, 0.12]} position={[-0.75, 1.05, 2.85]} castShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </Box>
      <Box args={[0.12, 1.95, 0.12]} position={[0.75, 1.05, 2.85]} castShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </Box>
      {/* Porch slab */}
      <Box args={[2, 0.1, 1]} position={[0, 0.11, 2.4]} receiveShadow>
        <meshStandardMaterial color="#c9c4bc" roughness={0.85} />
      </Box>

      {/* === PITCHED ROOF === */}
      <mesh position={[-1.125, 5.05, 0]} rotation={[0, 0, Math.PI / 6]} castShadow receiveShadow>
        <boxGeometry args={[2.7, 0.2, 4]} />
        <meshStandardMaterial color="#2d2d2d" roughness={0.88} />
      </mesh>
      <mesh position={[1.125, 5.05, 0]} rotation={[0, 0, -Math.PI / 6]} castShadow receiveShadow>
        <boxGeometry args={[2.7, 0.2, 4]} />
        <meshStandardMaterial color="#2d2d2d" roughness={0.88} />
      </mesh>

      {/* Shingle rows — dark horizontal stripes along slope */}
      {[-1.6, -1.1, -0.6, -0.1, 0.4, 0.9, 1.4].map((zOff, i) => (
        <React.Fragment key={`sh-${i}`}>
          <mesh position={[-1.125, 5.16, zOff]} rotation={[0, 0, Math.PI / 6]}>
            <boxGeometry args={[2.68, 0.008, 0.06]} />
            <meshStandardMaterial color="#161616" roughness={0.9} />
          </mesh>
          <mesh position={[1.125, 5.16, zOff]} rotation={[0, 0, -Math.PI / 6]}>
            <boxGeometry args={[2.68, 0.008, 0.06]} />
            <meshStandardMaterial color="#161616" roughness={0.9} />
          </mesh>
        </React.Fragment>
      ))}
      {/* Lighter shingle variation rows */}
      {[-1.35, -0.85, -0.35, 0.15, 0.65, 1.15].map((zOff, i) => (
        <React.Fragment key={`shl-${i}`}>
          <mesh position={[-1.125, 5.16, zOff]} rotation={[0, 0, Math.PI / 6]}>
            <boxGeometry args={[2.68, 0.005, 0.02]} />
            <meshStandardMaterial color="#464646" roughness={0.85} />
          </mesh>
          <mesh position={[1.125, 5.16, zOff]} rotation={[0, 0, -Math.PI / 6]}>
            <boxGeometry args={[2.68, 0.005, 0.02]} />
            <meshStandardMaterial color="#464646" roughness={0.85} />
          </mesh>
        </React.Fragment>
      ))}

      {/* Ridge cap */}
      <Box args={[0.4, 0.28, 4.2]} position={[0, 5.92, 0]} castShadow>
        <meshStandardMaterial color="#141414" roughness={0.9} />
      </Box>

      {/* Front/back gable walls */}
      <GableEnd z={1.6} depth={0.3} />
      <GableEnd z={-1.9} depth={0.3} />

      {/* Fascia board */}
      <Box args={[5.3, 0.18, 0.08]} position={[0, 4.45, 1.99]}>
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </Box>
      <Box args={[5.3, 0.18, 0.08]} position={[0, 4.45, -1.99]}>
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </Box>

      {/* Gutters */}
      <mesh position={[0, 4.33, 2.04]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 5.3, 14, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#cfd4d8" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 4.33, -2.04]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 5.3, 14, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#cfd4d8" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Downspouts */}
      <Box args={[0.08, 4.65, 0.08]} position={[-2.6, 2.15, 2.0]}>
        <meshStandardMaterial color="#cfd4d8" metalness={0.5} roughness={0.4} />
      </Box>
      <Box args={[0.08, 4.65, 0.08]} position={[2.6, 2.15, -2.0]}>
        <meshStandardMaterial color="#cfd4d8" metalness={0.5} roughness={0.4} />
      </Box>

      {/* Garage pitched roof */}
      <mesh position={[3, 3, 0]} rotation={[0, 0, -Math.PI / 8]} castShadow>
        <boxGeometry args={[2.5, 0.18, 3.2]} />
        <meshStandardMaterial color="#2d2d2d" roughness={0.88} />
      </mesh>
      {[-1.2, -0.7, -0.2, 0.3, 0.8, 1.3].map((z, i) => (
        <mesh key={`gsh-${i}`} position={[3, 3.12, z]} rotation={[0, 0, -Math.PI / 8]}>
          <boxGeometry args={[2.48, 0.006, 0.05]} />
          <meshStandardMaterial color="#161616" roughness={0.9} />
        </mesh>
      ))}

      {/* === CHIMNEY === */}
      <Box args={[0.5, 1.5, 0.5]} position={[1.3, 5.4, -1.1]} castShadow>
        <meshStandardMaterial color="#8b4513" roughness={0.85} />
      </Box>
      <Box args={[0.58, 0.08, 0.58]} position={[1.3, 6.18, -1.1]}>
        <meshStandardMaterial color="#5e4430" roughness={0.85} />
      </Box>
      {/* Brick mortar lines */}
      {[0, 1, 2, 3, 4].map((i) => (
        <Box key={`br-${i}`} args={[0.52, 0.01, 0.52]} position={[1.3, 4.8 + i * 0.28, -1.1]}>
          <meshStandardMaterial color="#5e4430" />
        </Box>
      ))}

      {/* === DAMAGE POINTS === */}
      {damagePoints.map((damage, i) => (
        <DamageMarker
          key={i}
          {...damage}
          isHovered={hoveredDamage === i}
          onHover={() => setHoveredDamage(i)}
          onLeave={() => setHoveredDamage(null)}
        />
      ))}

      <MeasurementLines />
    </group>
  );
}

// ====== DAMAGE MARKER ======
function DamageMarker({ position, severity, id, size, isHovered, onHover, onLeave }) {
  const meshRef = useRef();
  const ringRef = useRef();
  const [pulse, setPulse] = useState(0);

  const colors = {
    high: '#ef4444',
    medium: '#f97316',
    low: '#fbbf24',
  };
  const sizes = {
    large: 0.18,
    medium: 0.14,
    small: 0.10,
  };

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    setPulse(Math.sin(time * 3) * 0.5 + 0.5);
    if (meshRef.current) {
      meshRef.current.scale.setScalar(isHovered ? 1.2 + pulse * 0.2 : 1 + pulse * 0.05);
    }
    if (ringRef.current && isHovered) {
      ringRef.current.rotation.z = time;
      ringRef.current.scale.setScalar(1 + pulse * 0.3);
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[sizes[size]]} onPointerOver={onHover} onPointerOut={onLeave}>
        <meshStandardMaterial
          color={colors[severity]}
          emissive={colors[severity]}
          emissiveIntensity={isHovered ? 0.9 : 0.5}
          roughness={0.3}
          metalness={0.2}
        />
      </Sphere>
      <mesh ref={ringRef}>
        <torusGeometry args={[sizes[size] * 2.5, 0.015, 16, 32]} />
        <meshBasicMaterial color={colors[severity]} transparent opacity={isHovered ? 0.8 : 0.4} />
      </mesh>
      <Sphere
        args={[sizes[size] * 3]}
        onPointerOver={onHover}
        onPointerOut={onLeave}
        visible={false}
      />
      {isHovered && (
        <>
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <mesh key={angle} rotation={[0, 0, (angle * Math.PI) / 180]}>
              <boxGeometry args={[0.15, 0.005, 0.005]} />
              <meshBasicMaterial color={colors[severity]} transparent opacity={0.4} />
            </mesh>
          ))}
          <Html center>
            <div className="bg-gray-900/95 text-white px-3 py-2 rounded-lg shadow-xl -translate-y-10 pointer-events-none">
              <div className="text-xs font-bold text-green-400 mb-1">Damage Point #{id}</div>
              <div className="text-[10px] text-gray-300">Severity: {severity.toUpperCase()}</div>
              <div className="text-[10px] text-gray-300">Size: {size}</div>
              <div className="text-[10px] text-blue-300 mt-1">Click for photos</div>
            </div>
          </Html>
        </>
      )}
    </group>
  );
}

// ====== MEASUREMENT OVERLAYS ======
function MeasurementLines() {
  return (
    <group>
      <Html position={[-2.5, 5.5, 0]}>
        <div className="bg-green-500/90 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
          North: 13.1 SQ
        </div>
      </Html>
      <Html position={[2.5, 5.5, 0]}>
        <div className="bg-green-500/90 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
          South: 11.4 SQ
        </div>
      </Html>
      <Html position={[0, 6.3, 0]}>
        <div className="bg-blue-600/95 text-white px-3 py-1 rounded text-sm font-bold whitespace-nowrap shadow-lg">
          Total: 24.5 SQ
        </div>
      </Html>
      <mesh position={[-2.5, 4.8, 0]}>
        <boxGeometry args={[0.02, 0.5, 0.02]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>
      <mesh position={[2.5, 4.8, 0]}>
        <boxGeometry args={[0.02, 0.5, 0.02]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>
    </group>
  );
}

// ====== MAIN CANVAS ======
function House3DAdvanced() {
  const [hoveredDamage, setHoveredDamage] = useState(null);

  return (
    <div className="bg-white rounded-lg border border-stone-200 p-6">
      <div className="text-center mb-4">
        <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium mb-1">
          3D Digital Twin — Professional Model
        </div>
        <div className="text-[13px] text-stone-900">
          Drag to rotate • Click damage points for inspection details
        </div>
      </div>

      <div className="relative rounded-lg overflow-hidden" style={{ height: '500px' }}>
        <Canvas
          camera={{ position: [8, 6, 10], fov: 45 }}
          shadows
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        >
          {/* Sky background + atmospheric fog */}
          <color attach="background" args={['#dce8f0']} />
          <fog attach="fog" args={['#c9dae5', 22, 55]} />

          {/* Lighting */}
          <ambientLight intensity={0.45} />
          <directionalLight
            position={[10, 15, 7]}
            intensity={1.25}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={50}
            shadow-camera-left={-15}
            shadow-camera-right={15}
            shadow-camera-top={15}
            shadow-camera-bottom={-15}
            shadow-bias={-0.0005}
          />
          <directionalLight position={[-6, 8, -5]} intensity={0.3} color="#b8d4e8" />
          <hemisphereLight args={['#dce8f0', '#4a5d3a', 0.4]} />

          <Environment preset="park" />

          <Suspense fallback={null}>
            <ModernHouse
              hoveredDamage={hoveredDamage}
              setHoveredDamage={setHoveredDamage}
            />
          </Suspense>

          {/* === GROUND === */}
          {/* Lawn */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.299, 0]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial color="#5c8a3a" roughness={0.95} />
          </mesh>
          {/* Subtle patch variations */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-7, -0.298, 4]} receiveShadow>
            <planeGeometry args={[9, 7]} />
            <meshStandardMaterial color="#4d7a30" roughness={0.95} transparent opacity={0.75} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[6, -0.298, -4]} receiveShadow>
            <planeGeometry args={[7, 8]} />
            <meshStandardMaterial color="#679a3f" roughness={0.95} transparent opacity={0.7} />
          </mesh>

          {/* Front walkway */}
          <Box args={[1.5, 0.08, 3.2]} position={[0, -0.26, 4.1]} receiveShadow>
            <meshStandardMaterial color="#c9c4bc" roughness={0.85} />
          </Box>
          {/* Walkway joint lines */}
          {[2.6, 3.4, 4.2, 5.0, 5.8].map((z, i) => (
            <Box key={`wj-${i}`} args={[1.52, 0.005, 0.015]} position={[0, -0.215, z]}>
              <meshStandardMaterial color="#9e9a92" />
            </Box>
          ))}

          {/* Public sidewalk (street side) */}
          <Box args={[16, 0.08, 1.5]} position={[0, -0.26, 6.2]} receiveShadow>
            <meshStandardMaterial color="#c9c4bc" roughness={0.85} />
          </Box>
          {[-6, -4, -2, 0, 2, 4, 6].map((x, i) => (
            <Box key={`sw-${i}`} args={[0.02, 0.005, 1.52]} position={[x, -0.215, 6.2]}>
              <meshStandardMaterial color="#9e9a92" />
            </Box>
          ))}

          {/* Driveway */}
          <Box args={[3.2, 0.08, 5]} position={[3, -0.26, 3.8]} receiveShadow>
            <meshStandardMaterial color="#6d6d6d" roughness={0.9} />
          </Box>
          <Box args={[0.03, 0.005, 5]} position={[3, -0.215, 3.8]}>
            <meshStandardMaterial color="#4a4a4a" />
          </Box>

          {/* Street */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.305, 8.5]} receiveShadow>
            <planeGeometry args={[50, 4]} />
            <meshStandardMaterial color="#3a3a3a" roughness={0.95} />
          </mesh>
          {/* Street center dashes */}
          {[-18, -14, -10, -6, -2, 2, 6, 10, 14, 18].map((x, i) => (
            <Box key={`sl-${i}`} args={[2, 0.01, 0.12]} position={[x, -0.295, 8.5]}>
              <meshStandardMaterial color="#f2d640" />
            </Box>
          ))}
          {/* Curb */}
          <Box args={[40, 0.18, 0.2]} position={[0, -0.21, 7]}>
            <meshStandardMaterial color="#a0a0a0" roughness={0.9} />
          </Box>

          {/* Mulch bed at front entry */}
          <Box args={[4, 0.04, 0.85]} position={[0, -0.28, 3.1]} receiveShadow>
            <meshStandardMaterial color="#4e342e" roughness={1} />
          </Box>

          {/* Entry landscaping */}
          <Bush position={[-1.3, -0.1, 3.0]} scale={0.9} />
          <Bush position={[1.3, -0.1, 3.0]} scale={0.9} />
          <Bush position={[-1.8, -0.1, 3.1]} scale={0.72} color="#3d8b40" />
          <Bush position={[1.8, -0.1, 3.1]} scale={0.72} color="#3d8b40" />

          {/* Flowers */}
          {[
            { x: -1.0, z: 2.9, c: '#ef4444' },
            { x: -0.7, z: 3.1, c: '#ec4899' },
            { x: 0.65, z: 2.9, c: '#fbbf24' },
            { x: 0.95, z: 3.15, c: '#a855f7' },
            { x: -1.55, z: 3.25, c: '#f97316' },
            { x: 1.55, z: 3.2, c: '#ef4444' },
            { x: -2.1, z: 3.0, c: '#ec4899' },
            { x: 2.1, z: 3.0, c: '#fbbf24' },
          ].map((f, i) => (
            <Flower key={`fl-${i}`} position={[f.x, -0.2, f.z]} color={f.c} />
          ))}

          {/* Side planting beds */}
          <Bush position={[-2.75, -0.1, 0]} scale={0.8} />
          <Bush position={[-2.75, -0.1, 1]} scale={0.7} color="#3d8b40" />
          <Bush position={[-2.75, -0.1, -1]} scale={0.7} color="#3d8b40" />
          <Bush position={[2.3, -0.1, -1.8]} scale={0.75} />
          <Bush position={[2.3, -0.1, -0.8]} scale={0.65} color="#3d8b40" />

          {/* Landscape rocks */}
          <Rock position={[-3.6, -0.2, 3.8]} scale={0.9} />
          <Rock position={[-3.2, -0.2, 4.3]} scale={0.55} />
          <Rock position={[5, -0.2, 4.8]} scale={0.8} />
          <Rock position={[5.4, -0.2, 4.3]} scale={0.5} />

          {/* Trees */}
          <DeciduousTree position={[-5.8, 0, -1.5]} scale={1.15} />
          <PineTree position={[-6.2, 0, 2.2]} scale={1} />
          <DeciduousTree position={[6.2, 0, 0.2]} scale={1.1} />
          <PineTree position={[5.8, 0, -3]} scale={0.95} />
          <DeciduousTree position={[-4, 0, 5]} scale={0.85} />
          <DeciduousTree position={[4.5, 0, 5.5]} scale={0.9} />

          {/* Contact shadows */}
          <ContactShadows
            opacity={0.45}
            scale={25}
            blur={2}
            far={10}
            position={[0, -0.3, 0]}
          />

          {/* Controls */}
          <OrbitControls
            enablePan={false}
            maxPolarAngle={Math.PI / 2.2}
            minDistance={6}
            maxDistance={22}
          />
        </Canvas>
      </div>

      {/* Interactive Stats Panel */}
      <div className="mt-6">
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <div className="text-[10px] uppercase tracking-wider text-green-600 font-medium">
              Affected Area
            </div>
            <div className="text-2xl font-bold text-green-900 mt-1">
              24.5 <span className="text-sm font-normal text-green-700">SQ</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <div className="text-[10px] uppercase tracking-wider text-blue-600 font-medium">
              Damage Points
            </div>
            <div className="text-2xl font-bold text-blue-900 mt-1">
              13 <span className="text-sm font-normal text-blue-700">found</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-3 border border-amber-200">
            <div className="text-[10px] uppercase tracking-wider text-amber-600 font-medium">
              Roof Pitch
            </div>
            <div className="text-2xl font-bold text-amber-900 mt-1">6/12</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
            <div className="text-[10px] uppercase tracking-wider text-purple-600 font-medium">
              Slopes Affected
            </div>
            <div className="text-2xl font-bold text-purple-900 mt-1">
              2 <span className="text-sm font-normal text-purple-700">of 4</span>
            </div>
          </div>
        </div>

        {hoveredDamage !== null && (
          <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  Inspecting Damage Point #{hoveredDamage + 1}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Click to view detailed photos and measurements
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-700">Active</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default House3DAdvanced;
