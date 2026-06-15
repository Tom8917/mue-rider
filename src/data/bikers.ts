export type BikerKey = 'portugal' | 'brazil' | 'usa'

export type BikerConfig = {
    key: BikerKey
    label: string
    folder: string

    container: {
        x: number
        y: number
    }

    bike: {
        x: number
        y: number
        scale: number
    }

    rider: {
        normal: {
            x: number
            y: number
            scale: number
            angle: number
        }

        hand: {
            x: number
            y: number
            scale: number
            angle: number
        }

        knee: {
            x: number
            y: number
            scale: number
            angle: number
        }
    }

    rearWheel: {
        x: number
        y: number
        scale: number
    }

    frontWheel: {
        x: number
        y: number
        scale: number
    }

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

        bike: { x: 100, y: -55, scale: 0.50 },

        rider: {
            normal: {
                x: 90,
                y: -110,
                scale: 0.37,
                angle: 5
            },

            hand: {
                x: 75,
                y: -90,
                scale: 0.38,
                angle: 20
            },

            knee: {
                x: 100,
                y: -140,
                scale: 0.38,
                angle: 20
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
            gasPower: 14,
            brakePower: 22,
            gravityDown: 4.5,
            gravityBack: 2.2,
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
            normal: {
                x: 100,
                y: -125,
                scale: 0.47,
                angle: -7
            },

            hand: {
                x: 85,
                y: -120,
                scale: 0.49,
                angle: 40
            },

            knee: {
                x: 130,
                y: -155,
                scale: 0.48,
                angle: 55
            },
        },

        rearWheel: { x: 24, y: -21, scale: 0.58 },
        frontWheel: { x: 234, y: -20, scale: 0.58 },

        sparks: {
            small: { x: -35, y: -125, scale: 0.35 },
            big: { x: -20, y: -135, scale: 0.35 },
            angle: -270,
            flipX: true,
        },

        physics: {
            gasPower: 16,
            brakePower: 22,
            gravityDown: 4.4,
            gravityBack: 2.1,
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
            normal: {
                x: 120,
                y: -125,
                scale: 0.35,
                angle: 5
            },

            hand: {
                x: 82,
                y: -130,
                scale: 0.47,
                angle: 20
            },

            knee: {
                x: 120,
                y: -170,
                scale: 0.45,
                angle: 20
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
            gasPower: 19,
            brakePower: 28,
            gravityDown: 5.2,
            gravityBack: 3,
            acceleration: 22,
            maxSpeed: 720,
        },
    },
}