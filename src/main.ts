import Phaser from 'phaser'
import { MenuScene } from './scenes/MenuScene'
import { GameScene } from './scenes/GameScene'
import './styles/game.css'

const isPortrait = window.innerHeight > window.innerWidth

const GAME_WIDTH = isPortrait ? 720 : 1920
const GAME_HEIGHT = isPortrait ? 1280 : 1080

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,

    scale: {
        mode: isPortrait ? Phaser.Scale.ENVELOP : Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAME_WIDTH,
        height: GAME_HEIGHT
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
    const controls = document.querySelector<HTMLElement>('#mobile-controls')

    if (!controls) return

    const activeActions = new Map<number, string>()

    const send = (action: string, down: boolean) => {
        window.dispatchEvent(new CustomEvent('mobile-input', {
            detail: { action, down }
        }))
    }

    const stopAction = (pointerId: number) => {
        const action = activeActions.get(pointerId)

        if (!action) return

        send(action, false)
        activeActions.delete(pointerId)
    }

    controls.addEventListener('pointerdown', (event: PointerEvent) => {
        const target = event.target as HTMLElement
        const button = target.closest<HTMLButtonElement>('button')

        event.preventDefault()

        const action = button?.dataset.action ?? 'gas'

        activeActions.set(event.pointerId, action)
        send(action, true)
    })

    controls.addEventListener('pointerup', (event: PointerEvent) => {
        event.preventDefault()
        stopAction(event.pointerId)
    })

    controls.addEventListener('pointercancel', (event: PointerEvent) => {
        stopAction(event.pointerId)
    })

    controls.addEventListener('pointerleave', (event: PointerEvent) => {
        stopAction(event.pointerId)
    })
})

new Phaser.Game(config)