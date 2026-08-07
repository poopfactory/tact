import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Bounds, Center, Environment, OrbitControls, useGLTF } from '@react-three/drei'
import type { Group } from 'three'

const MODEL_URL = '/models/tact-cuff.glb'

function CuffMesh({ followCursor = false }: { followCursor?: boolean }) {
  const group = useRef<Group>(null)
  const { scene } = useGLTF(MODEL_URL)

  useFrame((state) => {
    if (!followCursor || !group.current) return
    // Lerp toward the cursor-driven target each frame instead of setting
    // rotation directly — a hard snap reads as jittery, this reads as the
    // object settling toward wherever the cursor is.
    const targetY = state.pointer.x * 0.6
    const targetX = state.pointer.y * -0.3
    group.current.rotation.y += (targetY - group.current.rotation.y) * 0.06
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.06
  })

  return (
    // `Bounds` fits the camera to the model's actual bounding box instead
    // of assuming a fixed camera distance — the model file is authored at
    // its own real-world scale (a ring-sized GLB reads tiny at a distance
    // tuned for something bracelet-sized), so a static camera position
    // guesses wrong depending on what file lands here. `margin` controls
    // how tightly it fills the frame — 1 is a snug fit, no padding.
    <Bounds fit clip observe margin={1}>
      <Center>
        <group ref={group}>
          <primitive object={scene} />
        </group>
      </Center>
    </Bounds>
  )
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} />
      <Environment preset="studio" />
    </>
  )
}

// Hero placement — floats in the key visual, tilts to follow the cursor,
// no drag control (that's reserved for the Shop gallery below).
export function HeroCuffModel({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 4.2], fov: 35 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <CuffMesh followCursor />
          <Lighting />
        </Suspense>
      </Canvas>
    </div>
  )
}

// Shop gallery placement — click-and-drag orbit so a shopper can turn the
// piece over and inspect it, no cursor auto-tilt here.
export function ShopCuffModel({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 4.2], fov: 35 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <CuffMesh />
          <Lighting />
        </Suspense>
        <OrbitControls enableZoom enablePan={false} />
      </Canvas>
    </div>
  )
}

useGLTF.preload(MODEL_URL)
