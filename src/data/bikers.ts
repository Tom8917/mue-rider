export type BikerKey = 'portugal' | 'brazil' | 'usa'

export type RiderPoseConfig = {
    x: number
    y: number
    scale: number
    angle: number
    flipX?: boolean
    flipY?: boolean
}

export type BikerConfig = {
    key: BikerKey
    label: string
    folder: string

    container: { x: number; y: number }

    bike: { x: number; y: number; scale: number }

    rider: {
        normal: RiderPoseConfig
        hand: RiderPoseConfig
        knee: RiderPoseConfig
        crash: RiderPoseConfig

        mutant: {
            normal: RiderPoseConfig
            hand: RiderPoseConfig
            knee: RiderPoseConfig
            crash: RiderPoseConfig
        }
    }

    rearWheel: { x: number; y: number; scale: number }
    frontWheel: { x: number; y: number; scale: number }

    sparks: {
        small: { x: number; y: number; scale: number }
        big: { x: number; y: number; scale: number }
        angle: number
        flipX: boolean
    }

    physics: {
        gasPower: number
        brakePower: number
        gravityDown: number
        gravityBack: number
        acceleration: number
        maxSpeed: number
    }
}

export const BIKERS: Record<BikerKey, BikerConfig> = {
    portugal: {
        key: 'portugal',
        label: 'Portugal - Yamaha YBR125',
        folder: 'portugal',

        container: { x: 300, y: 920 },
        bike: { x: 100, y: -55, scale: 0.52 },

        rider: {
            normal: { x: 95, y: -105, scale: 0.37, angle: -5 },
            hand: { x: 75, y: -90, scale: 0.38, angle: 20 },
            knee: { x: 95, y: -140, scale: 0.38, angle: 20 },
            crash: { x: 40, y: -150, scale: 0.42, angle: -85, flipY: true },

            mutant: {
                normal: { x: 85, y: -115, scale: 0.40, angle: 5 },
                hand: { x: 55, y: -105, scale: 0.41, angle: 20 },
                knee: { x: 85, y: -160, scale: 0.41, angle: 15 },
                crash: { x: 50, y: -150, scale: 0.45, angle: -110, flipY: true },
            },
        },

        rearWheel: { x: 22, y: -16, scale: 0.42 },
        frontWheel: { x: 200, y: -15, scale: 0.42 },

        sparks: {
            small: { x: -9, y: -105, scale: 0.30 },
            big: { x: 3, y: -105, scale: 0.30 },
            angle: -270,
            flipX: true,
        },

        physics: {
            gasPower: 12,
            brakePower: 8,
            gravityDown: 4.5,
            gravityBack: 1.8,
            acceleration: 14,
            maxSpeed: 620,
        },
    },

    brazil: {
        key: 'brazil',
        label: 'Brésil - Triumph 400',
        folder: 'brazil',

        container: { x: 300, y: 920 },
        bike: { x: 110, y: -65, scale: 0.52 },

        rider: {
            normal: { x: 100, y: -125, scale: 0.47, angle: -7 },
            hand: { x: 85, y: -120, scale: 0.49, angle: 40 },
            knee: { x: 130, y: -155, scale: 0.48, angle: 55 },
            crash: { x: 60, y: -180, scale: 0.42, angle: -60 },

            mutant: {
                normal: { x: 100, y: -130, scale: 0.55, angle: -7 },
                hand: { x: 70, y: -130, scale: 0.52, angle: 40 },
                knee: { x: 128, y: -195, scale: 0.57, angle: 70 },
                crash: {  x: 60, y: -180, scale: 0.50, angle: -60 },
            },
        },

        rearWheel: { x: 24, y: -21, scale: 0.58 },
        frontWheel: { x: 234, y: -20, scale: 0.58 },

        sparks: {
            small: { x: -5, y: -135, scale: 0.35 },
            big: { x: 10, y: -150, scale: 0.35 },
            angle: -270,
            flipX: true,
        },

        physics: {
            gasPower: 16,
            brakePower: 14,
            gravityDown: 4.4,
            gravityBack: 2,
            acceleration: 16,
            maxSpeed: 650,
        },
    },

    usa: {
        key: 'usa',
        label: 'USA - Yamaha YZ450',
        folder: 'usa',

        container: { x: 300, y: 920 },
        bike: { x: 110, y: -65, scale: 0.55 },

        rider: {
            normal: { x: 120, y: -125, scale: 0.35, angle: 5 },
            hand: { x: 82, y: -130, scale: 0.47, angle: 20 },
            knee: { x: 120, y: -170, scale: 0.45, angle: 20 },
            crash: { x: 60, y: -150, scale: 0.42, angle: 100, flipY: true },

            mutant: {
                normal: { x: 95, y: -130, scale: 0.46, angle: 5 },
                hand: { x: 75, y: -130, scale: 0.50, angle: 20 },
                knee: { x: 100, y: -180, scale: 0.50, angle: 12 },
                crash: { x: 40, y: -120, scale: 0.42, angle: -80, flipX: true },
            },
        },

        rearWheel: { x: 5, y: -10, scale: 0.55 },
        frontWheel: { x: 225, y: -15, scale: 0.55 },

        sparks: {
            small: { x: -35, y: -125, scale: 0.35 },
            big: { x: -20, y: -135, scale: 0.35 },
            angle: -270,
            flipX: true,
        },

        physics: {
            gasPower: 16,
            brakePower: 10,
            gravityDown: 5.2,
            gravityBack: 1.3,
            acceleration: 22,
            maxSpeed: 720,
        },
    },
}