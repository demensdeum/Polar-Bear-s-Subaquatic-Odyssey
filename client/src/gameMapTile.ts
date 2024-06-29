export class GameMapTile {
    public readonly isSolid: boolean
    constructor(
        args: {
            isSolid: boolean
        }
    )
    {
        this.isSolid = args.isSolid
    }
}