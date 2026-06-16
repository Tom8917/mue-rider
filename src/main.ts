import Phaser from 'phaser'
import { MenuScene } from './scenes/MenuScene'
import { GameScene } from './scenes/GameScene'
import './styles/game.css'

const isPortrait = window.innerHeight > window.innerWidth

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: isPortrait ? 1080 : 1920,
        height: isPortrait ? 1920 : 1080
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

window.addEventListener('DOMContentLoaded', () => {
    const controls = document.querySelector('#mobile-controls')

    if (!controls) return

    const send = (action: string, down: boolean) => {
        window.dispatchEvent(new CustomEvent('mobile-input', {
            detail: { action, down }
        }))
    }

    controls.addEventListener('pointerdown', (event) => {
        const target = event.target as HTMLElement
        const button = target.closest('button') as HTMLButtonElement | null

        event.preventDefault()

        if (button?.dataset.action) {
            send(button.dataset.action, true)
            return
        }

        send('gas', true)
    })

    controls.addEventListener('pointerup', (event) => {
        event.preventDefault()

        send('gas', false)
        send('brake', false)
        send('hand', false)
        send('trick', false)
        send('restart', false)
        send('menu', false)
    })

    controls.addEventListener('pointercancel', () => {
        send('gas', false)
        send('brake', false)
        send('hand', false)
        send('trick', false)
    })
})

new Phaser.Game(config)