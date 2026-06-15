import Phaser from 'phaser'

export class GameScene extends Phaser.Scene {
    private background1!: Phaser.GameObjects.Image
    private background2!: Phaser.GameObjects.Image

    private bike!: Phaser.GameObjects.Container
    private frontWheel!: Phaser.GameObjects.Image
    private rearWheel!: Phaser.GameObjects.Image
    private rider!: Phaser.GameObjects.Image
    private sparksSmall!: Phaser.GameObjects.Image
    private sparksBig!: Phaser.GameObjects.Image

    private keys!: {
        gas: Phaser.Input.Keyboard.Key
        brake: Phaser.Input.Keyboard.Key
        hand: Phaser.Input.Keyboard.Key
        trick: Phaser.Input.Keyboard.Key
        restart: Phaser.Input.Keyboard.Key
    }

    private angle = 0
    private angularVelocity = 0
    private score = 0
    private speed = 120
    private isGameOver = false
    private hasStartedWheelie = false

    private scoreText!: Phaser.GameObjects.Text
    private gameOverText!: Phaser.GameObjects.Text

    private runTime = 0

    constructor() {
        super('GameScene')
    }

    preload() {
        this.load.image('suburb', '/assets/backgrounds/suburb.png')

        this.load.image('front_wheel', '/assets/portugal/front_wheel.png')
        this.load.image('rear_wheel', '/assets/portugal/rear_wheel.png')

        this.load.image('rider_normal', '/assets/portugal/rider_normal.png')
        this.load.image('rider_hand_drag', '/assets/portugal/rider_hand_drag.png')
        this.load.image('rider_knee_trick', '/assets/portugal/rider_knee_trick.png')

        this.load.image('sparks_small', '/assets/portugal/sparks_small.png')
        this.load.image('sparks_big', '/assets/portugal/sparks_big.png')
    }

    create() {
        this.angle = 0
        this.angularVelocity = 0
        this.score = 0
        this.speed = 120
        this.isGameOver = false
        this.hasStartedWheelie = false

        this.runTime = 0

        this.keys = this.input.keyboard!.addKeys({
            gas: Phaser.Input.Keyboard.KeyCodes.Z,
            brake: Phaser.Input.Keyboard.KeyCodes.S,
            hand: Phaser.Input.Keyboard.KeyCodes.A,
            trick: Phaser.Input.Keyboard.KeyCodes.E,
            restart: Phaser.Input.Keyboard.KeyCodes.SPACE
        }) as any

        this.createBackground()
        this.createBike()

        this.scoreText = this.add.text(20, 20, '', {
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setDepth(50)

        this.gameOverText = this.add.text(640, 250, '', {
            fontSize: '42px',
            color: '#ff5555',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5).setDepth(60)
    }

    update(_: number, delta: number) {
        const dt = delta / 1000
        this.runTime += dt

        this.updateBackground(dt)

        if (this.isGameOver) {
            if (Phaser.Input.Keyboard.JustDown(this.keys.restart)) {
                this.scene.restart()
            }
            return
        }

        const gas = this.keys.gas.isDown
        const brake = this.keys.brake.isDown
        const hand = this.keys.hand.isDown
        const trick = this.keys.trick.isDown

        if (gas) {
            this.angularVelocity += 14 * dt
        }

        if (brake) {
            this.angularVelocity -= 22 * dt
        }

        const balanceDistance = this.angle - 90

        if (Math.abs(balanceDistance) < 4) {
            this.angularVelocity *= 0.94
        } else if (this.angle < 90) {
            this.angularVelocity -= 4.5 * dt
        } else {
            this.angularVelocity += 2.2 * dt
        }

        this.angularVelocity *= 0.984
        this.angle += this.angularVelocity

        this.angle = Phaser.Math.Clamp(this.angle, -5, 112)
        const targetSpeed = 120 + this.runTime * 6
        this.speed = Phaser.Math.Clamp(targetSpeed, 120, 520)

        this.bike.setRotation(Phaser.Math.DegToRad(-this.angle))

        this.frontWheel.rotation += this.speed * dt * 0.055
        this.rearWheel.rotation += this.speed * dt * 0.055

        if (this.angle > 8) {
            this.hasStartedWheelie = true
        }

        const isScrapingMudguard = this.angle >= 86 && this.angle <= 94
        const isHandTouching = hand && this.angle >= 10 && this.angle <= 100
        const isKneeTrick = trick && this.angle >= -10 && this.angle <= 96

        this.updateRiderPose(isHandTouching, isKneeTrick)

        this.sparksSmall.setVisible(isScrapingMudguard)
        this.sparksBig.setVisible(isScrapingMudguard && this.angle >= 89 && this.angle <= 92)

        if (this.hasStartedWheelie) {
            if (this.angle <= 0) {
                this.gameOver('Roue avant reposée')
            }

            if (this.angle >= 106) {
                this.gameOver('Chute arrière')
            }

            let multiplier = 1

            if (this.angle >= 45) multiplier = 2
            if (isKneeTrick) multiplier = 3
            if (isHandTouching) multiplier = 4
            if (isScrapingMudguard) multiplier = 5

            this.score += Math.floor(
                this.angle * (this.speed / 100) * multiplier * dt
            )
        }

        this.scoreText.setText(
            `Score : ${this.score}
Angle : ${Math.floor(this.angle)}°
Vitesse : ${Math.floor(this.speed)}
Mue : ${this.getMutationLabel()}

Z = gaz / lever
S = frein arrière
A = main arrière
E = genou sur selle`
        )
    }

    private createBackground() {
        this.background1 = this.add.image(0, 0, 'suburb')
            .setOrigin(0, 0)
            .setDisplaySize(1280, 720)

        this.background2 = this.add.image(1280, 0, 'suburb')
            .setOrigin(0, 0)
            .setDisplaySize(1280, 720)
    }

    private updateBackground(dt: number) {
        const scrollSpeed = this.speed * dt * 1.25

        this.background1.x -= scrollSpeed
        this.background2.x -= scrollSpeed

        if (this.background1.x <= -1280) {
            this.background1.x = this.background2.x + 1280
        }

        if (this.background2.x <= -1280) {
            this.background2.x = this.background1.x + 1280
        }
    }

    private createBike() {
        this.bike = this.add.container(300, 630).setDepth(20)

        // Image complète moto + biker sans roues
        this.rider = this.add.image(105, -42, 'rider_normal')
            .setOrigin(0.5)
            .setScale(0.50)

        // Roues dans les emplacements
        this.rearWheel = this.add.image(28, -16, 'rear_wheel')
            .setOrigin(0.5)
            .setScale(0.31)

        this.frontWheel = this.add.image(151, -24, 'front_wheel')
            .setOrigin(0.5)
            .setScale(0.31)

        this.sparksSmall = this.add.image(5, -80, 'sparks_small')
            .setScale(0.20)
            .setAngle(-270)
            .setFlipX(true)
            .setVisible(false)

        this.sparksBig = this.add.image(12, -92, 'sparks_big')
            .setScale(0.20)
            .setAngle(-270)
            .setFlipX(true)
            .setVisible(false)

        this.bike.add(this.rider)
        this.bike.add(this.rearWheel)
        this.bike.add(this.frontWheel)
        this.bike.add(this.sparksSmall)
        this.bike.add(this.sparksBig)
    }

    private updateRiderPose(isHandTouching: boolean, isKneeTrick: boolean) {
        if (isKneeTrick) {
            this.rider.setTexture('rider_knee_trick')
            this.rider.setPosition(85, -103)
            this.rider.setScale(0.50)
            return
        }

        if (isHandTouching) {
            this.rider.setTexture('rider_hand_drag')
            this.rider.setPosition(80, -80)
            this.rider.setScale(0.50)
            return
        }

        this.rider.setTexture('rider_normal')
        this.rider.setPosition(82, -82)
        this.rider.setScale(0.50)
    }

    private getMutationLabel(): string {
        if (this.score >= 2000) return 'Niveau 3'
        if (this.score >= 800) return 'Niveau 2'
        return 'Niveau 1'
    }

    private gameOver(reason: string) {
        this.isGameOver = true
        this.angularVelocity = 0

        this.gameOverText.setText(
            `${reason}

Score : ${this.score}

ESPACE pour recommencer`
        )
    }
}