import { useState } from 'react'
import type { CommandBus } from '../commands/commandBus'
import type { EngineState } from '../audio/types'
import type { GestureMapperState } from '../gesture/gestureMapper'
import { HoldButton } from './HoldButton'
import './SidePanel.css'

interface RightEffectPanelProps {
  bus: CommandBus
  engineState: EngineState
  gesture: GestureMapperState | null
}

function emitFactory(bus: CommandBus) {
  return (type: Parameters<CommandBus['emit']>[0], payload: never) =>
    bus.emit(type as never, payload, { source: 'simulation', hand: 'Right', now: performance.now() })
}

export function RightEffectPanel({ bus, engineState, gesture }: RightEffectPanelProps) {
  const emit = emitFactory(bus)

  const indexActive = !!gesture?.index.isPinching
  const middleActive = !!gesture?.middle.isPinching
  const ringActive = !!gesture?.ring.isPinching
  const pinkyActive = !!gesture?.pinky.isPinching

  const [distortionSlider, setDistortionSlider] = useState(0)

  return (
    <section className="side-panel side-panel--right" aria-label="오른손 컨트롤 - 이펙트">
      <h2 className="side-panel__title">
        <span className="side-panel__dot side-panel__dot--right" aria-hidden="true" />
        DECK R
        <span className="side-panel__subtitle">EFFECTS</span>
      </h2>

      <div className={`gesture-card ${indexActive ? 'gesture-card--active' : ''}`}>
        <HoldButton
          className="gesture-card__button"
          label={`Phaser ${engineState.phaser.enabled ? 'On' : 'Off'}`}
          active={indexActive}
          onPress={() => {}}
          onRelease={() => emit('PHASER_TOGGLE', undefined as never)}
        />
        <label className="gesture-card__slider-label" htmlFor="phaser-amount">
          Wet mix · <span className="readout">{Math.round(engineState.phaser.wet * 100)}%</span>
        </label>
        <input
          id="phaser-amount"
          type="range"
          min={0}
          max={100}
          defaultValue={55}
          className="gesture-card__slider"
          aria-label="페이저 wet mix 시뮬레이션 슬라이더"
          onChange={(e) => emit('PHASER_AMOUNT', { value: Number(e.target.value) / 100 } as never)}
        />
      </div>

      <div className={`gesture-card ${middleActive ? 'gesture-card--active' : ''}`}>
        <HoldButton
          className="gesture-card__button"
          label={`Flanger ${engineState.flanger.enabled ? 'On' : 'Off'}`}
          active={middleActive}
          onPress={() => {}}
          onRelease={() => emit('FLANGER_TOGGLE', undefined as never)}
        />
        <label className="gesture-card__slider-label" htmlFor="flanger-amount">
          Wet mix · <span className="readout">{Math.round(engineState.flanger.wet * 100)}%</span>
        </label>
        <input
          id="flanger-amount"
          type="range"
          min={0}
          max={100}
          defaultValue={35}
          className="gesture-card__slider"
          aria-label="플랜저 wet mix 시뮬레이션 슬라이더"
          onChange={(e) => emit('FLANGER_AMOUNT', { value: Number(e.target.value) / 100 } as never)}
        />
      </div>

      <div className={`gesture-card ${ringActive ? 'gesture-card--active' : ''}`}>
        <p className="gesture-card__title">Distortion</p>
        <p className="gesture-card__hint">
          Thumb + Ring · drive <span className="readout">{Math.round(engineState.distortion.amount * 100)}%</span>
        </p>
        <input
          type="range"
          min={0}
          max={100}
          value={distortionSlider}
          className="gesture-card__slider"
          aria-label="디스토션 드라이브 시뮬레이션 슬라이더 - 조절 후 그대로 유지됩니다"
          onChange={(e) => {
            const v = Number(e.target.value)
            setDistortionSlider(v)
            emit('DISTORTION_AMOUNT', { value: v / 100 } as never)
          }}
        />
      </div>

      <div className={`gesture-card ${pinkyActive ? 'gesture-card--active' : ''}`}>
        <p className="gesture-card__title">Filter</p>
        <p className="gesture-card__hint">
          Thumb + Pinky · {engineState.filter.type === 'highpass' ? 'High-pass' : 'Low-pass'} ·{' '}
          <span className="readout">{Math.round(engineState.filter.frequency)}Hz</span>
        </p>
        <input
          type="range"
          min={-100}
          max={100}
          value={Math.round(engineState.filter.value * 100)}
          className="gesture-card__slider"
          aria-label="필터 하이패스/로우패스 시뮬레이션 슬라이더 - 조절 후 그대로 유지됩니다 (위: 하이패스, 아래: 로우패스)"
          onChange={(e) => emit('FILTER_CHANGE', { value: Number(e.target.value) / 100, released: false } as never)}
        />
      </div>
    </section>
  )
}
