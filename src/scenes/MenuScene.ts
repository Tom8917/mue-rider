import Phaser from 'phaser'
import {GAME_STATE, type BackgroundKey} from '../data/gameState'
import {BIKERS} from '../data/bikers'
import type {BikerKey} from '../data/bikers'

export class MenuScene extends Phaser.Scene {
    private bikers: BikerKey[] = ['portugal', 'brazil', 'usa']
    private backgrounds: BackgroundKey[] = ['suburb', 'industrial', 'los_angeles', 'ny', 'las_vegas', 'miami']

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
        this.load.image('suburb', '/assets/backgrounds/suburb.png')
        this.load.image('highway', '/assets/backgrounds/highway.png')
        this.load.image('industrial', '/assets/backgrounds/industrial.png')
        this.load.image('los_angeles', '/assets/backgrounds/los_angeles.png')
        this.load.image('ny', '/assets/backgrounds/ny.png')
        this.load.image('las_vegas', '/assets/backgrounds/las_vegas.png')
        this.load.image('miami', '/assets/backgrounds/miami.png')

        for (const biker of Object.values(BIKERS)) {
            const folder = `/assets/bikers/${biker.folder}`
            this.load.image(`${biker.key}_menu_bike`, `${folder}/bike+rider.png`)
            this.load.image(`${biker.key}_menu_rider`, `${folder}/rider_normal.png`)
            this.load.image(`${biker.key}_menu_front_wheel`, `${folder}/front_wheel.png`)
            this.load.image(`${biker.key}_menu_rear_wheel`, `${folder}/rear_wheel.png`)
        }

        this.load.audio('menu_music', '/assets/audio/music_2.mp3')
    }

    create() {
        document.body.classList.remove('game-active')

// reset musique jeu
        this.sound.stopByKey('game_music')
        this.sound.stopByKey('menu_music')

        if (GAME_STATE.menuSoundEnabled) {
            this.menuMusic = this.sound.add('menu_music', {
                loop: true,
                volume: 0.35
            })

            this.menuMusic.play()
        }

        this.bikerIndex = this.bikers.indexOf(GAME_STATE.biker)
        this.backgroundIndex = this.backgrounds.indexOf(GAME_STATE.background)

        const best = Number(localStorage.getItem('mue-rider-best-score') ?? 0)

        this.add.rectangle(960, 420, 1000, 420)
            .setStrokeStyle(4, 0xffffff, 0.25)

        this.add.text(960, 90, 'MUE RIDER', {
            fontSize: '72px',
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

        this.add.text(960, 850,
            '← / → personnage     ↑ / ↓ décor\nESPACE jouer     ESC quitter/revenir',
            {
                fontSize: '26px',
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5)

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
        this.children.removeAll()

        const best = Number(localStorage.getItem('mue-rider-best-score') ?? 0)

        this.add.text(360, 120, 'MUE RIDER', {
            fontSize: '76px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5)

        this.add.text(360, 205, `Best score : ${best}`, {
            fontSize: '34px',
            color: '#ffdd66',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5)

        this.backgroundPreview = this.add.image(360, 470, GAME_STATE.background)
            .setOrigin(0.5)
            .setAlpha(0.95)

        this.bikerPreview = this.add.image(360, 610, `${GAME_STATE.biker}_menu_bike`)
            .setOrigin(0.69)
            .setScale(0.9)

        this.bikerTitle = this.add.text(360, 820, '', {
            fontSize: '34px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5)

        this.backgroundTitle = this.add.text(360, 885, '', {
            fontSize: '30px',
            color: '#cccccc',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5)

        this.menuSoundText = this.add.text(360, 0, '', { fontSize: '1px' })
        this.gameSoundText = this.add.text(360, 0, '', { fontSize: '1px' })

        this.addMobileButton(180, 1050, '← MOTO', () => {
            this.bikerIndex = Phaser.Math.Wrap(this.bikerIndex - 1, 0, this.bikers.length)
            this.refreshMenu()
        })

        this.addMobileButton(540, 1050, 'MOTO →', () => {
            this.bikerIndex = Phaser.Math.Wrap(this.bikerIndex + 1, 0, this.bikers.length)
            this.refreshMenu()
        })

        this.addMobileButton(180, 1160, '← DÉCOR', () => {
            this.backgroundIndex = Phaser.Math.Wrap(this.backgroundIndex - 1, 0, this.backgrounds.length)
            this.refreshMenu()
        })

        this.addMobileButton(540, 1160, 'DÉCOR →', () => {
            this.backgroundIndex = Phaser.Math.Wrap(this.backgroundIndex + 1, 0, this.backgrounds.length)
            this.refreshMenu()
        })

        this.addMobileButton(180, 1280, 'SON MENU', () => {
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

        this.addMobileButton(540, 1280, 'SON JEU', () => {
            GAME_STATE.gameSoundEnabled = !GAME_STATE.gameSoundEnabled
            this.refreshMenu()
        })

        this.addMobileButton(360, 1080, 'JOUER', () => {
            GAME_STATE.biker = this.bikers[this.bikerIndex]
            GAME_STATE.background = this.backgrounds[this.backgroundIndex]

            this.menuMusic?.stop()
            this.sound.stopByKey('menu_music')

            this.scene.start('GameScene')
        }, 520, 110)

        this.refreshMenu()
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

    private refreshMenu() {
        const mobile = this.scale.gameSize.height > this.scale.gameSize.width

        const bikerKey = this.bikers[this.bikerIndex]
        const backgroundKey = this.backgrounds[this.backgroundIndex]
        const biker = BIKERS[bikerKey]

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
        }

        this.backgroundTitle.setText(`Environnement : ${bgLabel[backgroundKey]}`)
    }
}