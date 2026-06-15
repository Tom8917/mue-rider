import Phaser from 'phaser'

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene')
    }

    create() {
        const centerX = this.cameras.main.width / 2

        this.add.text(centerX, 120, 'MUE RIDER', {
            fontSize: '52px',
            color: '#ffffff'
        }).setOrigin(0.5)

        this.add.text(centerX, 220, 'ESPACE = démarrer', {
            fontSize: '28px',
            color: '#cccccc'
        }).setOrigin(0.5)

        this.add.text(centerX, 320, 'Objectif : faire le plus gros wheeling', {
            fontSize: '24px',
            color: '#999999'
        }).setOrigin(0.5)

        this.input.keyboard?.once('keydown-SPACE', () => {
            this.scene.start('GameScene')
        })
    }
}