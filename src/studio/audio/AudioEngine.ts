import type { AnyCommand, CommandBus } from '../commands/commandBus'
import { clamp, lerp } from '../shared/math'
import { AdaptiveAudioProcessor } from './AdaptiveAudio'
import { makeDistortionCurve } from './distortionCurve'
import type { EngineState, SourceMode } from './types'

const DEFAULT_PHASER_WET = 0.55
const DEFAULT_FLANGER_WET = 0.35
const FLANGER_FEEDBACK = 0.3 // fixed, deliberately conservative to avoid runaway buildup
const FLANGER_BASE_DELAY_SECONDS = 0.006
const FLANGER_LFO_DEPTH_SECONDS = 0.0035
const FLANGER_LFO_RATE_HZ = 0.22
const PHASER_STAGE_COUNT = 4
const PHASER_BASE_FREQUENCY_HZ = 700
const PHASER_LFO_DEPTH_HZ = 500
const PHASER_LFO_RATE_HZ = 0.35
const DISTORTION_CURVE_AMOUNT = 55 // fixed curve intensity; the amount knob only controls wet mix
const RAMP_TIME_CONSTANT = 0.08
const VOLUME_RAMP_PER_SECOND = 0.6

type VolumeRampDirection = 'up' | 'down' | null

function filterParamsFromValue(value: number): { type: BiquadFilterType; frequency: number } {
  if (value >= 0) {
    return { type: 'highpass', frequency: lerp(20, 6000, value) }
  }
  return { type: 'lowpass', frequency: lerp(20000, 400, -value) }
}

type Listener = (state: EngineState) => void

/**
 * Owns the entire Web Audio graph and translates semantic commands
 * (from gestures or the on-screen simulation controls - both look
 * identical here) into audio parameter changes. No hand-tracking or
 * React code lives in this file.
 */
export class AudioEngine {
  readonly context: AudioContext

  private readonly sourceGain: GainNode
  private readonly preAnalyser: AnalyserNode
  private readonly filterNode: BiquadFilterNode

  // Flanger - short LFO-modulated delay + feedback, wet/dry mixed.
  private readonly flangerDelay: DelayNode
  private readonly flangerLFO: OscillatorNode
  private readonly flangerLFODepth: GainNode
  private readonly flangerFeedback: GainNode
  private readonly flangerWet: GainNode
  private readonly flangerDry: GainNode
  private readonly postFlanger: GainNode

  // Phaser - a chain of allpass stages, all swept together by one LFO.
  private readonly phaserStages: BiquadFilterNode[]
  private readonly phaserLFO: OscillatorNode
  private readonly phaserLFODepth: GainNode
  private readonly phaserWet: GainNode
  private readonly phaserDry: GainNode
  private readonly postPhaser: GainNode

  // Distortion - fixed waveshaper curve; the "amount" knob is purely the
  // wet/dry mix, so it reads as a drive knob rather than a hard on/off.
  private readonly distortionShaper: WaveShaperNode
  private readonly distortionWet: GainNode
  private readonly distortionDry: GainNode
  private readonly postDistortion: GainNode

  private readonly adaptiveGainComp: GainNode
  private readonly masterGain: GainNode
  private readonly limiter: DynamicsCompressorNode
  private readonly outputAnalyser: AnalyserNode

  private readonly fileSourceGain: GainNode
  private readonly demoSourceGain: GainNode
  private demoOscillators: { stop: () => void } | null = null

  private readonly adaptive: AdaptiveAudioProcessor

  private audioEl: HTMLAudioElement | null = null
  private mediaSource: MediaElementAudioSourceNode | null = null
  private objectUrl: string | null = null

  private sourceMode: SourceMode = 'none'
  private fileName: string | null = null
  // Explicit flag instead of inferring "is the demo tone playing" from
  // demoSourceGain's live AudioParam value: that value only *approaches*
  // its target asymptotically (setTargetAtTime never truly reaches 0), so
  // reading it right after pause() could still read above the threshold
  // and make Pause look like it silently failed for a fraction of a second.
  private demoPlaying = false

  private volume = 0.75
  private volumeRampDirection: VolumeRampDirection = null

  private phaserEnabled = false
  private phaserAmount = DEFAULT_PHASER_WET
  private flangerEnabled = false
  private flangerAmount = DEFAULT_FLANGER_WET
  private filterValue = 0
  private distortionAmount = 0

  private lastFeedback: { message: string; at: number } | null = null
  private lastTickAt: number | null = null

  private listeners = new Set<Listener>()
  private unsubscribeBus: () => void

  constructor(bus: CommandBus) {
    const AudioContextCtor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    this.context = new AudioContextCtor()
    const ctx = this.context

    this.sourceGain = ctx.createGain()
    this.fileSourceGain = ctx.createGain()
    this.demoSourceGain = ctx.createGain()
    this.demoSourceGain.gain.value = 0

    this.preAnalyser = ctx.createAnalyser()
    this.preAnalyser.fftSize = 1024

    this.filterNode = ctx.createBiquadFilter()
    this.filterNode.type = 'highpass'
    this.filterNode.frequency.value = 20
    this.filterNode.Q.value = 0.6

    // Flanger: a short delay line whose time is swept by a slow LFO, with
    // a bit of feedback fed back into itself for resonance.
    this.flangerDelay = ctx.createDelay(0.05)
    this.flangerDelay.delayTime.value = FLANGER_BASE_DELAY_SECONDS
    this.flangerLFO = ctx.createOscillator()
    this.flangerLFO.type = 'sine'
    this.flangerLFO.frequency.value = FLANGER_LFO_RATE_HZ
    this.flangerLFODepth = ctx.createGain()
    this.flangerLFODepth.gain.value = FLANGER_LFO_DEPTH_SECONDS
    this.flangerFeedback = ctx.createGain()
    this.flangerFeedback.gain.value = FLANGER_FEEDBACK
    this.flangerWet = ctx.createGain()
    this.flangerWet.gain.value = 0
    this.flangerDry = ctx.createGain()
    this.flangerDry.gain.value = 1
    this.postFlanger = ctx.createGain()

    // Phaser: a series of allpass filters, all swept together by one LFO
    // riding on top of each stage's base frequency.
    this.phaserStages = Array.from({ length: PHASER_STAGE_COUNT }, () => {
      const stage = ctx.createBiquadFilter()
      stage.type = 'allpass'
      stage.frequency.value = PHASER_BASE_FREQUENCY_HZ
      stage.Q.value = 0.5
      return stage
    })
    this.phaserLFO = ctx.createOscillator()
    this.phaserLFO.type = 'sine'
    this.phaserLFO.frequency.value = PHASER_LFO_RATE_HZ
    this.phaserLFODepth = ctx.createGain()
    this.phaserLFODepth.gain.value = PHASER_LFO_DEPTH_HZ
    this.phaserWet = ctx.createGain()
    this.phaserWet.gain.value = 0
    this.phaserDry = ctx.createGain()
    this.phaserDry.gain.value = 1
    this.postPhaser = ctx.createGain()

    // Distortion: fixed waveshaper curve, wet/dry-mixed so the amount knob
    // reads as "how much drive is blended in" rather than a hard toggle.
    this.distortionShaper = ctx.createWaveShaper()
    this.distortionShaper.curve = makeDistortionCurve(DISTORTION_CURVE_AMOUNT)
    this.distortionShaper.oversample = '4x'
    this.distortionWet = ctx.createGain()
    this.distortionWet.gain.value = 0
    this.distortionDry = ctx.createGain()
    this.distortionDry.gain.value = 1
    this.postDistortion = ctx.createGain()

    this.adaptiveGainComp = ctx.createGain()
    this.masterGain = ctx.createGain()
    this.masterGain.gain.value = this.volume

    this.limiter = ctx.createDynamicsCompressor()
    this.limiter.threshold.value = -10
    this.limiter.knee.value = 6
    this.limiter.ratio.value = 12
    this.limiter.attack.value = 0.003
    this.limiter.release.value = 0.25

    this.outputAnalyser = ctx.createAnalyser()
    this.outputAnalyser.fftSize = 1024

    // --- wire the graph ---
    this.fileSourceGain.connect(this.sourceGain)
    this.demoSourceGain.connect(this.sourceGain)

    this.sourceGain.connect(this.preAnalyser)
    this.preAnalyser.connect(this.filterNode)

    // Flanger stage
    this.filterNode.connect(this.flangerDry)
    this.filterNode.connect(this.flangerDelay)
    this.flangerDelay.connect(this.flangerFeedback)
    this.flangerFeedback.connect(this.flangerDelay)
    this.flangerDelay.connect(this.flangerWet)
    this.flangerDry.connect(this.postFlanger)
    this.flangerWet.connect(this.postFlanger)
    this.flangerLFO.connect(this.flangerLFODepth)
    this.flangerLFODepth.connect(this.flangerDelay.delayTime)

    // Phaser stage - the allpass chain runs in series, then wet/dry mixed
    // against the flanger's output.
    this.postFlanger.connect(this.phaserDry)
    this.postFlanger.connect(this.phaserStages[0])
    for (let i = 0; i < this.phaserStages.length - 1; i++) {
      this.phaserStages[i].connect(this.phaserStages[i + 1])
    }
    this.phaserStages[this.phaserStages.length - 1].connect(this.phaserWet)
    this.phaserDry.connect(this.postPhaser)
    this.phaserWet.connect(this.postPhaser)
    this.phaserLFO.connect(this.phaserLFODepth)
    for (const stage of this.phaserStages) this.phaserLFODepth.connect(stage.frequency)

    // Distortion stage
    this.postPhaser.connect(this.distortionDry)
    this.postPhaser.connect(this.distortionShaper)
    this.distortionShaper.connect(this.distortionWet)
    this.distortionDry.connect(this.postDistortion)
    this.distortionWet.connect(this.postDistortion)

    this.postDistortion.connect(this.adaptiveGainComp)
    this.adaptiveGainComp.connect(this.masterGain)
    this.masterGain.connect(this.limiter)
    this.limiter.connect(this.outputAnalyser)
    this.outputAnalyser.connect(ctx.destination)

    this.adaptive = new AdaptiveAudioProcessor(this.preAnalyser, this.outputAnalyser)

    this.flangerLFO.start()
    this.phaserLFO.start()

    this.unsubscribeBus = bus.subscribe((command) => this.handleCommand(command))
    this.startDemoOscillators()
  }

  // ---------- public API ----------

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    listener(this.getState())
    return () => this.listeners.delete(listener)
  }

  /** Bin count for arrays passed to getFrequencyData/getWaveformData. */
  get visualizerBinCount(): number {
    return this.outputAnalyser.frequencyBinCount
  }

  /**
   * Post-effects, post-limiter frequency spectrum (0-255 per bin) - "what
   * you actually hear", for driving visuals. Always live, independent of
   * the Adaptive Audio toggle. Pass a reusable array to avoid allocating
   * one every animation frame.
   */
  getFrequencyData(target?: Uint8Array<ArrayBuffer>): Uint8Array<ArrayBuffer> {
    const out = target ?? new Uint8Array(this.outputAnalyser.frequencyBinCount)
    this.outputAnalyser.getByteFrequencyData(out)
    return out
  }

  /** Post-effects time-domain waveform (0-255, 128 = silence), for visuals. */
  getWaveformData(target?: Uint8Array<ArrayBuffer>): Uint8Array<ArrayBuffer> {
    const out = target ?? new Uint8Array(this.outputAnalyser.fftSize)
    this.outputAnalyser.getByteTimeDomainData(out)
    return out
  }

  async resumeContext(): Promise<void> {
    if (this.context.state === 'suspended') await this.context.resume()
  }

  async loadFile(file: File): Promise<void> {
    await this.resumeContext()
    this.teardownFileSource()

    const url = URL.createObjectURL(file)
    const audio = new Audio()
    audio.src = url
    audio.crossOrigin = 'anonymous'

    audio.addEventListener('timeupdate', this.handleTimeUpdate)
    audio.addEventListener('loadedmetadata', this.handleTimeUpdate)
    audio.addEventListener('play', this.notify)
    audio.addEventListener('pause', this.notify)
    audio.addEventListener('ended', this.notify)

    this.audioEl = audio
    this.objectUrl = url
    this.fileName = file.name
    this.mediaSource = this.context.createMediaElementSource(audio)
    this.mediaSource.connect(this.fileSourceGain)

    this.demoPlaying = false
    this.setDemoEnabled(false)
    this.sourceMode = 'file'
    this.notify()
  }

  /** Loads a track bundled with the app (e.g. `/tracks/foo.mp3`) through the exact same path as a user-picked file. */
  async loadUrl(url: string, displayName: string): Promise<void> {
    const response = await fetch(url)
    const blob = await response.blob()
    const file = new File([blob], displayName, { type: blob.type || 'audio/mpeg' })
    await this.loadFile(file)
  }

  private teardownFileSource(): void {
    if (this.audioEl) {
      this.audioEl.pause()
      this.audioEl.removeEventListener('timeupdate', this.handleTimeUpdate)
      this.audioEl.removeEventListener('loadedmetadata', this.handleTimeUpdate)
      this.audioEl.removeEventListener('play', this.notify)
      this.audioEl.removeEventListener('pause', this.notify)
      this.audioEl.removeEventListener('ended', this.notify)
      this.audioEl.src = ''
      this.audioEl = null
    }
    if (this.mediaSource) {
      this.mediaSource.disconnect()
      this.mediaSource = null
    }
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl)
      this.objectUrl = null
    }
  }

  async play(): Promise<void> {
    await this.resumeContext()
    if (this.sourceMode === 'file' && this.audioEl) {
      await this.audioEl.play()
    } else {
      // No file loaded (sourceMode is still 'none') - fall back to the demo
      // tone so pressing Play always produces audible feedback. Must flip
      // sourceMode to 'demo' here, or isPlaying() keeps reading 'none' and
      // stays stuck reporting false forever, which made Pause a no-op.
      this.sourceMode = 'demo'
      this.demoPlaying = true
      this.setDemoEnabled(true)
    }
    this.notify()
  }

  pause(): void {
    if (this.sourceMode === 'file' && this.audioEl) {
      this.audioEl.pause()
    } else {
      this.demoPlaying = false
      this.setDemoEnabled(false)
    }
    this.notify()
  }

  async togglePlayPause(): Promise<void> {
    const wasPlaying = this.isPlaying()
    if (wasPlaying) this.pause()
    else await this.play()
    this.flashFeedback(wasPlaying ? 'Pause' : 'Play')
  }

  seek(time: number): void {
    if (this.audioEl) this.audioEl.currentTime = clamp(time, 0, this.audioEl.duration || 0)
    this.notify()
  }

  setMasterVolume(value: number): void {
    this.volume = clamp(value, 0, 1)
    this.notify()
  }

  setDemoSignalEnabled(enabled: boolean): void {
    if (enabled) {
      this.teardownFileSource()
      this.sourceMode = 'demo'
      this.fileName = null
      this.demoPlaying = true
      this.setDemoEnabled(true)
    } else {
      this.demoPlaying = false
      this.setDemoEnabled(false)
      this.sourceMode = 'none'
    }
    this.notify()
  }

  setAdaptiveEnabled(enabled: boolean): void {
    this.adaptive.setEnabled(enabled)
    this.notify()
  }

  isPlaying(): boolean {
    if (this.sourceMode === 'file') return !!this.audioEl && !this.audioEl.paused
    if (this.sourceMode === 'demo') return this.demoPlaying
    return false
  }

  /** Advance time-based ramps (volume hold) and adaptive analysis. Call every animation frame. */
  tick(nowMs: number): void {
    const dt = this.lastTickAt === null ? 1 / 60 : Math.min(0.1, (nowMs - this.lastTickAt) / 1000)
    this.lastTickAt = nowMs

    if (this.volumeRampDirection) {
      const delta = VOLUME_RAMP_PER_SECOND * dt * (this.volumeRampDirection === 'up' ? 1 : -1)
      this.volume = clamp(this.volume + delta, 0, 1)
    }
    this.masterGain.gain.setTargetAtTime(this.volume, this.context.currentTime, RAMP_TIME_CONSTANT)

    const telemetry = this.adaptive.process()
    const ceiling = telemetry.wetCeiling

    const phaserTarget = this.phaserEnabled ? this.phaserAmount * ceiling : 0
    this.phaserWet.gain.setTargetAtTime(phaserTarget, this.context.currentTime, RAMP_TIME_CONSTANT)

    const flangerTarget = this.flangerEnabled ? this.flangerAmount * ceiling : 0
    this.flangerWet.gain.setTargetAtTime(flangerTarget, this.context.currentTime, RAMP_TIME_CONSTANT)
    // Extra feedback safety margin when the source is bass-heavy (ceiling drops -> pull feedback down too).
    const feedbackTarget = FLANGER_FEEDBACK * clamp(0.5 + ceiling * 0.5, 0, 1)
    this.flangerFeedback.gain.setTargetAtTime(feedbackTarget, this.context.currentTime, RAMP_TIME_CONSTANT)

    const distortionTarget = this.distortionAmount * ceiling
    this.distortionWet.gain.setTargetAtTime(distortionTarget, this.context.currentTime, RAMP_TIME_CONSTANT)

    this.adaptiveGainComp.gain.setTargetAtTime(telemetry.gainCompensation, this.context.currentTime, RAMP_TIME_CONSTANT)

    this.notify()
  }

  getState(): EngineState {
    const filterParams = filterParamsFromValue(this.filterValue)
    return {
      contextState: this.context.state,
      sourceMode: this.sourceMode,
      fileName: this.fileName,
      isPlaying: this.isPlaying(),
      currentTime: this.audioEl?.currentTime ?? 0,
      duration: this.audioEl?.duration && Number.isFinite(this.audioEl.duration) ? this.audioEl.duration : 0,
      volume: this.volume,
      phaser: { enabled: this.phaserEnabled, wet: this.phaserWet.gain.value },
      flanger: { enabled: this.flangerEnabled, wet: this.flangerWet.gain.value },
      filter: { value: this.filterValue, type: filterParams.type, frequency: this.filterNode.frequency.value },
      distortion: { amount: this.distortionWet.gain.value },
      adaptive: this.adaptive.getSnapshot(),
      lastFeedback: this.lastFeedback,
    }
  }

  dispose(): void {
    this.unsubscribeBus()
    this.teardownFileSource()
    this.demoOscillators?.stop()
    this.flangerLFO.stop()
    this.phaserLFO.stop()
    void this.context.close()
    this.listeners.clear()
  }

  // ---------- command handling ----------

  private handleCommand(command: AnyCommand): void {
    switch (command.type) {
      case 'PLAY_PAUSE':
        void this.togglePlayPause()
        break
      case 'VOLUME_UP_START':
        this.volumeRampDirection = 'up'
        break
      case 'VOLUME_UP_END':
        if (this.volumeRampDirection === 'up') this.volumeRampDirection = null
        break
      case 'VOLUME_DOWN_START':
        this.volumeRampDirection = 'down'
        break
      case 'VOLUME_DOWN_END':
        if (this.volumeRampDirection === 'down') this.volumeRampDirection = null
        break
      case 'PHASER_TOGGLE':
        this.phaserEnabled = !this.phaserEnabled
        this.flashFeedback(`Phaser ${this.phaserEnabled ? 'On' : 'Off'}`)
        break
      case 'PHASER_AMOUNT':
        this.phaserAmount = clamp(command.payload.value, 0, 1)
        break
      case 'FLANGER_TOGGLE':
        this.flangerEnabled = !this.flangerEnabled
        this.flashFeedback(`Flanger ${this.flangerEnabled ? 'On' : 'Off'}`)
        break
      case 'FLANGER_AMOUNT':
        this.flangerAmount = clamp(command.payload.value, 0, 1)
        break
      case 'FILTER_CHANGE':
        this.filterValue = clamp(command.payload.value, -1, 1)
        this.applyFilterImmediate()
        break
      case 'DISTORTION_AMOUNT':
        this.distortionAmount = clamp(command.payload.value, 0, 1)
        break
    }
    // No notify() here on purpose. The tick() loop already calls notify()
    // every animation frame regardless, so this would just be a duplicate,
    // same-frame re-render - and PHASER_AMOUNT/FLANGER_AMOUNT/FILTER_CHANGE/DISTORTION_AMOUNT
    // fire on *every tracked hand frame* while a right-hand pinch is held,
    // which was doubling React's render rate for the whole app during
    // continuous right-hand gestures. On mobile, with hand-tracking
    // inference already competing for the main thread, that was enough
    // contention to stutter both the UI and (via decode starvation) audio
    // playback. Any state change here shows up within one frame (~16ms)
    // via the next tick() anyway - imperceptible, and much cheaper.
  }

  private applyFilterImmediate(): void {
    const { type, frequency } = filterParamsFromValue(this.filterValue)
    if (this.filterNode.type !== type) this.filterNode.type = type
    this.filterNode.frequency.setTargetAtTime(frequency, this.context.currentTime, RAMP_TIME_CONSTANT)
  }

  private flashFeedback(message: string): void {
    this.lastFeedback = { message, at: Date.now() }
  }

  // ---------- demo signal (works with no file loaded, for testing gestures) ----------

  private startDemoOscillators(): void {
    const ctx = this.context
    const osc1 = ctx.createOscillator()
    osc1.type = 'sawtooth'
    osc1.frequency.value = 110
    const osc2 = ctx.createOscillator()
    osc2.type = 'triangle'
    osc2.frequency.value = 164.81 // fifth above

    const mix = ctx.createGain()
    mix.gain.value = 0.18
    osc1.connect(mix)
    osc2.connect(mix)
    mix.connect(this.demoSourceGain)

    osc1.start()
    osc2.start()

    this.demoOscillators = {
      stop: () => {
        osc1.stop()
        osc2.stop()
      },
    }
  }

  private setDemoEnabled(enabled: boolean): void {
    this.demoSourceGain.gain.setTargetAtTime(enabled ? 1 : 0, this.context.currentTime, RAMP_TIME_CONSTANT)
  }

  // ---------- internal ----------

  private handleTimeUpdate = (): void => {
    this.notify()
  }

  private notify = (): void => {
    const state = this.getState()
    for (const l of this.listeners) l(state)
  }
}
