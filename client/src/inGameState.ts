import { State } from "./state.js"
import { debugPrint } from "./runtime.js"
import { Context } from "./context.js"
import { DecorControls } from "./decorControls.js"
import { SceneObjectCommandIdle } from "./sceneObjectCommandIdle.js"

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
            "bear",
            "com.demensdeum.hero",
            0,
            -0.6,
            -1.6,
            0,
            0,
            0,
            true,
            new DecorControls(
                "hero",
                new SceneObjectCommandIdle(
                    "idle",
                    0
                ),
                this.context.sceneController,
                this.context.sceneController,
                this.context.sceneController
            )            
        )

        this.context.sceneController.addModelAt(
            "cube",
            "com.demensdeum.arctica.cube",
            0,
            0,
            -2,
            0,
            0,
            0,
            true,
            new DecorControls(
                "hero",
                new SceneObjectCommandIdle(
                    "idle",
                    0
                ),
                this.context.sceneController,
                this.context.sceneController,
                this.context.sceneController
            )            
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