import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Box,
  Plane,
  Text,
  Sphere,
  Html,
  Environment,
  ContactShadows,
  Float,
  MeshReflectorMaterial
} from '@react-three/drei';
import * as THREE from 'three';

// Tree Component
function Tree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      {/* Tree trunk */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 1, 8]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      {/* Tree foliage */}
      <mesh position={[0, 1.5, 0]}>
        <coneGeometry args={[1, 2, 8]} />
        <meshStandardMaterial color="#228B22" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.3, 0]}>
        <coneGeometry args={[0.8, 1.5, 8]} />
        <meshStandardMaterial color="#2E7D32" roughness={0.9} />
      </mesh>
    </group>
  );
}

// Modern House Component with detailed geometry
function ModernHouse({ hoveredDamage, setHoveredDamage }) {
  const groupRef = useRef();

  // Damage points positioned realistically on pitched roof
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
    // New damage points
    { position: [0.7, 4.7, -0.3], severity: 'medium', id: 11, size: 'medium' },
    { position: [-1.5, 4.0, -0.8], severity: 'high', id: 12, size: 'large' },
    { position: [1.8, 4.4, 0.2], severity: 'low', id: 13, size: 'small' },
  ], []);

  return (
    <group ref={groupRef}>
      {/* Foundation Platform */}
      <Box args={[6, 0.3, 5]} position={[0, -0.15, 0]}>
        <meshStandardMaterial color="#d4d4d8" roughness={0.8} />
      </Box>

      {/* Main House Structure */}
      <group position={[0, 0, 0]}>
        {/* First Floor */}
        <Box args={[4.5, 2.5, 3.5]} position={[0, 1.25, 0]}>
          <meshStandardMaterial color="#fafafa" roughness={0.4} />
        </Box>

        {/* Second Floor */}
        <Box args={[4.2, 2, 3.2]} position={[0, 3.5, 0]}>
          <meshStandardMaterial color="#f5f5f5" roughness={0.4} />
        </Box>

        {/* Garage Extension */}
        <Box args={[2, 2.3, 3]} position={[3, 1.15, 0]}>
          <meshStandardMaterial color="#e5e5e5" roughness={0.5} />
        </Box>

        {/* Triangular Pitched Roof - Simplified */}
        {/* Left Roof Slope */}
        <mesh position={[-1.2, 5, 0]} rotation={[0, 0, Math.PI / 6]}>
          <boxGeometry args={[3, 0.2, 4]} />
          <meshStandardMaterial color="#4a4a4a" roughness={0.8} />
        </mesh>

        {/* Right Roof Slope */}
        <mesh position={[1.2, 5, 0]} rotation={[0, 0, -Math.PI / 6]}>
          <boxGeometry args={[3, 0.2, 4]} />
          <meshStandardMaterial color="#4a4a4a" roughness={0.8} />
        </mesh>

        {/* Front Gable */}
        <mesh position={[0, 5, 2]}>
          <coneGeometry args={[2.6, 1.8, 3]} />
          <meshStandardMaterial color="#e5e5e5" roughness={0.5} />
        </mesh>

        {/* Back Gable */}
        <mesh position={[0, 5, -2]}>
          <coneGeometry args={[2.6, 1.8, 3]} />
          <meshStandardMaterial color="#e5e5e5" roughness={0.5} />
        </mesh>

        {/* Roof Ridge */}
        <Box args={[0.3, 0.3, 4.2]} position={[0, 5.9, 0]}>
          <meshStandardMaterial color="#3a3a3a" roughness={0.6} />
        </Box>

        {/* Garage Pitched Roof */}
        <mesh position={[3, 3, 0]} rotation={[0, 0, -Math.PI / 8]}>
          <boxGeometry args={[2.5, 0.2, 3.2]} />
          <meshStandardMaterial color="#525252" roughness={0.7} />
        </mesh>

        {/* Architectural Details */}

        {/* Front Door */}
        <Box args={[0.8, 1.6, 0.1]} position={[0, 0.8, 1.76]}>
          <meshStandardMaterial color="#8b4513" roughness={0.3} />
        </Box>

        {/* Door Handle */}
        <Sphere args={[0.05]} position={[0.3, 0.8, 1.82]}>
          <meshStandardMaterial color="#d4a574" metalness={0.8} roughness={0.2} />
        </Sphere>

        {/* Large Modern Windows - First Floor */}
        <Box args={[1.2, 1.2, 0.05]} position={[-1.5, 1.2, 1.77]}>
          <meshStandardMaterial
            color="#87ceeb"
            transparent
            opacity={0.4}
            roughness={0.1}
            metalness={0.5}
          />
        </Box>
        <Box args={[1.2, 1.2, 0.05]} position={[1.5, 1.2, 1.77]}>
          <meshStandardMaterial
            color="#87ceeb"
            transparent
            opacity={0.4}
            roughness={0.1}
            metalness={0.5}
          />
        </Box>

        {/* Second Floor Windows */}
        <Box args={[3, 1, 0.05]} position={[0, 3.5, 1.62]}>
          <meshStandardMaterial
            color="#87ceeb"
            transparent
            opacity={0.3}
            roughness={0.1}
            metalness={0.6}
          />
        </Box>

        {/* Side Windows */}
        <Box args={[0.05, 1, 1]} position={[2.27, 3.5, 0]}>
          <meshStandardMaterial
            color="#87ceeb"
            transparent
            opacity={0.35}
            roughness={0.1}
            metalness={0.5}
          />
        </Box>

        {/* Garage Door */}
        <Box args={[1.8, 2, 0.1]} position={[3, 1, 1.51]}>
          <meshStandardMaterial color="#a0a0a0" roughness={0.6} />
        </Box>

        {/* Garage Door Panels */}
        {[0, 1, 2, 3].map((i) => (
          <Box key={i} args={[1.7, 0.02, 0.05]} position={[3, 0.4 + i * 0.5, 1.53]}>
            <meshStandardMaterial color="#808080" />
          </Box>
        ))}

        {/* Chimney */}
        <Box args={[0.4, 1.2, 0.4]} position={[1.5, 5.2, -1]}>
          <meshStandardMaterial color="#8b4513" roughness={0.7} />
        </Box>

        {/* Architectural Trim */}
        <Box args={[4.7, 0.1, 3.7]} position={[0, 2.55, 0]}>
          <meshStandardMaterial color="#f0f0f0" />
        </Box>

        {/* Entry Overhang */}
        <Box args={[1.5, 0.1, 1]} position={[0, 2.1, 2.2]}>
          <meshStandardMaterial color="#e0e0e0" />
        </Box>

        {/* Support Columns for Overhang */}
        <Box args={[0.1, 1.3, 0.1]} position={[-0.7, 1.45, 2.7]}>
          <meshStandardMaterial color="#f0f0f0" />
        </Box>
        <Box args={[0.1, 1.3, 0.1]} position={[0.7, 1.45, 2.7]}>
          <meshStandardMaterial color="#f0f0f0" />
        </Box>
      </group>

      {/* Damage Indicators with Enhanced Visuals */}
      {damagePoints.map((damage, i) => (
        <DamageMarker
          key={i}
          {...damage}
          isHovered={hoveredDamage === i}
          onHover={() => setHoveredDamage(i)}
          onLeave={() => setHoveredDamage(null)}
        />
      ))}

      {/* Measurement Annotations */}
      <MeasurementLines />
    </group>
  );
}

// Enhanced Damage Marker Component
function DamageMarker({ position, severity, id, size, isHovered, onHover, onLeave }) {
  const meshRef = useRef();
  const ringRef = useRef();
  const [pulse, setPulse] = useState(0);

  const colors = {
    high: '#ef4444',
    medium: '#f97316',
    low: '#fbbf24'
  };

  const sizes = {
    large: 0.18,
    medium: 0.14,
    small: 0.10
  };

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    setPulse(Math.sin(time * 3) * 0.5 + 0.5);

    if (meshRef.current) {
      if (isHovered) {
        meshRef.current.scale.setScalar(1.2 + pulse * 0.2);
      } else {
        meshRef.current.scale.setScalar(1 + pulse * 0.05);
      }
    }

    if (ringRef.current && isHovered) {
      ringRef.current.rotation.z = time;
      ringRef.current.scale.setScalar(1 + pulse * 0.3);
    }
  });

  return (
    <group position={position}>
      {/* Main damage point */}
      <Sphere
        ref={meshRef}
        args={[sizes[size]]}
        onPointerOver={onHover}
        onPointerOut={onLeave}
      >
        <meshStandardMaterial
          color={colors[severity]}
          emissive={colors[severity]}
          emissiveIntensity={isHovered ? 0.8 : 0.4}
          roughness={0.3}
          metalness={0.2}
        />
      </Sphere>

      {/* Outer ring effect */}
      <mesh ref={ringRef}>
        <torusGeometry args={[sizes[size] * 2.5, 0.015, 16, 32]} />
        <meshBasicMaterial
          color={colors[severity]}
          transparent
          opacity={isHovered ? 0.8 : 0.4}
        />
      </mesh>

      {/* Larger invisible collision area for better hover detection */}
      <Sphere
        args={[sizes[size] * 3]}
        onPointerOver={onHover}
        onPointerOut={onLeave}
        visible={false}
      />

      {/* Impact crack lines */}
      {isHovered && (
        <>
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <mesh key={angle} rotation={[0, 0, (angle * Math.PI) / 180]}>
              <boxGeometry args={[0.15, 0.005, 0.005]} />
              <meshBasicMaterial color={colors[severity]} transparent opacity={0.4} />
            </mesh>
          ))}
        </>
      )}

      {/* Hover tooltip */}
      {isHovered && (
        <Html center>
          <div className="bg-gray-900/95 text-white px-3 py-2 rounded-lg shadow-xl -translate-y-10 pointer-events-none">
            <div className="text-xs font-bold text-green-400 mb-1">Damage Point #{id}</div>
            <div className="text-[10px] text-gray-300">Severity: {severity.toUpperCase()}</div>
            <div className="text-[10px] text-gray-300">Size: {size}</div>
            <div className="text-[10px] text-blue-300 mt-1">Click for photos</div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Measurement Lines and Annotations
function MeasurementLines() {
  return (
    <group>
      {/* Roof area measurements */}
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

      <Html position={[0, 6, 0]}>
        <div className="bg-blue-600/90 text-white px-3 py-1 rounded text-sm font-bold whitespace-nowrap">
          Total: 24.5 SQ
        </div>
      </Html>

      {/* Dimension lines */}
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

// Loading Component
function LoadingBox() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#10b981" wireframe />
    </mesh>
  );
}

// Main Component
function House3DAdvanced() {
  const [hoveredDamage, setHoveredDamage] = useState(null);

  return (
    <div className="bg-white rounded-lg border border-stone-200 p-6">
      <div className="text-center mb-4">
        <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium mb-1">
          3D Digital Twin - Professional Model
        </div>
        <div className="text-[13px] text-stone-900">
          Drag to rotate • Click damage points for inspection details
        </div>
      </div>

      <div className="relative" style={{ height: '500px' }}>
        <Canvas
          camera={{ position: [8, 6, 10], fov: 45 }}
          shadows
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        >
          {/* Lighting Setup */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <pointLight position={[-5, 5, -5]} intensity={0.5} color="#fbbf24" />
          <spotLight
            position={[0, 10, 0]}
            angle={0.3}
            penumbra={1}
            intensity={0.5}
            castShadow
          />

          {/* Environment */}
          <Environment preset="city" />

          {/* House Model */}
          <Suspense fallback={<LoadingBox />}>
            <ModernHouse
              hoveredDamage={hoveredDamage}
              setHoveredDamage={setHoveredDamage}
            />
          </Suspense>

          {/* Environment Features */}

          {/* Grass Lawn */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.29, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#4CAF50" roughness={0.9} />
          </mesh>

          {/* Front Sidewalk */}
          <Box args={[8, 0.05, 1.5]} position={[0, -0.27, 5]}>
            <meshStandardMaterial color="#9E9E9E" roughness={0.8} />
          </Box>

          {/* Driveway */}
          <Box args={[3, 0.05, 6]} position={[3, -0.27, 3]}>
            <meshStandardMaterial color="#757575" roughness={0.7} />
          </Box>

          {/* Walkway to Front Door */}
          <Box args={[1.2, 0.05, 3]} position={[0, -0.27, 2.5]}>
            <meshStandardMaterial color="#9E9E9E" roughness={0.8} />
          </Box>

          {/* Trees */}
          <Tree position={[-6, 0, -2]} scale={1.2} />
          <Tree position={[-5, 0, 3]} scale={0.9} />
          <Tree position={[6, 0, -1]} scale={1.1} />
          <Tree position={[5, 0, 4]} scale={0.8} />

          {/* Bushes (simplified as small green spheres) */}
          <mesh position={[-2.5, 0.3, 2.5]}>
            <sphereGeometry args={[0.4, 8, 6]} />
            <meshStandardMaterial color="#2E7D32" roughness={0.9} />
          </mesh>
          <mesh position={[2.5, 0.3, 2.5]}>
            <sphereGeometry args={[0.4, 8, 6]} />
            <meshStandardMaterial color="#2E7D32" roughness={0.9} />
          </mesh>
          <mesh position={[-1.5, 0.25, 2.5]}>
            <sphereGeometry args={[0.35, 8, 6]} />
            <meshStandardMaterial color="#388E3C" roughness={0.9} />
          </mesh>
          <mesh position={[1.5, 0.25, 2.5]}>
            <sphereGeometry args={[0.35, 8, 6]} />
            <meshStandardMaterial color="#388E3C" roughness={0.9} />
          </mesh>

          {/* Street/Road */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.31, 8]} receiveShadow>
            <planeGeometry args={[50, 5]} />
            <meshStandardMaterial color="#424242" roughness={0.9} />
          </mesh>

          {/* Ground with Reflection (under everything) */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.32, 0]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <MeshReflectorMaterial
              blur={[300, 30]}
              resolution={2048}
              mixBlur={1}
              mixStrength={180}
              roughness={1}
              depthScale={1.2}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.4}
              color="#e0e0e0"
              metalness={0.5}
            />
          </mesh>

          {/* Contact Shadows */}
          <ContactShadows
            opacity={0.4}
            scale={10}
            blur={1.5}
            far={10}
            position={[0, -0.3, 0]}
          />

          {/* Grid Helper */}
          <gridHelper args={[30, 30, '#10b981', '#10b98120']} position={[0, -0.29, 0]} />

          {/* Controls */}
          <OrbitControls
            enablePan={false}
            maxPolarAngle={Math.PI / 2.2}
            minDistance={6}
            maxDistance={20}
            autoRotate={false}
            autoRotateSpeed={0.5}
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
            <div className="text-2xl font-bold text-amber-900 mt-1">
              6/12
            </div>
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

        {/* Damage Summary when hovering */}
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