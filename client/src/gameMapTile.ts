import { GameMapTileItem } from "./gameMapTileEntity.js"

export class GameMapTile {
    public readonly isSolid: boolean
    public readonly entity: GameMapTileItem

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
        this.entity = item
    }

    public isTeleport() {
        return this.entity == GameMapTileItem.Teleport
    }

    public isApple() {
        return this.entity == GameMapTileItem.Apple
    }    

    public isShark() {
        return this.entity == GameMapTileItem.Shark
    }
}