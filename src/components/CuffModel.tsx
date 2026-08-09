import { Suspense, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Bounds, Center, Environment, OrbitControls, useGLTF } from '@react-three/drei'
import type { Group } from 'three'
import { useDeviceTilt } from './useDeviceTilt'

const MODEL_URL = '/models/tact-cuff.glb'

function CuffMesh({
  followCursor = false,
  tiltRef,
}: {
  followCursor?: boolean
  /** Phone-tilt reading (see useDeviceTilt) — 0,0 on desktop, where the
   * cursor position drives this instead. */
  tiltRef?: MutableRefObject<{ x: number; y: number }>
}) {
  const group = useRef<Group>(null)
  const { scene } = useGLTF(MODEL_URL)

  useFrame((state) => {
    if (!followCursor || !group.current) return
    // Lerp toward the cursor/tilt-driven target each frame instead of
    // setting rotation directly — a hard snap reads as jittery, this
    // reads as the object settling toward wherever the input points.
    // Pointer is 0,0 with no mouse (most phones) and tilt is 0,0 with no
    // orientation sensor (desktop), so summing both just picks up
    // whichever input the device actually has.
    const tiltX = tiltRef?.current.x ?? 0
    const tiltY = tiltRef?.current.y ?? 0
    const targetY = (state.pointer.x + tiltX) * 0.6
    const targetX = (state.pointer.y - tiltY) * -0.3
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

// Hero placement — floats in the key visual, tilts to follow the cursor
// on desktop and the phone's own tilt on mobile (there's no hover to
// follow there), no drag control (that's reserved for the Shop gallery
// below).
export function HeroCuffModel({ className = '' }: { className?: string }) {
  const { tiltRef, permissionNeeded, requestAccess } = useDeviceTilt()

  return (
    <>
      <div className={className}>
        <Canvas camera={{ position: [0, 0, 4.2], fov: 35 }} dpr={[1, 2]}>
          <Suspense fallback={null}>
            <CuffMesh followCursor tiltRef={tiltRef} />
            <Lighting />
          </Suspense>
        </Canvas>
      </div>
      {/* iOS gates the orientation sensor behind a tap — everywhere else
          it just works, so this only ever shows on iOS Safari/mobile. */}
      {permissionNeeded && (
        <button
          type="button"
          onClick={requestAccess}
          className="fixed bottom-10 left-1/2 z-20 -translate-x-1/2 rounded-full border border-steel-2 bg-white/80 px-4 py-2 font-sans text-xs uppercase tracking-widest text-bone backdrop-blur-xl transition-colors hover:border-acid hover:text-acid md:hidden"
        >
          Tilt to Explore
        </button>
      )}
    </>
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
