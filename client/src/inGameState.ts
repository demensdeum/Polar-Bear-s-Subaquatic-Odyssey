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

    private mapController =  new MapController()
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
        this.mapAdapter = new MapAdapter(context)
    }

    initialize(): void {
        debugPrint("InGameState initialized")
        debugPrint(this.context)

        debugPrint(this.canvas)
        debugPrint(this.inputController)

        this.context.sceneController.addLight();
        this.initializeLevel()
    }

    private initializeLevel() {
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

        // this.context.sceneController.addModelAt(
        //     {
        //         name: Names.Bottom,
        //         modelName: "com.demensdeum.arctica.bottom",
        //         position: new GameVector3(startHeroPosition.x, startHeroPosition.y - 2, startHeroPosition.z),
        //         rotation: new GameVector3(0, 0, 0),
        //         isMovable: true,
        //         controls: new DecorControls(
        //             Names.Hero,
        //             new SceneObjectCommandIdle(
        //                 "idle",
        //                 0
        //             ),
        //             this.context.sceneController,
        //             this.context.sceneController,
        //             this.context.sceneController
        //         )
        //     }
        // )

        this.adaptMap()        
    }

    private moveLight() {
        let lightPosition = this.context.sceneController.sceneObjectPosition(
            Names.Hero
        ).clone()
        lightPosition.y += 1.45
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
        this.moveLight()
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
                this.mapController.removeApple({cursor:new GameVector2D(x, y)})
                this.mapAdapter.removeApple({cursor:new GameVector2D(x, y)})
                return
            }
        }
    }

    private checkTeleportEnter() {
        const heroPosition = this.context.sceneController.sceneObjectPosition(Names.Hero)
        {
            const x = Math.ceil(heroPosition.x)
            const y = Math.ceil(heroPosition.z)
            if (this.mapController.isTeleport({position: new GameVector2D(x, y)})) {
                this.initializeLevel()
                return true
            }
        }
        {
            const x = Math.floor(heroPosition.x)
            const y = Math.floor(heroPosition.z)
            if (this.mapController.isTeleport({position: new GameVector2D(x, y)})) {
                this.initializeLevel()
                return true
            }
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

                const deumMode = true
                const speedLimit = deumMode ? 0.1 : 0.02
                const ratio = 0.2

                const diffX = Math.min(inputDiffX * ratio, speedLimit)
                const diffY = Math.min(inputDiffY * ratio, speedLimit)

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
                        )
                    )
                    {
                        debugPrint("Can't move - wall")
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