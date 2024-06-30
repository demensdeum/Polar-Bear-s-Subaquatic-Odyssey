import { GameMapTileItem } from "./gameMapTileItem.js"

export class GameMapTile {
    public readonly isSolid: boolean
    public readonly item: GameMapTileItem

    constructor(
        args: {
            isSolid: boolean
            item?: GameMapTileItem
        }
    )
    {
        const {
            item = GameMapTileItem.None
        } = args

        this.isSolid = args.isSolid
        this.item = item
    }

    public isTeleport() {
        return this.item == GameMapTileItem.Teleport
    }

    public isApple() {
        return this.item == GameMapTileItem.Apple
    }    
}