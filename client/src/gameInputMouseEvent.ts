import { GameInputEvent } from "./gameInputEvent.js"
import { GameVector2D } from "./gameVector2D.js";

export class GameInputMouseEvent implements GameInputEvent<GameVector2D> {
    public readonly name: string
    public value: GameVector2D

    constructor(
        args: {
        name: string,
        value: GameVector2D
    }) {
        this.name = args.name
        this.value = args.value
    }
}