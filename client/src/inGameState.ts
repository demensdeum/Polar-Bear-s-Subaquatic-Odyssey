import { State } from "./state.js"
import { debugPrint } from "./runtime.js"
import { Context } from "./context.js"
import { DecorControls } from "./decorControls.js"
import { SceneObjectCommandIdle } from "./sceneObjectCommandIdle.js"

export class InGameState implements State {
    
    public name: string
    context: Context

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

    }

    step(): void {
    }

}