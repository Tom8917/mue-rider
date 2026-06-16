import Phaser from 'phaser'
import {BIKERS} from '../data/bikers'
import type {BikerConfig} from '../data/bikers'
import {GAME_STATE} from '../data/gameState'

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

    private isMutating = false
    private mutationVisualUntil = 0

    private frontWheelSpinSpeed = 0
    private hudCamera!: Phaser.Cameras.Scene2D.Camera

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
    private speed = 100
    private isGameOver = false
    private hasStartedWheelie = false

    private riderIdleOffset = 0

    private crashReason: 'front' | 'back' | null = null

    private runTime = 0
    private bestScore = 0

    private scrapeTime = 0
    private scrapeCount = 0
    private wasScraping = false

    private combo = 1
    private comboTimer = 0
    private readonly comboMax = 4

    private mutationLevel = 1
    private readonly mutationStep = 10000
    private readonly maxMutationLevel = 5

    private scoreText!: Phaser.GameObjects.Text
    private gameOverText!: Phaser.GameObjects.Text
    private mutationText!: Phaser.GameObjects.Text

    private mobile = {
        gas: false,
        brake: false,
        hand: false,
        trick: false,
        restart: false,
        menu: false,
    }

    private gameMusic?: Phaser.Sound.BaseSound
    private scrapeSound?: Phaser.Sound.BaseSound
    private gameOverPlayed = false


    private isMobileView(): boolean {
        return this.scale.gameSize.height > this.scale.gameSize.width
    }


    constructor() {
        super('GameScene')
    }

    preload() {
        this.load.image('suburb', '/assets/backgrounds/suburb.png')
        this.load.image('highway', '/assets/backgrounds/highway.png')
        this.load.image('industrial', '/assets/backgrounds/industrial.png')
        this.load.image('los_angeles', '/assets/backgrounds/los_angeles.png')
        this.load.image('ny', '/assets/backgrounds/ny.png')
        this.load.image('las_vegas', '/assets/backgrounds/las_vegas.png')
        this.load.image('miami', '/assets/backgrounds/miami.png')

        for (const biker of Object.values(BIKERS)) {
            const folder = `/assets/bikers/${biker.folder}`

            this.load.image(`${biker.key}_bike`, `${folder}/bike.png`)

            this.load.image(`${biker.key}_normal`, `${folder}/rider_normal.png`)
            this.load.image(`${biker.key}_hand`, `${folder}/rider_hand.png`)
            this.load.image(`${biker.key}_knee`, `${folder}/rider_knee.png`)
            this.load.image(`${biker.key}_crash`, `${folder}/rider_crash.png`)
            this.load.image(`${biker.key}_normal_mutant`, `${folder}/rider_normal_mutant.png`)
            this.load.image(`${biker.key}_hand_mutant`, `${folder}/rider_hand_mutant.png`)
            this.load.image(`${biker.key}_knee_mutant`, `${folder}/rider_knee_mutant.png`)
            this.load.image(`${biker.key}_crash_mutant`, `${folder}/rider_crash_mutant.png`)

            this.load.image(`${biker.key}_front_wheel`, `${folder}/front_wheel.png`)
            this.load.image(`${biker.key}_rear_wheel`, `${folder}/rear_wheel.png`)
            this.load.image(`${biker.key}_sparks_small`, `${folder}/sparks_small.png`)
            this.load.image(`${biker.key}_sparks_big`, `${folder}/sparks_big.png`)
        }

        this.load.audio('game_music', '/assets/audio/music_1.mp3')
        this.load.audio('mutation_sound', '/assets/audio/mutation.wav')
        this.load.audio('scrape_sound', '/assets/audio/scrape.mp3')
        this.load.audio('crash_sound', '/assets/audio/crash.wav')
        this.load.audio('fail_sound', '/assets/audio/fail.wav')
    }

    create() {
        document.body.classList.add('game-active')

        this.sound.stopByKey('menu_music')
        this.sound.stopByKey('game_music')

        this.resetGameState()
        this.gameOverPlayed = false

        this.keys = this.input.keyboard!.addKeys({
            gas: Phaser.Input.Keyboard.KeyCodes.Z,
            brake: Phaser.Input.Keyboard.KeyCodes.S,
            hand: Phaser.Input.Keyboard.KeyCodes.A,
            trick: Phaser.Input.Keyboard.KeyCodes.E,
            restart: Phaser.Input.Keyboard.KeyCodes.SPACE,
            menu: Phaser.Input.Keyboard.KeyCodes.ESC
        }) as any

        window.addEventListener('mobile-input', this.handleMobileInput as EventListener)

        this.events.once('shutdown', () => {
            window.removeEventListener('mobile-input', this.handleMobileInput as EventListener)
        })

        this.currentBiker = BIKERS[GAME_STATE.biker]
        this.crashReason = null

        this.createBackground()
        this.createBike()
        this.createHud()

        this.hudCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height)
        this.hudCamera.setScroll(0, 0)
        this.hudCamera.setZoom(1)

        this.cameras.main.ignore([
            this.scoreText,
            this.gameOverText,
            this.mutationText,
        ])

        this.hudCamera.ignore([
            this.background1,
            this.background2,
            this.bike,
        ])

        if (GAME_STATE.gameSoundEnabled) {
            this.gameMusic = this.sound.add('game_music', {
                loop: true,
                volume: 0.30
            })

            this.gameMusic.play()

            this.scrapeSound = this.sound.add('scrape_sound', {
                loop: true,
                volume: 1.5
            })
        }
    }

    private handleMobileInput = (event: Event) => {
        const customEvent = event as CustomEvent<{
            action: keyof GameScene['mobile']
            down: boolean
        }>

        const { action, down } = customEvent.detail

        if (action in this.mobile) {
            this.mobile[action] = down
        }
    }

    private updateCameraEffects() {
        const camera = this.cameras.main

        const mobile = this.isMobileView()
        let targetZoom = mobile ? 2.65 : 1

        // zone moyenne dangereuse
        if (this.angle >= 60) {
            targetZoom = mobile ? 2.72 : 1.02
        }

        // bavette
        if (this.angle >= 84 && this.angle <= 96) {
            targetZoom = mobile ? 2.82 : 1.05

            // micro shake bavette
            if (Math.random() < 0.08) {
                camera.shake(60, 0.0015)
            }
        }

        // ultra dangereux proche chute arrière
        if (this.angle >= 105) {
            targetZoom = mobile ? 2.95 : 1.08

            if (Math.random() < 0.18) {
                camera.shake(80, 0.00)
            }
        }

        // transition smooth
        camera.zoom += (targetZoom - camera.zoom) * 0.08
    }

    update(_: number, delta: number) {
        const dt = delta / 1000
        this.runTime += dt

        this.updateBackground(dt)

        this.updateCameraEffects()

        if (Phaser.Input.Keyboard.JustDown(this.keys.menu) || this.mobile.menu) {
            this.mobile.menu = false
            this.scrapeSound?.stop()
            this.gameMusic?.stop()

            document.body.classList.remove('game-active')
            this.scene.start('MenuScene')
            return
        }

        if (this.isGameOver) {
            if (Phaser.Input.Keyboard.JustDown(this.keys.restart) || this.mobile.restart) {
                this.mobile.restart = false
                this.scene.restart()
            }
            return
        }

        this.updatePhysics(dt)
        this.updateBikeVisual(dt)
        this.riderIdleOffset = Math.sin(this.time.now * 0.008) * 1
        this.updateGameplay(dt)
        this.updateHud()
    }

    private resetGameState() {
        this.angle = 0
        this.angularVelocity = 0
        this.score = 0
        this.speed = 120
        this.isGameOver = false
        this.hasStartedWheelie = false

        this.runTime = 0
        this.bestScore = Number(localStorage.getItem('mue-rider-best-score') ?? 0)

        this.scrapeTime = 0
        this.scrapeCount = 0
        this.wasScraping = false

        this.combo = 1
        this.comboTimer = 0

        this.mutationLevel = 1
    }

    private createHud() {
        const mobile = this.isMobileView()

        this.scoreText = this.add.text(
            mobile ? 25 : 25,
            mobile ? 90 : 75,
            '',
            {
                fontSize: mobile ? '18px' : '22px',
                color: '#ffffff',
                fontStyle: 'bold',
                fontFamily: 'Arial',
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                padding: {x: mobile ? 12 : 18, y: mobile ? 10 : 14},
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setDepth(999)

        this.gameOverText = this.add.text(
            mobile ? 960 : 960,
            mobile ? 360 : 330,
            '',
            {
                fontSize: mobile ? '42px' : '52px',
                color: '#ff5555',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 7
            }
        ).setOrigin(0.5).setDepth(60)

        this.mutationText = this.add.text(960, 390, '', {
            fontSize: mobile ? '64px' : '88px',
            color: '#ffdd66',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 10
        })
            .setOrigin(0.5)
            .setDepth(999)
            .setAlpha(0)
    }

    private updatePhysics(dt: number) {
        const gas = this.keys.gas.isDown || this.mobile.gas
        const brake = this.keys.brake.isDown || this.mobile.brake

        const nerve = this.getMutationNerveMultiplier()

        if (gas) {
            this.angularVelocity += this.currentBiker.physics.gasPower * nerve * dt
        }

        if (brake) {
            this.angularVelocity -= this.currentBiker.physics.brakePower * nerve * dt
        }

        const balanceDistance = this.angle - 90

        if (this.angle < 80) {
            this.angularVelocity -= this.currentBiker.physics.gravityDown * nerve * dt
        } else if (this.angle < 90) {
            // zone haute : ça retombe doucement vers l'avant
            this.angularVelocity -= this.currentBiker.physics.gravityDown * 0.35 * nerve * dt
        } else {
            // au-dessus de 90 : ça part doucement vers l'arrière
            this.angularVelocity += this.currentBiker.physics.gravityBack * 0.45 * nerve * dt
        }

        const friction = Phaser.Math.Clamp(0.984 + (this.mutationLevel - 1) * 0.002, 0.984, 0.992)

        this.angularVelocity *= friction
        this.angle += this.angularVelocity

        this.angle = Phaser.Math.Clamp(this.angle, 0, 112)

        const speedMutationBonus = 1 + (this.mutationLevel - 1) * 0.14

        const targetSpeed =
            120 +
            this.runTime *
            this.currentBiker.physics.acceleration *
            speedMutationBonus

        this.speed = Phaser.Math.Clamp(
            targetSpeed,
            120,
            this.currentBiker.physics.maxSpeed * speedMutationBonus
        )
    }

    private updateBikeVisual(dt: number) {
        this.bike.setRotation(Phaser.Math.DegToRad(-this.angle))

        this.rearWheel.rotation += this.speed * dt * 0.055

        const frontWheelInAir = this.hasStartedWheelie || this.angle > 8

        if (!frontWheelInAir) {
            this.frontWheelSpinSpeed = this.speed
        } else {
            this.frontWheelSpinSpeed = Math.max(
                0,
                this.frontWheelSpinSpeed - (this.currentBiker.physics.maxSpeed / 5) * dt
            )
        }

        this.frontWheel.rotation += this.frontWheelSpinSpeed * dt * 0.055
    }

    private updateGameplay(dt: number) {
        const hand = this.keys.hand.isDown || this.mobile.hand
        const trick = this.keys.trick.isDown || this.mobile.trick

        if (this.angle > 20) {
            this.hasStartedWheelie = true
        }

        const isScrapingMudguard = this.angle >= 85 && this.angle <= 100
        const isHandTouching = hand && this.angle >= 0 && this.angle <= 100
        const isKneeTrick = trick && this.angle >= 0 && this.angle <= 100

        this.updateScrapeStats(isScrapingMudguard, dt)
        this.updateRiderPose(isHandTouching, isKneeTrick)

        this.sparksSmall.setVisible(isScrapingMudguard)
        this.sparksBig.setVisible(isScrapingMudguard && this.angle >= 89 && this.angle <= 92)
        this.updateScrapeSound(isScrapingMudguard)

        if (!this.hasStartedWheelie) {
            return
        }

        if (this.angle <= 0) {
            this.gameOver('Roue avant reposée')
            return
        }

        if (this.angle >= 106) {
            this.crashReason = 'back'
            this.showCrashPose()
            this.gameOver('Chute arrière')
            return
        }

        const isLowDangerZone = this.hasStartedWheelie && this.angle < 15
        const isHighAngleZone = this.angle >= 60
        const isHandTrickBonus = isHandTouching && this.angle >= 55
        const isKneeTrickBonus = isKneeTrick

        const isComboAction =
            isScrapingMudguard ||
            isHandTrickBonus ||
            isKneeTrickBonus ||
            isHighAngleZone ||
            isLowDangerZone

        if (isComboAction) {
            this.comboTimer += dt

            if (this.comboTimer >= 0.6) {
                this.combo = Phaser.Math.Clamp(this.combo + 0.2, 1, this.comboMax)
                this.comboTimer = 0
            }
        } else {
            this.comboTimer = 0
            this.combo = Math.max(1, this.combo - 1.5 * dt)
        }

        let multiplier = 1

        if (isLowDangerZone) multiplier = 2
        if (isHighAngleZone) multiplier = Math.max(multiplier, 2)
        if (isKneeTrickBonus) multiplier = Math.max(multiplier, 2)
        if (isHandTrickBonus) multiplier = Math.max(multiplier, 3)
        if (isScrapingMudguard) multiplier = Math.max(multiplier, 5)

        multiplier *= this.getMutationScoreMultiplier()
        multiplier *= this.combo

        const scoreAngle = Math.max(this.angle, 20)

        this.score +=
            scoreAngle *
            (this.speed / 180) *
            multiplier *
            dt

        this.checkMutation()
    }

    private updateScrapeSound(isScrapingMudguard: boolean) {
        if (!this.scrapeSound) {
            return
        }

        if (isScrapingMudguard && !this.scrapeSound.isPlaying) {
            this.scrapeSound.play()
            return
        }

        if (!isScrapingMudguard && this.scrapeSound.isPlaying) {
            this.scrapeSound.stop()
        }
    }

    private showCrashPose() {
        if (this.crashReason !== 'back') {
            return
        }

        const biker = this.currentBiker
        const isMutant = this.mutationLevel >= 3
        const poses = isMutant ? biker.rider.mutant : biker.rider
        const suffix = isMutant ? '_mutant' : ''

        const pose = poses.crash

        this.rider.setTexture(`${biker.key}_crash${suffix}`)
        this.rider.setPosition(pose.x, pose.y)
        this.rider.setScale(pose.scale)
        this.rider.setAngle(pose.angle)
        this.rider.setFlipX(pose.flipX ?? false)
        this.rider.setFlipY(pose.flipY ?? false)

        this.sparksSmall.setVisible(false)
        this.sparksBig.setVisible(false)
    }

    private updateScrapeStats(isScrapingMudguard: boolean, dt: number) {
        if (isScrapingMudguard) {
            this.scrapeTime += dt

            if (!this.wasScraping) {
                this.scrapeCount++
                this.wasScraping = true
            }

            return
        }

        this.wasScraping = false
    }

    private checkMutation() {
        const newMutationLevel = this.getMutationLevel()

        if (newMutationLevel > this.mutationLevel) {
            this.mutationLevel = newMutationLevel
            this.triggerMutation(this.mutationLevel)
        }
    }

    private getMutationLevel(): number {
        const level = Math.floor(this.score / this.mutationStep) + 1

        return Phaser.Math.Clamp(level, 1, this.maxMutationLevel)
    }

    private getMutationLabel(): string {
        if (this.mutationLevel >= this.maxMutationLevel) {
            return `Niveau ${this.mutationLevel} MAX`
        }

        return `Niveau ${this.mutationLevel}`
    }

    private getMutationNerveMultiplier(): number {
        return 1 + (this.mutationLevel - 1) * 0.22
    }

    private getMutationScoreMultiplier(): number {
        return 1 + (this.mutationLevel - 1) * 0.12
    }

    private triggerMutation(level: number) {
        if (GAME_STATE.gameSoundEnabled) {
            this.sound.play('mutation_sound', {
                volume: 0.75
            })
        }

        this.cameras.main.shake(380, 0.013)
        this.cameras.main.flash(300, 255, 220, 80)

        this.mutationText
            .setText(level >= this.maxMutationLevel ? 'MUE MAXIMALE' : `MUE NIVEAU ${level}`)
            .setScale(0.45)
            .setAlpha(1)
            .setY(430)

        this.tweens.killTweensOf(this.mutationText)

        this.tweens.add({
            targets: this.mutationText,
            scale: 1.2,
            y: 350,
            alpha: 0,
            duration: 2000,
            ease: 'Back.Out'
        })

        this.tweens.add({
            targets: this.bike,
            scaleX: 1.08,
            scaleY: 1.08,
            duration: 150,
            yoyo: true,
            ease: 'Quad.easeOut'
        })

        this.isMutating = true
        this.mutationVisualUntil = this.time.now + 700

        this.rider.setTint(0xffdd55)

        this.tweens.add({
            targets: this.rider,
            scaleX: '+=0.08',
            scaleY: '+=0.08',
            duration: 120,
            yoyo: true,
            repeat: 3,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.rider.clearTint()
                this.isMutating = false
            }
        })
    }

    private updateHud() {
        const nextMutationScore =
            this.mutationLevel >= this.maxMutationLevel
                ? 'MAX'
                : this.mutationLevel * this.mutationStep

        if (this.isMobileView()) {
            this.scoreText.setText(
                `🏁 ${Math.floor(this.score)}   ⭐ ${Math.floor(this.bestScore)}
⚡ x${this.combo.toFixed(1)}   🧬 ${this.getMutationLabel()}
📐 ${Math.floor(this.angle)}°   🔥 ${this.getDangerLabel()}
✨ ${this.scrapeCount}x   ⏱ ${this.scrapeTime.toFixed(1)}s`
            )
            return
        }

        this.scoreText.setText(
            `🏁 SCORE  ${Math.floor(this.score)}
⭐ BEST   ${Math.floor(this.bestScore)}

⚡ COMBO  x${this.combo.toFixed(1)}
🧬 MUE    ${this.getMutationLabel()}
🎯 PROCHAIN PALIER   ${nextMutationScore}

📐 ANGLE  ${Math.floor(this.angle)}°
🔥 ZONE   ${this.getDangerLabel()}

✨ BAVETTE ${this.scrapeCount}x
⏱ FROTTE  ${this.scrapeTime.toFixed(1)}s

Z Gaz | S Frein | A Main | E Genou`
        )
    }

    private getDangerLabel(): string {
        if (!this.hasStartedWheelie) {
            return 'Départ'
        }

        if (this.angle < 15) {
            return 'Danger basse'
        }

        if (this.angle >= 60 && this.angle < 75) {
            return 'Angle haut'
        }

        if (this.angle >= 75 && this.angle < 86) {
            return 'Zone trick'
        }

        if (this.angle >= 86 && this.angle <= 94) {
            return 'Bavette'
        }

        if (this.angle >= 96) {
            return 'Danger arrière'
        }

        return 'Stable'
    }

    private createBackground() {
        const mobile = this.isMobileView()

        this.background1 = this.add.image(0, 0, GAME_STATE.background)
            .setOrigin(0, 0)
            .setDisplaySize(1920, 1080)

        this.background2 = this.add.image(1920, 0, GAME_STATE.background)
            .setOrigin(0, 0)
            .setDisplaySize(1920, 1080)

        if (mobile) {
            this.cameras.main.setZoom(1.75)
            this.cameras.main.setScroll(120, 280)
        } else {
            this.cameras.main.setZoom(1)
            this.cameras.main.setScroll(0, 0)
        }
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

        const mobile = this.isMobileView()

        this.bike = this.add.container(
            mobile ? 240 : biker.container.x,
            mobile ? 1030 : biker.container.y
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

    private updateRiderPose(isHandTouching: boolean, isKneeTrick: boolean) {
        const biker = this.currentBiker
        const isMutant = this.mutationLevel >= 3

        const poses = isMutant ? biker.rider.mutant : biker.rider
        const suffix = isMutant ? '_mutant' : ''

        if (isKneeTrick) {
            const pose = poses.knee
            this.rider.setTexture(`${biker.key}_knee${suffix}`)
            this.rider.setPosition(pose.x, pose.y + this.riderIdleOffset)
            if (!this.isMutating) {
                this.rider.setScale(pose.scale)
            }
            this.rider.setAngle(pose.angle)
            return
        }

        if (isHandTouching) {
            const pose = poses.hand
            this.rider.setTexture(`${biker.key}_hand${suffix}`)
            this.rider.setPosition(pose.x, pose.y + this.riderIdleOffset)
            if (!this.isMutating) {
                this.rider.setScale(pose.scale)
            }
            this.rider.setAngle(pose.angle)
            return
        }

        const pose = poses.normal
        this.rider.setTexture(`${biker.key}_normal${suffix}`)
        this.rider.setPosition(pose.x, pose.y + this.riderIdleOffset)
        if (!this.isMutating) {
            this.rider.setScale(pose.scale)
        }
        this.rider.setAngle(pose.angle)
        this.rider.setFlipX(pose.flipX ?? false)
        this.rider.setFlipY(pose.flipY ?? false)
    }

    private gameOver(reason: string) {
        if (this.isGameOver) return

        this.isGameOver = true
        this.angularVelocity = 0

        this.scrapeSound?.stop()
        this.gameMusic?.stop()

        if (GAME_STATE.gameSoundEnabled) {
            if (reason === 'Chute arrière') {
                this.sound.play('crash_sound', {
                    volume: 0.5
                })
            } else {
                this.sound.play('fail_sound', {
                    volume: 1.2
                })
            }
        }

        this.gameOverText.setText(
            `${reason}

Score : ${Math.floor(this.score)}

ESPACE pour recommencer
ECHAP menu`
        )
    }
}