import { State } from "./state.js"
import { debugPrint } from "./runtime.js"
import { Context } from "./context.js"
import { DecorControls } from "./decorControls.js"
import { SceneObjectCommandIdle } from "./sceneObjectCommandIdle.js"
import { Names } from "./names.js"
import { GameVector3 } from "./gameVector3.js"
import { Utils } from "./utils.js"
import { InputController } from "./inputController.js"
import { InputControllerDelegate } from "./inputControllerDelegate.js"
import { GameInputEvent } from "./gameInputEvent.js"
import { GameInputMouseEvent } from "./gameInputMouseEvent.js"
import { GameInputMouseEventNames } from "./gameInputMouseEventNames.js"
import { MapController } from "./mapController.js"
import { MapAdapter } from "./mapAdapter.js"
import { GameVector2D } from "./gameVector2D.js"
import { Paths } from "./paths.js"
import { EndVideoState } from "./endVideoState.js"
//import { float } from "./types.js"

export class InGameState implements State,
    InputControllerDelegate {

    public readonly name: string
    context: Context

    private hud?: HTMLElement

    private projectile?: string | null
    private projectileRotation = GameVector3.zero()
    //private projectileDistance: float = 0

    private isMoveAnimationPlaying = false
    private inputController: InputController
    private canvas: HTMLCanvasElement

    private mapController =  new MapController()
    private mapAdapter: MapAdapter

    private previousHeroPosition = new GameVector2D(0,0)
    private levelCount = 1
    private readonly lastLevel = 100
    private applesCount = 20

    constructor(
        name: string,
        canvas: HTMLCanvasElement,
        context: Context
    ) {
        this.name = name
        this.context = context
        this.canvas = canvas
        this.inputController = new InputController(this.canvas, this)
        this.mapAdapter = new MapAdapter(context)
    }

    initialize(): void {
        // @ts-ignore
        document.__global_arctica_inGameState = this
        debugPrint("InGameState initialized")
        debugPrint(this.context)

        debugPrint(this.canvas)
        debugPrint(this.inputController)

        this.context.sceneController.addLight();
        this.initializeLevel()
    }

    public fireApple() {
        if (this.projectile) {
            return
        }
        if (this.applesCount < 1) {
            return
        }
        this.projectile = "apple"
        const projectile = this.projectile!
        const startPosition = this.context.sceneController.sceneObjectPosition(Names.Hero).clone()
        startPosition.y -= 0.3
        this.context.sceneController.moveObject({
            name: projectile,
            position: startPosition
        })
        this.projectileRotation = this.context.sceneController.sceneObjectRotation(Names.Hero).clone()
        this.projectileRotation.y += Utils.degreesToRadians(180)
        this.applesCount -= 1

        this.moveProjectile()
    }

    private moveProjectile() {
        if (!this.projectile) {
            return
        }
        const projectile = this.projectile
        debugPrint(this.projectileRotation)

        const diffX = Math.sin(this.projectileRotation.y)
        const diffY = Math.cos(this.projectileRotation.y)

        const ratio = 0.06
        const position = this.context.sceneController.sceneObjectPosition(projectile).clone()
        position.x += diffX * ratio
        position.y -= 0.01
        position.z += diffY * ratio

        this.context.sceneController.moveObject(
            {
                name: projectile,
                position: position
            }
        )

        if (position.y <= -0.7) {
            this.hideProjectile()
            return
        }

        // this.projectileDistance += ratio * (Math.abs(diffX) + Math.abs(diffY))

        // if (this.projectileDistance >= 4) {
        //     this.hideProjectile()
        //     return
        // }

        const checkPositionX = Math.floor(position.x + 0.5)
        const checkPositionY = Math.floor(position.z + 0.5)
        
        const checkPosition = new GameVector2D(checkPositionX, checkPositionY)

        if (!this.mapController.isKnownTile({position: checkPosition}) ||
            this.mapController.isSolid({position: checkPosition})) {
            this.hideProjectile()            
        }
        else if (
            this.mapController.isKnownTile({position: checkPosition}) &&
            this.mapController.isShark({position: checkPosition})
        ) {
            this.mapController.removeShark({cursor: checkPosition})
            this.mapAdapter.removeShark({cursor: checkPosition})
            this.hideProjectile()
        }
    }

    private hideProjectile() {
        this.projectile = null
        //this.projectileDistance = 0
        const position = this.context.sceneController.sceneObjectPosition("apple")
        position.y = -2
        this.context.sceneController.moveObject(
            {
                name: "apple",
                position: position
            }
        )
    }

    private addHud() {
        this.hud = document.createElement('div')
        const hud = this.hud!
        hud.innerHTML = `test`
        hud.style.color = "white"
        hud.style.backgroundColor = 'rgba(128, 128, 128, 0.5)'  
        hud.style.fontSize = "53px"
        hud.style.padding = "16px"         

        this.context.sceneController.addCssPlaneObject(
            {
                name: "hud",
                div: hud,
                planeSize: {
                    width: 2,
                    height: 2
                },
                position: new GameVector3(
                        -2,
                        5,
                        -8
                ),
                rotation: GameVector3.zero(),
                scale: new GameVector3(
                    0.01,
                    0.01,
                    0.01
                ),
                shadows: {
                    receiveShadow: false,
                    castShadow: false
                },
                display: {
                    isTop: true,
                    stickToCamera: true
                }
            },
        )              
    }

    private updateHud() {
        if (!this.hud) {
            return
        }
        this.hud.innerHTML = `Уровень ${this.levelCount}/${this.lastLevel}<br>Яблок: ${this.applesCount}`        
    }

    private addFireButton() {
        const projectileButton = document.createElement('div')
        projectileButton.innerHTML = `<img onclick='document.__global_arctica_inGameState.fireApple()' src='${Paths.assetsDirectory}/com.demensdeum.arctica.attack.button.texture.png'/>`
        projectileButton.style.color = "clear"
        projectileButton.style.backgroundColor = 'rgba(128, 128, 128, 0.0)'

        this.context.sceneController.addCssPlaneObject(
            {
                name: "fireButton",
                div: projectileButton,
                planeSize: {
                    width: 2,
                    height: 2
                },
                position: new GameVector3(
                        -3,
                        -6,
                        -10
                ),
                rotation: GameVector3.zero(),
                scale: new GameVector3(
                    0.01,
                    0.01,
                    0.01
                ),
                shadows: {
                    receiveShadow: false,
                    castShadow: false
                },
                display: {
                    isTop: true,
                    stickToCamera: true
                }
            },
        )              
    }

    private initializeLevel() {
        //this.projectileDistance = 0
        this.context.sceneController.removeAllSceneObjectsExceptCamera()
        this.mapController =  new MapController()
        this.mapAdapter = new MapAdapter(this.context)        
        this.context.sceneController.switchSkyboxIfNeeded(
            {
                name: "com.demensdeum.arctic.black",
                environmentOnly: false
            }
        )

        const startHeroPosition = new GameVector3(0, 0, 0)

        this.context.sceneController.addModelAt(
            {
                name: Names.Hero,
                modelName: "com.demensdeum.arctica.hero",
                position: startHeroPosition,
                rotation: new GameVector3(0, 0, 0),
                isMovable: true,
                controls: new DecorControls(
                    Names.Hero,
                    new SceneObjectCommandIdle(
                        "idle",
                        0
                    ),
                    this.context.sceneController,
                    this.context.sceneController,
                    this.context.sceneController
                )
            }
        )

        debugPrint(this.previousHeroPosition)

        this.previousHeroPosition = startHeroPosition

        const heroPosition = this.context.sceneController.sceneObjectPosition(Names.Hero)
        const heroPositionX = Math.floor(heroPosition.x)
        const heroPositionY = Math.floor(heroPosition.z)
        const centerCursor = new GameVector2D(heroPositionX, heroPositionY)        
        this.mapController.generateRegion(
            {
                centerCursor: centerCursor,
                onlyFloor: true,
                overwrite: false
            }
        )

        this.mapController.putTeleportRandomly(
            {
                startCursor: centerCursor
            }
        )

        this.adaptMap()        
        this.addFireButton()    
        this.preCacheApple()    
        this.addHud()
    }

    private preCacheApple() {
        this.context.sceneController.addModelAt(
            {
                name: "apple",
                modelName: "com.demensdeum.arctica.apple",
                position: GameVector3.zeroBut({y: -2}),
                rotation: GameVector3.zero(),
                isMovable: true,
                controls: new DecorControls(
                    Names.Hero,
                    new SceneObjectCommandIdle(
                        "idle",
                        0
                    ),
                    this.context.sceneController,
                    this.context.sceneController,
                    this.context.sceneController
                )
            }
        )        
    }

    private moveLight() {
        let lightPosition = this.context.sceneController.sceneObjectPosition(
            Names.Hero
        ).clone()
        lightPosition.y += 1

        const heroRotation = this.context.sceneController.sceneObjectRotation(Names.Hero).clone()
        heroRotation.y += Utils.degreesToRadians(180)
        const diffX = Math.sin(heroRotation.y)
        const diffY = Math.cos(heroRotation.y)

        const ratio = 0.5
        const newX = lightPosition.x + diffX * ratio
        const newY = lightPosition.z + diffY * ratio

        lightPosition.x = newX
        lightPosition.z = newY

        this.context.sceneController.moveLight({position: lightPosition})
    }

    private moveCamera() {
        const debugCamera = false
        const cameraY = debugCamera ? 8 : 2
        const cameraZ = debugCamera ? 8 : 1

        const heroPosition = this.context.sceneController.sceneObjectPosition(Names.Hero)
        const cameraPosition = new GameVector3(
            heroPosition.x, 
            heroPosition.y + cameraY, 
            heroPosition.z + cameraZ
        )
        this.context.sceneController.moveAndRotateObject(
            {
                name: Names.Camera,
                position: cameraPosition,
                rotation: new GameVector3(Utils.degreesToRadians(-65), 0, 0)
            }
        )
    }

    step(): void {
        this.moveProjectile()
        this.moveLight()
        this.moveCamera()
        this.updateHud()
        this.inputController.step()

        const heroPosition = this.context.sceneController.sceneObjectPosition(Names.Hero)
        const heroPositionX = Math.floor(heroPosition.x)
        const heroPositionY = Math.floor(heroPosition.z)

        debugPrint(`${heroPosition.x}-${heroPosition.y}`)

        const previousHeroX = Math.floor(this.previousHeroPosition.x)
        const previousHeroY = Math.floor(this.previousHeroPosition.y)

        if (
            heroPositionX != previousHeroX || 
            heroPositionY != previousHeroY
        )
        {
            this.generateRegionIfNeeded()
            this.adaptMap()
            this.previousHeroPosition = new GameVector2D(heroPositionX, heroPositionY)
            if (this.checkTeleportEnter()) {
                return
            }
            this.takeAppleIfNeeded()
        }
    }

    private takeAppleIfNeeded() {
        const heroPosition = this.context.sceneController.sceneObjectPosition(Names.Hero)
        {
            const x = Math.floor(heroPosition.x + 0.5) 
            const y = Math.floor(heroPosition.z + 0.5) 
            if (this.mapController.isApple({position: new GameVector2D(x, y)})) {
                this.applesCount += 1
                this.mapController.removeApple({cursor:new GameVector2D(x, y)})
                this.mapAdapter.removeApple({cursor:new GameVector2D(x, y)})
                return
            }
        }
    }

    private checkTeleportEnter() {
        const heroPosition = this.context.sceneController.sceneObjectPosition(Names.Hero)
            const x = Math.floor(heroPosition.x + 0.5)
            const y = Math.floor(heroPosition.z + 0.5)
            if (this.mapController.isTeleport({position: new GameVector2D(x, y)})) {
                if (this.levelCount < this.lastLevel) {
                    this.levelCount += 1
                    this.initializeLevel()
                }
                else {
                    this.context.sceneController.removeAllSceneObjectsExceptCamera()
                    const endVideoState = new EndVideoState(
                        "EndVideoState",
                        this.context
                    )
                    this.context.transitionTo(endVideoState)
                    return true
                }
                return true
            }
        return false
    }

    private generateRegionIfNeeded() {
        const heroPosition = this.context.sceneController.sceneObjectPosition(Names.Hero)
        const heroPositionX = Math.floor(heroPosition.x)
        const heroPositionY = Math.floor(heroPosition.z)
        const centerCursor = new GameVector2D(heroPositionX, heroPositionY)  
        debugPrint(`Coordinates: ${heroPositionX} ${heroPositionY}`)      
        this.mapController.generateRegion(
            {
                centerCursor: centerCursor,
                onlyFloor: false,
                overwrite: false,
                roomFrequency: 400
            }
        )        
    }

    private adaptMap() {
        const heroPosition = this.context.sceneController.sceneObjectPosition(Names.Hero)
        const heroPositionX = Math.floor(heroPosition.x)
        const heroPositionY = Math.floor(heroPosition.z)
        const centerCursor = new GameVector2D(heroPositionX, heroPositionY)
        this.mapAdapter.adaptRegion({
            centerCursor: centerCursor,
            map: this.mapController.map
        })        
    }

    inputControllerDidReceive<T>(_: InputController, inputEvent: GameInputEvent<T>): void {
        if (inputEvent instanceof GameInputMouseEvent) {
            const inputDiffX = inputEvent.value.x
            const inputDiffY = inputEvent.value.y

            if (inputEvent.name == GameInputMouseEventNames.MouseMove) {
                let targetPosition = this.context.sceneController.sceneObjectPosition(
                    Names.Hero
                ).clone()

                let solidCheckPosition = this.context.sceneController.sceneObjectPosition(
                    Names.Hero
                ).clone()                

                const deumMode = false
                const speedLimit = deumMode ? 0.1 : 0.02
                const ratio = deumMode ? 0.2 : 0.12

                const diffXnegative = inputDiffX < 0
                const diffYnegative = inputDiffY < 0

                var diffX = Math.min(Math.abs(inputDiffX * ratio), Math.abs(speedLimit))
                var diffY = Math.min(Math.abs(inputDiffY * ratio), Math.abs(speedLimit))

                diffX = diffXnegative ? -diffX : diffX
                diffY = diffYnegative ? -diffY : diffY

                targetPosition.x += diffX
                targetPosition.z += diffY

                solidCheckPosition.x += 0.5 + diffX * 2
                solidCheckPosition.z += 0.5 + diffY * 2

                {
                    const solidCheckX = Math.floor(solidCheckPosition.x)
                    const solidCheckY = Math.floor(solidCheckPosition.z)
                    if (
                        this.mapController.isSolid(
                            {position: new GameVector2D(solidCheckX, solidCheckY)}
                        ) ||
                        this.mapController.isShark(
                            {position: new GameVector2D(solidCheckX, solidCheckY)}
                        )
                    )
                    {
                        debugPrint("Can't move - wall or shark")
                        return
                    }
                }

                if (this.isMoveAnimationPlaying == false) {
                    // this.context.sceneController.objectPlayAnimation(
                    //     {
                    //         name: Names.Hero,
                    //         animationName: "walk"
                    //     }
                    // )
                }
                this.context.sceneController.moveObject(
                    {
                        name: Names.Hero,
                        position: targetPosition
                    }
                )

                const rotationY = Math.atan2(
                    inputDiffX,
                    inputDiffY,
                )
    
                this.context.sceneController.rotateObject(
                    {
                        name: Names.Hero,
                        rotation: new GameVector3(0, Utils.degreesToRadians(180) + rotationY, 0)
                    }
                )                
            }
            else if (inputEvent.name == GameInputMouseEventNames.MouseUp) {
                this.isMoveAnimationPlaying = false
                // this.context.sceneController.objectStopAnimation(
                //     {
                //         name: Names.Hero,
                //         animationName: "walk"
                //     }
                // )
            }
        }
    }

}