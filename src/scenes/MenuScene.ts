import Phaser from 'phaser'
import {GAME_STATE, type BackgroundKey} from '../data/gameState'
import {BIKERS} from '../data/bikers'
import type {BikerKey} from '../data/bikers'
import { RADIOS, type RadioChannel } from '../data/radios'

export class MenuScene extends Phaser.Scene {
    private bikers: BikerKey[] = ['portugal', 'brazil', 'usa']
    private backgrounds: BackgroundKey[] = ['suburb', 'industrial', 'los_angeles', 'ny', 'las_vegas', 'miami', 'plage', 'autoroute', 'campagne']

    private radios: RadioChannel[] = ['channel_1', 'channel_2', 'channel_3']
    private radioIndex = 0
    private radioTitle!: Phaser.GameObjects.Text

    private bikerIndex = 0
    private backgroundIndex = 0

    private bikerPreview!: Phaser.GameObjects.Image
    private backgroundPreview!: Phaser.GameObjects.Image
    private bikerTitle!: Phaser.GameObjects.Text
    private backgroundTitle!: Phaser.GameObjects.Text
    private bestScoreText!: Phaser.GameObjects.Text

    private menuMusic?: Phaser.Sound.BaseSound

    private menuSoundText!: Phaser.GameObjects.Text
    private gameSoundText!: Phaser.GameObjects.Text

    constructor() {
        super('MenuScene')
    }

    preload() {
        const mobile = window.innerHeight > window.innerWidth

        const loadingText = this.add.text(
            mobile ? 360 : 960,
            mobile ? 640 : 540,
            'Chargement...',
            {
                fontSize: mobile ? '36px' : '42px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5)

        this.load.once('complete', () => {
            loadingText.destroy()
        })

        this.load.image('suburb', '/assets/backgrounds/suburb.png')
        this.load.image('highway', '/assets/backgrounds/highway.png')
        this.load.image('industrial', '/assets/backgrounds/industrial.png')
        this.load.image('los_angeles', '/assets/backgrounds/los_angeles.png')
        this.load.image('ny', '/assets/backgrounds/ny.png')
        this.load.image('las_vegas', '/assets/backgrounds/las_vegas.png')
        this.load.image('miami', '/assets/backgrounds/miami.png')
        this.load.image('plage', '/assets/backgrounds/plage.png')
        this.load.image('autoroute', '/assets/backgrounds/autoroute.png')
        this.load.image('campagne', '/assets/backgrounds/campagne.png')

        for (const biker of Object.values(BIKERS)) {
            const folder = `/assets/bikers/${biker.folder}`
            this.load.image(`${biker.key}_menu_bike`, `${folder}/bike+rider.png`)
            this.load.image(`${biker.key}_menu_rider`, `${folder}/rider_normal.png`)
            this.load.image(`${biker.key}_menu_front_wheel`, `${folder}/front_wheel.png`)
            this.load.image(`${biker.key}_menu_rear_wheel`, `${folder}/rear_wheel.png`)
        }

        this.load.audio('menu_music', '/assets/audio/menu.mp3')
    }


    private isPageActive(): boolean {
        return document.visibilityState === 'visible' && document.hasFocus()
    }

    private startMenuMusic() {
        this.sound.stopByKey('menu_music')

        if (!GAME_STATE.menuSoundEnabled || !this.isPageActive()) {
            return
        }

        this.menuMusic = this.sound.add('menu_music', {
            loop: true,
            volume: 0.35
        })

        this.menuMusic.play()
    }

    private setupPageSoundGuard() {
        const updateSound = () => {
            if (!this.isPageActive()) {
                this.menuMusic?.pause()
                return
            }

            if (GAME_STATE.menuSoundEnabled) {
                if (this.menuMusic && this.menuMusic.isPaused) {
                    this.menuMusic.resume()
                } else if (!this.menuMusic?.isPlaying) {
                    this.startMenuMusic()
                }
            }
        }

        window.addEventListener('blur', updateSound)
        window.addEventListener('focus', updateSound)
        document.addEventListener('visibilitychange', updateSound)

        this.events.once('shutdown', () => {
            window.removeEventListener('blur', updateSound)
            window.removeEventListener('focus', updateSound)
            document.removeEventListener('visibilitychange', updateSound)
        })
    }

    private async syncLocalBestScore() {
        const username = localStorage.getItem('mue-rider-username') || 'Joueur'
        const bestScore = Number(localStorage.getItem('mue-rider-best-score') ?? 0)

        if (bestScore <= 0) {
            return
        }

        try {
            await fetch('http://localhost:3001/scores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    score: bestScore,
                }),
            })
        } catch {
            console.warn('Impossible de synchroniser le score local')
        }
    }


    create() {
        document.body.classList.remove('game-active')

// reset musique jeu
        this.sound.stopByKey('menu_music')

        const usernameIcon = this.add.text(1495, 100, '👤', {
            fontSize: '42px',
            color: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            padding: { x: 14, y: 10 },
            stroke: '#000000',
            strokeThickness: 4
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })

        usernameIcon.on('pointerdown', () => {
            const current = localStorage.getItem('mue-rider-username') || 'Joueur'
            const username = prompt('Ton pseudo', current)?.trim()

            if (username) {
                localStorage.setItem('mue-rider-username', username)
            }
        })

        if (!localStorage.getItem('mue-rider-username')) {
            localStorage.setItem('mue-rider-username', 'Joueur')
        }

        this.syncLocalBestScore()

        this.setupPageSoundGuard()
        this.startMenuMusic()

        this.bikerIndex = this.bikers.indexOf(GAME_STATE.biker)
        this.backgroundIndex = this.backgrounds.indexOf(GAME_STATE.background)

        this.radioIndex = this.radios.indexOf(GAME_STATE.selectedRadio)

        const best = Number(localStorage.getItem('mue-rider-best-score') ?? 0)

        this.add.rectangle(960, 420, 1000, 420)
            .setStrokeStyle(4, 0xffffff, 0.25)

        this.add.text(960, 90, 'MUE RIDER', {
            fontSize: '72px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5)

        this.add.text(960, 120, 'Développé par Tom.M', {
            fontSize: '12px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5)

        this.bestScoreText = this.add.text(960, 165, `Best score : ${best}`, {
            fontSize: '30px',
            color: '#ffdd66',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5)

        const scoreIcon = this.add.text(1430, 100, '🏆', {
            fontSize: '42px',
            color: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            padding: { x: 14, y: 10 },
            stroke: '#000000',
            strokeThickness: 4
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })

        scoreIcon.on('pointerdown', () => {
            this.openScorePopup()
        })

        this.backgroundPreview = this.add.image(
            960,
            420,
            GAME_STATE.background
        )
            .setOrigin(0.5)
            .setAlpha(0.95)

        this.fitBackgroundPreview(GAME_STATE.background)

        this.add.rectangle(960, 420, 1000, 420)
            .setStrokeStyle(4, 0xffffff, 0.25)

        this.bikerPreview = this.add.image(960, 500, `${GAME_STATE.biker}_menu_bike`)
            .setOrigin(0.69)
            .setScale(0.75)

        this.bikerTitle = this.add.text(960, 690, '', {
            fontSize: '34px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5)

        this.backgroundTitle = this.add.text(960, 745, '', {
            fontSize: '28px',
            color: '#cccccc',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5)

        this.radioTitle = this.add.text(960, 790, '', {
            fontSize: '26px',
            color: '#ffdd66',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5)

        this.add.text(960, 850,
            '← / → personnage     ↑ / ↓ décor\nR radio     ESPACE jouer     ESC quitter/revenir',
            {
                fontSize: '26px',
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5)

        this.input.keyboard?.on('keydown-R', () => {
            this.radioIndex = Phaser.Math.Wrap(this.radioIndex + 1, 0, this.radios.length)
            this.refreshMenu()
        })

        this.menuSoundText = this.add.text(760, 930, '', {
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5)

        this.gameSoundText = this.add.text(1160, 930, '', {
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5)

        this.input.keyboard?.on('keydown-M', () => {
            GAME_STATE.menuSoundEnabled = !GAME_STATE.menuSoundEnabled

            if (GAME_STATE.menuSoundEnabled) {
                this.sound.stopByKey('menu_music')
                this.menuMusic = this.sound.add('menu_music', {
                    loop: true,
                    volume: 0.35
                })
                this.menuMusic.play()
            } else {
                this.sound.stopByKey('menu_music')
            }

            this.refreshMenu()
        })

        this.input.keyboard?.on('keydown-G', () => {
            GAME_STATE.gameSoundEnabled = !GAME_STATE.gameSoundEnabled
            this.refreshMenu()
        })

        this.refreshMenu()

        this.input.keyboard?.on('keydown-LEFT', () => {
            this.bikerIndex = Phaser.Math.Wrap(this.bikerIndex - 1, 0, this.bikers.length)
            this.refreshMenu()
        })

        this.input.keyboard?.on('keydown-RIGHT', () => {
            this.bikerIndex = Phaser.Math.Wrap(this.bikerIndex + 1, 0, this.bikers.length)
            this.refreshMenu()
        })

        this.input.keyboard?.on('keydown-UP', () => {
            this.backgroundIndex = Phaser.Math.Wrap(this.backgroundIndex - 1, 0, this.backgrounds.length)
            this.refreshMenu()
        })

        this.input.keyboard?.on('keydown-DOWN', () => {
            this.backgroundIndex = Phaser.Math.Wrap(this.backgroundIndex + 1, 0, this.backgrounds.length)
            this.refreshMenu()
        })

        this.input.keyboard?.once('keydown-SPACE', () => {
            GAME_STATE.biker = this.bikers[this.bikerIndex]
            GAME_STATE.background = this.backgrounds[this.backgroundIndex]

            this.menuMusic?.stop()
            this.sound.stopByKey('menu_music')

            this.scene.start('GameScene')
        })

        if (this.scale.gameSize.height > this.scale.gameSize.width) {
            this.setupMobileMenu()

            this.time.delayedCall(100, () => {
                this.scale.refresh()
                this.setupMobileMenu()
                this.refreshMenu()
            })
        }
    }

    private addMobileButton(
        x: number,
        y: number,
        label: string,
        callback: () => void,
        width = 260,
        height = 62
    ) {
        const button = this.add.rectangle(x, y, width, height, 0x000000, 0.55)
            .setStrokeStyle(3, 0xffffff, 0.8)
            .setInteractive({ useHandCursor: true })

        const text = this.add.text(x, y, label, {
            fontSize: '26px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5)

        button.on('pointerdown', callback)
        text.setInteractive({ useHandCursor: true }).on('pointerdown', callback)
    }

    private setupMobileMenu() {
        this.children.removeAll(true)

        const best = Number(localStorage.getItem('mue-rider-best-score') ?? 0)

        this.add.text(360, 85, 'MUE RIDER', {
            fontSize: '70px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5)

        this.add.text(360, 125, 'Développé par Tom.M', {
            fontSize: '17px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5)

        this.add.text(360, 170, `Best score : ${best}`, {
            fontSize: '30px',
            color: '#ffdd66',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5)

        this.backgroundPreview = this.add.image(360, 430, GAME_STATE.background)
            .setOrigin(0.5)
            .setAlpha(0.95)

        this.bikerPreview = this.add.image(360, 575, `${GAME_STATE.biker}_menu_bike`)
            .setOrigin(0.69)
            .setScale(0.9)

        this.bikerTitle = this.add.text(360, 785, '', {
            fontSize: '32px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5)

        this.backgroundTitle = this.add.text(360, 840, '', {
            fontSize: '28px',
            color: '#cccccc',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5)

        this.radioTitle = this.add.text(360, 890, '', {
            fontSize: '24px',
            color: '#ffdd66',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5)

        this.addMobileButton(95, 430, '←', () => {
            this.backgroundIndex = Phaser.Math.Wrap(this.backgroundIndex - 1, 0, this.backgrounds.length)
            this.refreshMenu()
        }, 70, 90)

        this.addMobileButton(625, 430, '→', () => {
            this.backgroundIndex = Phaser.Math.Wrap(this.backgroundIndex + 1, 0, this.backgrounds.length)
            this.refreshMenu()
        }, 70, 90)

        this.addMobileButton(95, 575, '←', () => {
            this.bikerIndex = Phaser.Math.Wrap(this.bikerIndex - 1, 0, this.bikers.length)
            this.refreshMenu()
        }, 70, 90)

        this.addMobileButton(625, 575, '→', () => {
            this.bikerIndex = Phaser.Math.Wrap(this.bikerIndex + 1, 0, this.bikers.length)
            this.refreshMenu()
        }, 70, 90)

        this.menuSoundText = this.add.text(360, 0, '', { fontSize: '1px' })
        this.gameSoundText = this.add.text(360, 0, '', { fontSize: '1px' })

        const actionY = 1015
        const buttonWidth = 105
        const buttonHeight = 70
        const gap = 8
        const totalWidth = buttonWidth * 5 + gap * 4
        const startX = 360 - totalWidth / 2 + buttonWidth / 2

        this.addMobileActionButton(startX, actionY, GAME_STATE.menuSoundEnabled ? '🔊' : '🔇', 'Menu', () => {
            GAME_STATE.menuSoundEnabled = !GAME_STATE.menuSoundEnabled

            if (GAME_STATE.menuSoundEnabled) {
                this.startMenuMusic()
            } else {
                this.sound.stopByKey('menu_music')
            }

            this.setupMobileMenu()
            this.refreshMenu()
        }, buttonWidth, buttonHeight)

        this.addMobileActionButton(startX + (buttonWidth + gap), actionY, GAME_STATE.gameSoundEnabled ? '🎵' : '🚫', 'Jeu', () => {
            GAME_STATE.gameSoundEnabled = !GAME_STATE.gameSoundEnabled
            this.setupMobileMenu()
            this.refreshMenu()
        }, buttonWidth, buttonHeight)

        this.addMobileActionButton(startX + (buttonWidth + gap) * 2, actionY, '🏆', 'Scores', () => {
            this.openScorePopup()
        }, buttonWidth, buttonHeight)

        this.addMobileActionButton(startX + (buttonWidth + gap) * 3, actionY, '👤', 'Pseudo', () => {
            const current = localStorage.getItem('mue-rider-username') || 'Joueur'
            const username = prompt('Ton pseudo', current)?.trim()

            if (username) {
                localStorage.setItem('mue-rider-username', username)
                this.syncLocalBestScore()
            }
        }, buttonWidth, buttonHeight)

        this.addMobileActionButton(startX + (buttonWidth + gap) * 4, actionY, '📻', 'Radio', () => {
            this.radioIndex = Phaser.Math.Wrap(this.radioIndex + 1, 0, this.radios.length)
            this.refreshMenu()
        }, buttonWidth, buttonHeight)

        this.addMobileButton(360, 1110, 'JOUER', () => {
            GAME_STATE.biker = this.bikers[this.bikerIndex]
            GAME_STATE.background = this.backgrounds[this.backgroundIndex]

            this.menuMusic?.stop()
            this.sound.stopByKey('menu_music')

            this.scene.start('GameScene')
        }, 430, 82)
    }

    private addMobileActionButton(
        x: number,
        y: number,
        icon: string,
        label: string,
        callback: () => void,
        width = 118,
        height = 70
    ) {
        const button = this.add.rectangle(x, y, width, height, 0x000000, 0.52)
            .setStrokeStyle(3, 0xffffff, 0.75)
            .setInteractive({ useHandCursor: true })

        const iconText = this.add.text(x, y - 13, icon, {
            fontSize: '26px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5)

        const labelText = this.add.text(x, y + 18, label, {
            fontSize: '15px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5)

        button.on('pointerdown', callback)
        iconText.setInteractive({ useHandCursor: true }).on('pointerdown', callback)
        labelText.setInteractive({ useHandCursor: true }).on('pointerdown', callback)
    }

    private addMobileIcon(
        x: number,
        y: number,
        label: string,
        callback: () => void
    ) {
        const size = 60

        const button = this.add.rectangle(x, y, size, size, 0x000000, 0.50)
            .setStrokeStyle(3, 0xffffff, 0.75)
            .setInteractive({ useHandCursor: true })

        const text = this.add.text(x, y, label, {
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5)

        button.on('pointerdown', callback)
        text.setInteractive({ useHandCursor: true }).on('pointerdown', callback)
    }

    private fitBackgroundPreview(textureKey: string) {
        const mobile = this.scale.gameSize.height > this.scale.gameSize.width

        const frameWidth = mobile ? 820 : 1000
        const frameHeight = mobile ? 460 : 420

        this.backgroundPreview.setTexture(textureKey)

        const texture = this.textures.get(textureKey)
        const source = texture.getSourceImage() as HTMLImageElement

        const imageWidth = source.width
        const imageHeight = source.height

        const scale = Math.max(
            frameWidth / imageWidth,
            frameHeight / imageHeight
        )

        this.backgroundPreview
            .setScale(scale)
            .setPosition(mobile ? 360 : 960, mobile ? 470 : 420)

        this.backgroundPreview.setCrop(
            (imageWidth - frameWidth / scale) / 2,
            (imageHeight - frameHeight / scale) / 2,
            frameWidth / scale,
            frameHeight / scale
        )
    }

    private async openScorePopup() {
        const mobile = this.scale.gameSize.height > this.scale.gameSize.width

        let scores: { username: string; best_score: number }[] = []

        try {
            scores = await fetch('http://localhost:3001/scores')
                .then(res => res.json())
        } catch {
            scores = []
        }

        const popupItems: Phaser.GameObjects.GameObject[] = []

        const centerX = mobile ? 360 : 960
        const centerY = mobile ? 640 : 540

        const width = mobile ? 620 : 760
        const height = mobile ? 620 : 560

        const overlay = this.add.rectangle(centerX, centerY, width, height, 0x000000, 0.9)
            .setDepth(1000)
            .setStrokeStyle(4, 0xffffff, 0.35)

        const title = this.add.text(centerX, centerY - height / 2 + 70, '🏆 TOP 5', {
            fontSize: mobile ? '44px' : '42px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 5
        })
            .setOrigin(0.5)
            .setDepth(1001)

        popupItems.push(overlay, title)

        const medals = ['🥇', '🥈', '🥉', '4.', '5.']

        if (scores.length === 0) {
            const empty = this.add.text(centerX, centerY, 'Aucun score', {
                fontSize: mobile ? '30px' : '30px',
                color: '#cccccc',
                stroke: '#000000',
                strokeThickness: 4
            })
                .setOrigin(0.5)
                .setDepth(1001)

            popupItems.push(empty)
        }

        scores.forEach((item, index) => {
            const line = this.add.text(
                centerX,
                centerY - 140 + index * (mobile ? 68 : 62),
                `${medals[index]} ${item.username} — ${item.best_score}`,
                {
                    fontSize: mobile ? '30px' : '32px',
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 4
                }
            )
                .setOrigin(0.5)
                .setDepth(1001)

            popupItems.push(line)
        })

        const close = this.add.text(centerX, centerY + height / 2 - 65, '✕', {
            fontSize: mobile ? '38px' : '34px',
            color: '#ffffff',
            backgroundColor: '#8b0000',
            padding: { x: 22, y: 8 },
            stroke: '#000000',
            strokeThickness: 3
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setDepth(1001)

        popupItems.push(close)

        close.on('pointerdown', () => {
            popupItems.forEach(item => item.destroy())
        })
    }

    private refreshMenu() {
        const mobile = this.scale.gameSize.height > this.scale.gameSize.width

        const bikerKey = this.bikers[this.bikerIndex]
        const backgroundKey = this.backgrounds[this.backgroundIndex]
        const biker = BIKERS[bikerKey]

        const radioKey = this.radios[this.radioIndex]
        const radio = RADIOS[radioKey]

        GAME_STATE.selectedRadio = radioKey

        this.radioTitle.setText(`Radio : ${radio.name} - ${radio.description}`)

        this.menuSoundText.setText(
            `${mobile ? 'Son menu' : 'M = Son menu'} : ${GAME_STATE.menuSoundEnabled ? 'ON' : 'OFF'}`
        )

        this.gameSoundText.setText(
            `${mobile ? 'Son jeu' : 'G = Son jeu'} : ${GAME_STATE.gameSoundEnabled ? 'ON' : 'OFF'}`
        )

        GAME_STATE.biker = bikerKey
        GAME_STATE.background = backgroundKey

        this.fitBackgroundPreview(backgroundKey)

        this.bikerPreview.setTexture(`${bikerKey}_menu_bike`)
        this.bikerPreview.setPosition(mobile ? 360 : 960, mobile ? 610 : 500)
        this.bikerPreview.setScale(mobile ? 0.9 : 0.75)

        this.bikerTitle.setText(`Personnage : ${biker.label}`)

        const bgLabel: Record<BackgroundKey, string> = {
            suburb: 'Banlieue brésilienne',
            highway: 'Autoroute',
            industrial: 'Zone industrielle',
            los_angeles: 'Los Angeles',
            ny: 'New York',
            las_vegas: 'Las Vegas',
            miami: 'Miami',
            plage: 'Plage',
            autoroute: 'autoroute',
            campagne: 'campagne',
        }

        this.backgroundTitle.setText(`Environnement : ${bgLabel[backgroundKey]}`)
    }
}