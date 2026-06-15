import Phaser from 'phaser'
import { BIKERS } from '../data/bikers'
import type { BikerConfig } from '../data/bikers'
import { GAME_STATE } from '../data/gameState'

export class GameScene extends Phaser.Scene {
    private background1!: Phaser.GameObjects.Image
    private background2!: Phaser.GameObjects.Image

    private currentBiker: BikerConfig = BIKERS.portugal

    private bikeSprite!: Phaser.GameObjects.Image
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
        menu: Phaser.Input.Keyboard.Key
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

    private bestScore = 0

    constructor() {
        super('GameScene')
    }

    preload() {
        this.load.image('suburb', '/assets/backgrounds/suburb.png')
        this.load.image('highway', '/assets/backgrounds/highway.png')
        this.load.image('industrial', '/assets/backgrounds/industrial.png')

        for (const biker of Object.values(BIKERS)) {
            const folder = `/assets/bikers/${biker.folder}`

            this.load.image(`${biker.key}_bike`, `${folder}/bike.png`)
            this.load.image(`${biker.key}_normal`, `${folder}/rider_normal.png`)
            this.load.image(`${biker.key}_hand`, `${folder}/rider_hand.png`)
            this.load.image(`${biker.key}_knee`, `${folder}/rider_knee.png`)
            this.load.image(`${biker.key}_front_wheel`, `${folder}/front_wheel.png`)
            this.load.image(`${biker.key}_rear_wheel`, `${folder}/rear_wheel.png`)
            this.load.image(`${biker.key}_sparks_small`, `${folder}/sparks_small.png`)
            this.load.image(`${biker.key}_sparks_big`, `${folder}/sparks_big.png`)
        }
    }

    create() {
        this.angle = 0
        this.angularVelocity = 0
        this.score = 0
        this.speed = 120
        this.isGameOver = false
        this.hasStartedWheelie = false

        this.runTime = 0

        this.bestScore = Number(localStorage.getItem('mue-rider-best-score') ?? 0)

        this.keys = this.input.keyboard!.addKeys({
            gas: Phaser.Input.Keyboard.KeyCodes.Z,
            brake: Phaser.Input.Keyboard.KeyCodes.S,
            hand: Phaser.Input.Keyboard.KeyCodes.A,
            trick: Phaser.Input.Keyboard.KeyCodes.E,
            restart: Phaser.Input.Keyboard.KeyCodes.SPACE,
            menu: Phaser.Input.Keyboard.KeyCodes.ESC
        }) as any

        this.currentBiker = BIKERS[GAME_STATE.biker]

        this.createBackground()
        this.createBike()

        this.scoreText = this.add.text(20, 70, '', {
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

        if (Phaser.Input.Keyboard.JustDown(this.keys.menu)) {
            this.scene.start('MenuScene')
            return
        }

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
            this.angularVelocity += this.currentBiker.physics.gasPower * dt
        }

        if (brake) {
            this.angularVelocity -= this.currentBiker.physics.brakePower * dt
        }

        const balanceDistance = this.angle - 90

        if (Math.abs(balanceDistance) < 4) {
            this.angularVelocity *= 0.94
        } else if (this.angle < 90) {
            this.angularVelocity -= this.currentBiker.physics.gravityDown * dt
        } else {
            this.angularVelocity += this.currentBiker.physics.gravityBack * dt
        }

        this.angularVelocity *= 0.984
        this.angle += this.angularVelocity

        this.angle = Phaser.Math.Clamp(this.angle, 0, 112)
        const targetSpeed = 120 + this.runTime * this.currentBiker.physics.acceleration
        this.speed = Phaser.Math.Clamp(targetSpeed, 120, this.currentBiker.physics.maxSpeed)

        this.bike.setRotation(Phaser.Math.DegToRad(-this.angle))

        this.frontWheel.rotation += this.speed * dt * 0.055
        this.rearWheel.rotation += this.speed * dt * 0.055

        if (this.angle > 8) {
            this.hasStartedWheelie = true
        }

        const isScrapingMudguard = this.angle >= 86 && this.angle <= 94
        const isHandTouching = hand && this.angle >= -10 && this.angle <= 100
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
        this.background1 = this.add.image(0, 0, GAME_STATE.background)
            .setOrigin(0, 0)
            .setDisplaySize(1920, 1080)

        this.background2 = this.add.image(1920, 0, GAME_STATE.background)
            .setOrigin(0, 0)
            .setDisplaySize(1920, 1080)
    }

    private updateBackground(dt: number) {
        const scrollSpeed = this.speed * dt * 1.25

        this.background1.x -= scrollSpeed
        this.background2.x -= scrollSpeed

        if (this.background1.x <= -1920) {
            this.background1.x = this.background2.x + 1920
        }

        if (this.background2.x <= -1920) {
            this.background2.x = this.background1.x + 1920
        }
    }

    private createBike() {
        const biker = this.currentBiker

        this.bikeSprite = this.add.image(
            biker.bike.x,
            biker.bike.y,
            `${biker.key}_bike`
        )
            .setOrigin(0.5)
            .setScale(biker.bike.scale)

        this.bike = this.add.container(
            biker.container.x,
            biker.container.y
        ).setDepth(20)

        this.rider = this.add.image(
            biker.rider.normal.x,
            biker.rider.normal.y,
            `${biker.key}_normal`
        )
            .setOrigin(0.5)
            .setScale(biker.rider.normal.scale)
            .setAngle(biker.rider.normal.angle)

        this.rearWheel = this.add.image(
            biker.rearWheel.x,
            biker.rearWheel.y,
            `${biker.key}_rear_wheel`
        )
            .setOrigin(0.5)
            .setScale(biker.rearWheel.scale)

        this.frontWheel = this.add.image(
            biker.frontWheel.x,
            biker.frontWheel.y,
            `${biker.key}_front_wheel`
        )
            .setOrigin(0.5)
            .setScale(biker.frontWheel.scale)

        this.sparksSmall = this.add.image(
            biker.sparks.small.x,
            biker.sparks.small.y,
            `${biker.key}_sparks_small`
        )
            .setScale(biker.sparks.small.scale)
            .setAngle(biker.sparks.angle)
            .setFlipX(biker.sparks.flipX)
            .setVisible(false)

        this.sparksBig = this.add.image(
            biker.sparks.big.x,
            biker.sparks.big.y,
            `${biker.key}_sparks_big`
        )
            .setScale(biker.sparks.big.scale)
            .setAngle(biker.sparks.angle)
            .setFlipX(biker.sparks.flipX)
            .setVisible(false)

        this.bike.add(this.rearWheel)
        this.bike.add(this.frontWheel)

        this.bike.add(this.bikeSprite)

        this.bike.add(this.rider)

        this.bike.add(this.sparksSmall)
        this.bike.add(this.sparksBig)
    }

    private updateRiderPose(
        isHandTouching: boolean,
        isKneeTrick: boolean
    ) {
        const biker = this.currentBiker

        if (isKneeTrick) {
            const pose = biker.rider.knee

            this.rider.setTexture(`${biker.key}_knee`)
            this.rider.setPosition(pose.x, pose.y)
            this.rider.setScale(pose.scale)
            this.rider.setAngle(pose.angle)

            return
        }

        if (isHandTouching) {
            const pose = biker.rider.hand

            this.rider.setTexture(`${biker.key}_hand`)
            this.rider.setPosition(pose.x, pose.y)
            this.rider.setScale(pose.scale)
            this.rider.setAngle(pose.angle)

            return
        }

        const pose = biker.rider.normal

        this.rider.setTexture(`${biker.key}_normal`)
        this.rider.setPosition(pose.x, pose.y)
        this.rider.setScale(pose.scale)
        this.rider.setAngle(pose.angle)
    }

    private getMutationLabel(): string {
        if (this.score >= 2000) return 'Niveau 3'
        if (this.score >= 800) return 'Niveau 2'
        return 'Niveau 1'
    }

    private gameOver(reason: string) {
        this.isGameOver = true
        this.angularVelocity = 0

        if (this.score > this.bestScore) {
            this.bestScore = this.score
            localStorage.setItem('mue-rider-best-score', String(this.bestScore))
        }

        this.gameOverText.setText(
            `${reason}

Score : ${this.score}
Best : ${this.bestScore}

ESPACE pour recommencer
ECHAP pour menu`
        )
    }
}