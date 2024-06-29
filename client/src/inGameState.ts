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

export class InGameState implements State,
                                    InputControllerDelegate {

    public readonly name: string
    context: Context

    private topCamera = true;
    private inputController: InputController
    private canvas: HTMLCanvasElement

    constructor(
        name: string,
        canvas: HTMLCanvasElement,
        context: Context
    ) {
        this.name = name
        this.context = context
        this.canvas = canvas        
        this.inputController = new InputController(this.canvas, this)
    }

    initialize(): void {
        debugPrint("InGameState initialized")
        debugPrint(this.context)

        debugPrint(this.canvas)
        debugPrint(this.inputController)

        this.context.sceneController.switchSkyboxIfNeeded(
            {
                name: "com.demensdeum.arctic.black",
                environmentOnly: false
            }
        )        

        this.context.sceneController.addModelAt(
            {
                name: Names.Hero,
                modelName: "com.demensdeum.hero",
                position: new GameVector3(0, 0, -2),
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

        this.context.sceneController.addModelAt(
            {
                name: "cube",
                modelName: "com.demensdeum.arctica.cube",
                position: new GameVector3(0, -1, -2),
                rotation: new GameVector3(0, 0, 0),
                isMovable: true,
                controls: new DecorControls(
                    "cube",
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

    private topdownCameraIfNeeded() {
        if (!this.topCamera) {
            return
        }
        this.context.sceneController.moveAndRotateObject(
            {
                name: Names.Camera,
                position: new GameVector3(0, 2, 0.4),
                rotation: new GameVector3(Utils.degreesToRadians(-45), 0, 0)
            }
        )              
    }

    step(): void {
        this.topdownCameraIfNeeded()
        this.inputController.step()
    }

    inputControllerDidReceive<T>(_: InputController, inputEvent: GameInputEvent<T>): void {
        debugPrint(inputEvent)
    }

}