export interface PhaserState {
  enabled: boolean
  wet: number
}

export interface FlangerState {
  enabled: boolean
  wet: number
}

export interface FilterState {
  /** -1 (full low-pass) .. 0 (neutral) .. 1 (full high-pass), as last commanded. */
  value: number
  type: BiquadFilterType
  frequency: number
}

export interface DistortionState {
  /** 0 (clean, bypassed) .. 1 (fully driven), as the actual (ramped) wet mix. */
  amount: number
}

export interface AdaptiveState {
  enabled: boolean
  loudness: number
  bassEnergy: number
  complexity: number
  wetCeiling: number
  gainCompensation: number
}

export type SourceMode = 'file' | 'demo' | 'none'

export interface EngineState {
  contextState: AudioContextState
  sourceMode: SourceMode
  fileName: string | null
  isPlaying: boolean
  currentTime: number
  duration: number
  /** Master output level 0..1 - shared by the left-hand gesture ramp and the bottom-bar slider. */
  volume: number
  phaser: PhaserState
  flanger: FlangerState
  filter: FilterState
  distortion: DistortionState
  adaptive: AdaptiveState
  lastFeedback: { message: string; at: number } | null
}
