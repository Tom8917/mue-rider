import type { BikerKey } from './bikers'

export type BackgroundKey =
    | 'suburb'
    | 'highway'
    | 'industrial'
    | 'los_angeles'
    | 'ny'
    | 'parking'

export const GAME_STATE = {
    biker: 'portugal' as const,
    background: 'suburb' as BackgroundKey,
    menuSoundEnabled: true,
    gameSoundEnabled: true,
}