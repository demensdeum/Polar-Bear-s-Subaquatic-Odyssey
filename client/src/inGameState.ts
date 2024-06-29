import { State } from "./state.js"
import { debugPrint } from "./runtime.js"
import { Context } from "./context.js"
import { DecorControls } from "./decorControls.js"
import { SceneObjectCommandIdle } from "./sceneObjectCommandIdle.js"
import { Names } from "./names.js"
import { GameVector3 } from "./gameVector3.js"

export class InGameState implements State {

    public name: string
    context: Context

    private cubeX = 0;

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

        this.context.sceneController.addModelAt(
            {
                name: Names.Hero,
                modelName: "com.demensdeum.hero",
                position: new GameVector3(0, 0, 0),
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
                position: new GameVector3(0, 0, -2),
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

        this.context.sceneController.moveObjectTo(
            {
                name: Names.Camera,
                position: new GameVector3(0, 0, 0)
            }
        )
    }

    step(): void {
        this.context.sceneController.rotateObjectTo(
            "cube",
            0,
            this.cubeX,
            0
        )
        this.cubeX += 0.04
    }

}