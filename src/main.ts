import Phaser from 'phaser'
import { MenuScene } from './scenes/MenuScene'
import { GameScene } from './scenes/GameScene'
import './styles/game.css'

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720
    },

    backgroundColor: '#1a1a1a',
    parent: 'app',

    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 1000
            },
            debug: false
        }
    },

    scene: [
        MenuScene,
        GameScene
    ]
}

new Phaser.Game(config)