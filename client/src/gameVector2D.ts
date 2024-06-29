export class GameVector2D {
    public x: number;
    public y: number;

    constructor(
        x: number,
        y: number
    )
    {
        this.x = x;
        this.y = y;
    }

    public clone() {
        return new GameVector2D(
            this.x,
            this.y
        )
    }
}