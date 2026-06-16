import type { BikerKey } from './bikers'
import type { RadioChannel } from './radios'

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
    selectedRadio: 'channel_1' as RadioChannel,
    menuSoundEnabled: true,
    gameSoundEnabled: true,
}