import type { BikerKey } from './bikers'

export type BackgroundKey =
    | 'suburb'
    | 'highway'
    | 'industrial'
    | 'los_angeles'
    | 'ny'
    | 'las_vegas'
    | 'miami'

export const GAME_STATE = {
    biker: 'portugal' as BikerKey,
    background: 'suburb' as BackgroundKey,
    menuSoundEnabled: true,
    gameSoundEnabled: true,
}