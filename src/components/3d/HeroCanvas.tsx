'use client';

import * as React from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── Brand colours ──────────────────────────────────────────────────── */
const C_BLUE   = new THREE.Color('#4DA8DA');
const C_NAVY   = new THREE.Color('#00263f');
const C_GOLD   = new THREE.Color('#C9A84C');

/* ─── Shared smooth mouse ref ────────────────────────────────────────── */
interface MouseState {
  x: number;
  y: number;
  tx: number;
  ty: number;
}

/* ─────────────────────────────────────────────────────────────────────
   FloatingShape — one translucent icosahedron
───────────────────────────────────────────────────────────────────── */
interface ShapeProps {
  position: [number, number, number];
  scale:    number;
  color:    THREE.Color;
  opacity:  number;
  speed:    number;
  rotAxis:  [number, number, number];
  mouse:    React.MutableRefObject<MouseState>;
}

function FloatingShape({ position, scale, color, opacity, speed, rotAxis, mouse }: ShapeProps) {
  const meshRef  = React.useRef<THREE.Mesh>(null!);
  const origin   = React.useRef(new THREE.Vector3(...position));

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const m = mouse.current;

    /* smooth lerp of actual position toward origin + mouse offset */
    const targetX = origin.current.x + m.x * 0.35;
    const targetY = origin.current.y + m.y * 0.25;
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.04);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.04);

    /* gentle auto-rotation */
    meshRef.current.rotation.x += delta * speed * rotAxis[0];
    meshRef.current.rotation.y += delta * speed * rotAxis[1];
    meshRef.current.rotation.z += delta * speed * rotAxis[2];
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={opacity}
        wireframe={false}
        roughness={0.15}
        metalness={0.6}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   WireFrame ring — subtle architectural circle
───────────────────────────────────────────────────────────────────── */
function WireRing({ mouse }: { mouse: React.MutableRefObject<MouseState> }) {
  const ref = React.useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.07;
    ref.current.rotation.z += delta * 0.04;
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, mouse.current.x * 0.5, 0.03);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, mouse.current.y * 0.3, 0.03);
  });

  return (
    <mesh ref={ref} position={[1.5, -0.8, -2]} rotation={[0.4, 0.3, 0]}>
      <torusGeometry args={[1.2, 0.012, 8, 60]} />
      <meshStandardMaterial color={C_GOLD} transparent opacity={0.12} roughness={0.2} metalness={0.8} />
    </mesh>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Scene — camera rig reacts to mouse
───────────────────────────────────────────────────────────────────── */
const SHAPES: Omit<ShapeProps, 'mouse'>[] = [
  { position: [-2.8,  1.2, -3],   scale: 0.55, color: C_BLUE, opacity: 0.10, speed: 0.18, rotAxis: [1, 0.6, 0.3] },
  { position: [ 2.4,  0.5, -4],   scale: 0.75, color: C_BLUE, opacity: 0.07, speed: 0.12, rotAxis: [0.4, 1, 0.5] },
  { position: [-1.0, -1.6, -3.5], scale: 0.40, color: C_GOLD, opacity: 0.09, speed: 0.22, rotAxis: [0.8, 0.3, 1] },
  { position: [ 3.2, -0.9, -5],   scale: 0.90, color: C_NAVY, opacity: 0.13, speed: 0.09, rotAxis: [0.2, 0.8, 0.4] },
  { position: [-3.5, -0.3, -6],   scale: 1.10, color: C_BLUE, opacity: 0.06, speed: 0.07, rotAxis: [0.5, 0.5, 0.5] },
  { position: [ 0.6,  2.0, -5],   scale: 0.45, color: C_GOLD, opacity: 0.08, speed: 0.20, rotAxis: [1, 0.2, 0.7] },
];

function Scene({ mouse }: { mouse: React.MutableRefObject<MouseState> }) {
  const { camera } = useThree();

  /* camera subtle parallax */
  useFrame(() => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.current.x * 0.15, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouse.current.y * 0.10, 0.05);
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[4, 6, 2]} intensity={1.2} color={C_BLUE} />
      <pointLight position={[-5, -3, -2]} intensity={0.5} color={C_GOLD} />

      {SHAPES.map((props, i) => (
        <FloatingShape key={i} {...props} mouse={mouse} />
      ))}

      <WireRing mouse={mouse} />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   HeroCanvas — exported, SSR-safe, respects reduced-motion + mobile
───────────────────────────────────────────────────────────────────── */
export function HeroCanvas() {
  const mouse     = React.useRef<MouseState>({ x: 0, y: 0, tx: 0, ty: 0 });
  const rafRef    = React.useRef<number>(0);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    /* skip on touch-only devices and reduced-motion */
    if (window.matchMedia('(hover: none)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setShow(true);

    const onMove = (e: MouseEvent) => {
      /* normalise to [-1, 1] relative to viewport centre */
      mouse.current.tx = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.current.ty = (e.clientY / window.innerHeight - 0.5) * -2;
    };

    const tick = () => {
      /* smooth lerp on JS side before passing to Three.js */
      mouse.current.x = THREE.MathUtils.lerp(mouse.current.x, mouse.current.tx, 0.06);
      mouse.current.y = THREE.MathUtils.lerp(mouse.current.y, mouse.current.ty, 0.06);
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 55 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <Scene mouse={mouse} />
      </Canvas>
    </div>
  );
}
