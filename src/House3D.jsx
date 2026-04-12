import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Box, Plane, Text, Sphere, Cone, Html, Environment, PresentationControls, Stage, Float } from '@react-three/drei';
import * as THREE from 'three';

function HouseModel({ hoveredDamage, setHoveredDamage }) {
  const groupRef = useRef();

  // Damage points on roof
  const damagePoints = useMemo(() => [
    { position: [-0.8, 2.2, 0.5], severity: 'high', id: 1 },
    { position: [0, 2.5, 0], severity: 'high', id: 2 },
    { position: [0.8, 2.2, -0.5], severity: 'medium', id: 3 },
    { position: [-1.2, 2.0, -0.3], severity: 'high', id: 4 },
    { position: [1.2, 2.0, 0.3], severity: 'medium', id: 5 },
    { position: [-0.4, 2.3, -0.6], severity: 'low', id: 6 },
    { position: [0.4, 2.3, 0.6], severity: 'high', id: 7 },
    { position: [0, 2.6, -0.4], severity: 'high', id: 8 },
    { position: [-0.6, 2.1, 0.2], severity: 'medium', id: 9 },
    { position: [0.6, 2.1, -0.2], severity: 'high', id: 10 },
  ], []);

  const damageColors = {
    high: '#ef4444',
    medium: '#f97316',
    low: '#fbbf24'
  };

  return (
    <group ref={groupRef}>
      {/* Foundation */}
      <Box args={[4, 0.2, 3]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#57534e" />
      </Box>

      {/* Main House Body */}
      <Box args={[3.5, 2, 2.8]} position={[0, 1, 0]}>
        <meshStandardMaterial color="#fef3c7" />
      </Box>

      {/* Garage Extension */}
      <Box args={[1.5, 1.8, 2]} position={[2, 0.9, 0]}>
        <meshStandardMaterial color="#fde68a" />
      </Box>

      {/* Front Door */}
      <Box args={[0.4, 0.8, 0.1]} position={[0, 0.5, 1.45]}>
        <meshStandardMaterial color="#92400e" />
      </Box>

      {/* Windows - Front */}
      <Box args={[0.5, 0.5, 0.1]} position={[-0.8, 1.2, 1.45]}>
        <meshStandardMaterial color="#7dd3fc" opacity={0.8} transparent />
      </Box>
      <Box args={[0.5, 0.5, 0.1]} position={[0.8, 1.2, 1.45]}>
        <meshStandardMaterial color="#7dd3fc" opacity={0.8} transparent />
      </Box>

      {/* Windows - Side */}
      <Box args={[0.1, 0.5, 0.5]} position={[1.8, 1.2, 0]}>
        <meshStandardMaterial color="#7dd3fc" opacity={0.8} transparent />
      </Box>

      {/* Garage Door */}
      <Box args={[1.2, 1.2, 0.1]} position={[2, 0.7, 1.05]}>
        <meshStandardMaterial color="#a8a29e" />
      </Box>

      {/* Main Roof */}
      <mesh position={[0, 2.5, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[2.8, 1.5, 4]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {/* Garage Roof */}
      <mesh position={[2, 2.2, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <coneGeometry args={[1.2, 0.8, 4]} />
        <meshStandardMaterial color="#475569" />
      </mesh>

      {/* Chimney */}
      <Box args={[0.3, 0.8, 0.3]} position={[1.2, 2.8, -0.5]}>
        <meshStandardMaterial color="#8b4513" />
      </Box>

      {/* Damage Indicators */}
      {damagePoints.map((damage, i) => (
        <DamageIndicator
          key={i}
          position={damage.position}
          severity={damage.severity}
          color={damageColors[damage.severity]}
          isHovered={hoveredDamage === i}
          onHover={() => setHoveredDamage(i)}
          onLeave={() => setHoveredDamage(null)}
          damageId={damage.id}
        />
      ))}
    </group>
  );
}

function DamageIndicator({ position, severity, color, isHovered, onHover, onLeave, damageId }) {
  const meshRef = useRef();
  const [pulse, setPulse] = useState(0);

  useFrame((state) => {
    if (meshRef.current) {
      setPulse(Math.sin(state.clock.elapsedTime * 2) * 0.5 + 0.5);
      if (isHovered) {
        meshRef.current.scale.setScalar(1 + pulse * 0.3);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[0.08]}
        onPointerOver={onHover}
        onPointerOut={onLeave}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isHovered ? pulse : 0.3}
          transparent
          opacity={0.9}
        />
      </Sphere>

      {/* Outer ring */}
      <mesh>
        <ringGeometry args={[0.12, 0.15, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>

      {isHovered && (
        <Html center>
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid #10b981',
            borderRadius: '4px',
            padding: '4px 8px',
            color: '#10b981',
            fontSize: '11px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            transform: 'translateY(-40px)'
          }}>
            Damage #{damageId}
          </div>
        </Html>
      )}
    </group>
  );
}

function MeasurementAnnotations() {
  return (
    <>
      {/* Measurement Lines and Labels */}
      <Text
        position={[-2, 3.5, 0]}
        fontSize={0.3}
        color="#10b981"
        anchorX="center"
        anchorY="middle"
      >
        13.1 SQ
      </Text>

      <Text
        position={[2, 3.5, 0]}
        fontSize={0.3}
        color="#10b981"
        anchorX="center"
        anchorY="middle"
      >
        11.4 SQ
      </Text>

      <Text
        position={[0, 4, 0]}
        fontSize={0.4}
        color="#10b981"
        anchorX="center"
        anchorY="middle"
      >
        24.5 SQ Total
      </Text>
    </>
  );
}

function House3D() {
  const [hoveredDamage, setHoveredDamage] = useState(null);

  return (
    <div className="bg-white rounded-lg border border-stone-200 p-6">
      <div className="text-center mb-4">
        <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium mb-1">
          3D Digital Twin - WebGL
        </div>
        <div className="text-[13px] text-stone-900">
          Drag to rotate • Click damage points for details
        </div>
      </div>

      <div className="relative" style={{ height: '450px' }}>
        <Canvas
          camera={{ position: [6, 5, 8], fov: 50 }}
          style={{
            background: 'linear-gradient(180deg, #e0f2fe 0%, #f0f9ff 100%)',
            borderRadius: '12px'
          }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
          <pointLight position={[-5, 5, -5]} intensity={0.4} />

          <HouseModel
            hoveredDamage={hoveredDamage}
            setHoveredDamage={setHoveredDamage}
          />

          <MeasurementAnnotations />

          {/* Ground plane */}
          <Plane args={[20, 20]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
            <meshStandardMaterial color="#e7e5e4" />
          </Plane>

          {/* Grid */}
          <gridHelper args={[20, 20, '#10b981', '#10b98130']} />

          <OrbitControls
            enablePan={false}
            maxPolarAngle={Math.PI / 2}
            minDistance={5}
            maxDistance={15}
          />
        </Canvas>
      </div>

      {/* Stats Display */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-wider text-stone-500">Affected area</div>
          <div className="font-display text-2xl text-stone-900 tabular">
            24.5 <span className="text-[11px] text-stone-500">SQ</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-wider text-stone-500">Slopes</div>
          <div className="font-display text-2xl text-stone-900">
            2<span className="text-[11px] text-stone-500"> of 4</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-wider text-stone-500">Pitch</div>
          <div className="font-display text-2xl text-stone-900 tabular">6/12</div>
        </div>
      </div>

      {hoveredDamage !== null && (
        <div className="mt-4 p-3 bg-stone-50 rounded-lg border border-stone-200">
          <div className="text-[12px] font-medium text-stone-900">
            Damage Point #{hoveredDamage + 1}
          </div>
          <div className="text-[11px] text-stone-600 mt-1">
            Click for detailed analysis and photos
          </div>
        </div>
      )}
    </div>
  );
}

export default House3D;