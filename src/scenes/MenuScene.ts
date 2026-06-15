import Phaser from 'phaser'
import { GAME_STATE, type BackgroundKey } from '../data/gameState'
import type { BikerKey } from '../data/bikers'

export class MenuScene extends Phaser.Scene {
    private bikers: BikerKey[] = ['portugal', 'brazil', 'usa']
    private backgrounds: BackgroundKey[] = ['suburb', 'highway', 'industrial']

    private bikerIndex = 0
    private backgroundIndex = 0

    private bikerText!: Phaser.GameObjects.Text
    private backgroundText!: Phaser.GameObjects.Text

    constructor() {
        super('MenuScene')
    }

    create() {
        const centerX = this.cameras.main.width / 2

        this.add.text(centerX, 90, 'MUE RIDER', {
            fontSize: '56px',
            color: '#ffffff'
        }).setOrigin(0.5)

        this.bikerText = this.add.text(centerX, 210, '', {
            fontSize: '30px',
            color: '#ffffff'
        }).setOrigin(0.5)

        this.backgroundText = this.add.text(centerX, 270, '', {
            fontSize: '30px',
            color: '#ffffff'
        }).setOrigin(0.5)

        this.add.text(centerX, 390,
            '← / → : changer biker\n↑ / ↓ : changer décor\nESPACE : jouer',
            {
                fontSize: '24px',
                color: '#cccccc',
                align: 'center'
            }
        ).setOrigin(0.5)

        this.refreshTexts()

        this.input.keyboard?.on('keydown-LEFT', () => {
            this.bikerIndex = Phaser.Math.Wrap(this.bikerIndex - 1, 0, this.bikers.length)
            this.refreshTexts()
        })

        this.input.keyboard?.on('keydown-RIGHT', () => {
            this.bikerIndex = Phaser.Math.Wrap(this.bikerIndex + 1, 0, this.bikers.length)
            this.refreshTexts()
        })

        this.input.keyboard?.on('keydown-UP', () => {
            this.backgroundIndex = Phaser.Math.Wrap(this.backgroundIndex - 1, 0, this.backgrounds.length)
            this.refreshTexts()
        })

        this.input.keyboard?.on('keydown-DOWN', () => {
            this.backgroundIndex = Phaser.Math.Wrap(this.backgroundIndex + 1, 0, this.backgrounds.length)
            this.refreshTexts()
        })

        this.input.keyboard?.once('keydown-SPACE', () => {
            GAME_STATE.biker = this.bikers[this.bikerIndex]
            GAME_STATE.background = this.backgrounds[this.backgroundIndex]
            this.scene.start('GameScene')
        })
    }

    private refreshTexts() {
        this.bikerText.setText(`Biker : ${this.bikers[this.bikerIndex]}`)
        this.backgroundText.setText(`Décor : ${this.backgrounds[this.backgroundIndex]}`)
    }
}