export interface PresetTrack {
  id: string
  title: string
  artist: string
  /** Path under public/, served as-is by Vite. */
  url: string
}

/**
 * Locally-provided tracks the user can pick without going through the file
 * dialog. Only the project owner's own original track ships with the repo.
 */
export const PRESET_TRACKS: PresetTrack[] = [
  { id: 'demo-tape', title: '똥하우스 130 (Demo Tape)', artist: 'poopfactory', url: '/tracks/ddonghouse-130.mp3' },
  { id: 'demo-tape-128', title: '똥하우스 128 (Demo Tape)', artist: 'poopfactory', url: '/tracks/ddonghouse-128.mp3' },
]
