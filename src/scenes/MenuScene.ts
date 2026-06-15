import Phaser from 'phaser'
import { GAME_STATE, type BackgroundKey } from '../data/gameState'
import { BIKERS } from '../data/bikers'
import type { BikerKey } from '../data/bikers'

export class MenuScene extends Phaser.Scene {
    private bikers: BikerKey[] = ['portugal', 'brazil', 'usa']
    private backgrounds: BackgroundKey[] = ['suburb', 'industrial', 'los_angeles', 'ny']

    private bikerIndex = 0
    private backgroundIndex = 0

    private bikerPreview!: Phaser.GameObjects.Image
    private backgroundPreview!: Phaser.GameObjects.Image
    private bikerTitle!: Phaser.GameObjects.Text
    private backgroundTitle!: Phaser.GameObjects.Text
    private bestScoreText!: Phaser.GameObjects.Text

    constructor() {
        super('MenuScene')
    }

    preload() {
        this.load.image('suburb', '/assets/backgrounds/suburb.png')
        this.load.image('highway', '/assets/backgrounds/highway.png')
        this.load.image('industrial', '/assets/backgrounds/industrial.png')
        this.load.image('los_angeles', '/assets/backgrounds/los_angeles.png')
        this.load.image('ny', '/assets/backgrounds/ny.png')

        for (const biker of Object.values(BIKERS)) {
            const folder = `/assets/bikers/${biker.folder}`
            this.load.image(`${biker.key}_menu_bike`, `${folder}/bike+rider.png`)
            this.load.image(`${biker.key}_menu_rider`, `${folder}/rider_normal.png`)
            this.load.image(`${biker.key}_menu_front_wheel`, `${folder}/front_wheel.png`)
            this.load.image(`${biker.key}_menu_rear_wheel`, `${folder}/rear_wheel.png`)
        }
    }

    create() {
        this.bikerIndex = this.bikers.indexOf(GAME_STATE.biker)
        this.backgroundIndex = this.backgrounds.indexOf(GAME_STATE.background)

        const best = Number(localStorage.getItem('mue-rider-best-score') ?? 0)

        this.add.rectangle(960, 540, 1920, 1080, 0x111827)

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

        this.backgroundPreview = this.add.image(960, 420, GAME_STATE.background)
            .setOrigin(0.5)
            .setDisplaySize(1000, 420)
            .setAlpha(0.95)

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
            this.scene.start('GameScene')
        })
    }

    private refreshMenu() {
        const bikerKey = this.bikers[this.bikerIndex]
        const backgroundKey = this.backgrounds[this.backgroundIndex]
        const biker = BIKERS[bikerKey]

        GAME_STATE.biker = bikerKey
        GAME_STATE.background = backgroundKey

        this.backgroundPreview.setTexture(backgroundKey)

        this.bikerPreview.setTexture(`${bikerKey}_menu_bike`)
        this.bikerPreview.setPosition(960, 500)
        this.bikerPreview.setScale(0.75)

        this.bikerTitle.setText(`Personnage : ${biker.label}`)

        const bgLabel: Record<BackgroundKey, string> = {
            suburb: 'Banlieue',
            industrial: 'Zone industrielle',
            los_angeles: 'Los Angeles',
            ny: 'New York',
            parking: 'Parking',
        }

        this.backgroundTitle.setText(`Environnement : ${bgLabel[backgroundKey]}`)
    }
}