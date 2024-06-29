import { State } from "./state.js"
import { debugPrint } from "./runtime.js"
import { Context } from "./context.js"
import { DecorControls } from "./decorControls.js"
import { SceneObjectCommandIdle } from "./sceneObjectCommandIdle.js"
import { Names } from "./names.js"
import { GameVector3 } from "./gameVector3.js"
import { Utils } from "./utils.js"

export class InGameState implements State {

    public name: string
    context: Context

    private topCamera = true;

    constructor(
        name: string,
        context: Context
    ) {
        this.name = name
        this.context = context
    }

    initialize(): void {
        debugPrint("InGameState initialized")
        debugPrint(this.context)

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

    step(): void {

        if (this.topCamera) {
            this.context.sceneController.moveObject(
                {
                    name: Names.Camera,
                    position: new GameVector3(0, 2, 0.4)
                }
            )
                this.context.sceneController.rotateObject({
                    name: Names.Camera,
                    rotation: new GameVector3(Utils.degreesToRadians(-45), 0, 0)
                }
            )
        }
    }

}