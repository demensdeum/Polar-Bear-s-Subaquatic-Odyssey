import { State } from "./state.js"
import { debugPrint } from "./runtime.js"
import { Context } from "./context.js"

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
    }

    step(): void {
    }

}