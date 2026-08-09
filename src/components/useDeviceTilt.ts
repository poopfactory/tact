import { useEffect, useRef, useState } from 'react'

/** iOS 13+ gates DeviceOrientationEvent behind an explicit permission
 * prompt that can only be triggered from a user gesture — everywhere else
 * (Android, desktop) the event just fires with no prompt needed. */
type DeviceOrientationEventIOS = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

const GAMMA_RANGE = 30 // left/right tilt, degrees, before hitting -1..1
const BETA_BASELINE = 45 // natural "holding a phone" forward tilt, degrees
const BETA_RANGE = 30

/**
 * Normalized (-1..1) phone-tilt reading for driving the hero model's
 * rotation on mobile, where there's no cursor to hover with. Returns a
 * ref (not state) since orientation fires far more often than a render
 * loop needs — the consuming useFrame reads it directly, same pattern as
 * the cursor-follow tilt it stands in for.
 */
export function useDeviceTilt() {
  const tiltRef = useRef({ x: 0, y: 0 })
  const [permissionNeeded, setPermissionNeeded] = useState(false)

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const gamma = e.gamma ?? 0
      const beta = e.beta ?? BETA_BASELINE
      tiltRef.current.x = Math.max(-1, Math.min(1, gamma / GAMMA_RANGE))
      tiltRef.current.y = Math.max(-1, Math.min(1, (beta - BETA_BASELINE) / BETA_RANGE))
    }

    const DOE = window.DeviceOrientationEvent as DeviceOrientationEventIOS | undefined
    if (typeof DOE?.requestPermission === 'function') {
      setPermissionNeeded(true)
      return
    }
    if (!DOE) return // device has no orientation sensor (most desktops)
    window.addEventListener('deviceorientation', handleOrientation)
    return () => window.removeEventListener('deviceorientation', handleOrientation)
  }, [])

  const requestAccess = async () => {
    const DOE = window.DeviceOrientationEvent as DeviceOrientationEventIOS
    try {
      const result = await DOE.requestPermission?.()
      if (result !== 'granted') return
      window.addEventListener('deviceorientation', (e) => {
        const gamma = e.gamma ?? 0
        const beta = e.beta ?? BETA_BASELINE
        tiltRef.current.x = Math.max(-1, Math.min(1, gamma / GAMMA_RANGE))
        tiltRef.current.y = Math.max(-1, Math.min(1, (beta - BETA_BASELINE) / BETA_RANGE))
      })
      setPermissionNeeded(false)
    } catch {
      // user denied, or API unavailable — the model just stays static,
      // no error surfaced since this is a nice-to-have, not core function.
    }
  }

  return { tiltRef, permissionNeeded, requestAccess }
}
