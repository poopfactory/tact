/**
 * Classic waveshaper "amount" curve (Aidoo/Chris Wilson formula) for a
 * WaveShaperNode. `amount` roughly controls how hard the curve bends -
 * this engine keeps that fixed and drives perceived intensity through the
 * wet/dry mix instead (see DISTORTION_CURVE_AMOUNT in AudioEngine.ts).
 */
export function makeDistortionCurve(amount: number, sampleCount = 2048): Float32Array<ArrayBuffer> {
  const curve = new Float32Array(new ArrayBuffer(sampleCount * Float32Array.BYTES_PER_ELEMENT))
  const deg = Math.PI / 180
  for (let i = 0; i < sampleCount; i++) {
    const x = (i * 2) / sampleCount - 1
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x))
  }
  return curve
}
