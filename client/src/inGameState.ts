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

export class InGameState implements State,
    InputControllerDelegate {

    public readonly name: string
    context: Context

    private isMoveAnimationPlaying = false
    private inputController: InputController
    private canvas: HTMLCanvasElement

    private mapController: MapController
    private mapAdapter: MapAdapter

    private previousHeroPosition = new GameVector2D(0,0)

    constructor(
        name: string,
        canvas: HTMLCanvasElement,
        context: Context
    ) {
        this.name = name
        this.context = context
        this.canvas = canvas
        this.inputController = new InputController(this.canvas, this)
        this.mapController =  new MapController()
        this.mapAdapter = new MapAdapter(context)
    }

    initialize(): void {
        debugPrint("InGameState initialized")
        debugPrint(this.context)

        debugPrint(this.canvas)
        debugPrint(this.inputController)

        this.initializeLevel()
    }

    private initializeLevel() {
        this.context.sceneController.removeAllSceneObjectsExceptCamera()
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

        this.mapController.putExitRandomly(
            {
                startCursor: centerCursor
            }
        )

        this.context.sceneController.addModelAt(
            {
                name: Names.Bottom,
                modelName: "com.demensdeum.arctica.bottom",
                position: new GameVector3(startHeroPosition.x, startHeroPosition.y - 2, startHeroPosition.z),
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

        this.adaptMap()        
    }

    private moveCamera() {
        const debugCamera = true
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
        this.moveCamera()
        this.inputController.step()

        const heroPosition = this.context.sceneController.sceneObjectPosition(Names.Hero)
        const heroPositionX = Math.floor(heroPosition.x)
        const heroPositionY = Math.floor(heroPosition.z)

        debugPrint(`${heroPosition.x}-${heroPosition.y}`)

        this.context.sceneController.moveObject({
            name: Names.Bottom,
            position: new GameVector3(heroPosition.x, heroPosition.y - 1.5, heroPosition.z)
        })

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
        }
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
            const diffX = inputEvent.value.x
            const diffY = inputEvent.value.y

            if (inputEvent.name == GameInputMouseEventNames.MouseMove) {
                let position = this.context.sceneController.sceneObjectPosition(
                    Names.Hero
                )

                const speedLimit = 0.02
                const ratio = 0.2

                position.x += Math.min(diffX * ratio, speedLimit)
                position.z += Math.min(diffY * ratio, speedLimit)

                if (this.isMoveAnimationPlaying == false) {
                    this.context.sceneController.objectPlayAnimation(
                        {
                            name: Names.Hero,
                            animationName: "walk"
                        }
                    )
                }
                this.context.sceneController.moveObject(
                    {
                        name: Names.Hero,
                        position: position
                    }
                )

                const rotationY = Math.atan2(
                    diffX,
                    diffY,
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
                this.context.sceneController.objectStopAnimation(
                    {
                        name: Names.Hero,
                        animationName: "walk"
                    }
                )
            }
        }
    }

}