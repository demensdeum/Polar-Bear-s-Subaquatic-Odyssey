import { GameMapTileEntity } from "./gameMapTileEntity.js"

export class GameMapTile {
    public readonly isSolid: boolean
    public readonly entity: GameMapTileEntity

    constructor(
        args: {
            isSolid: boolean
            item?: GameMapTileEntity
        }
    )
    {
        const {
            item = GameMapTileEntity.None
        } = args

        this.isSolid = args.isSolid
        this.entity = item
    }

    public isTeleport() {
        return this.entity == GameMapTileEntity.Teleport
    }

    public isApple() {
        return this.entity == GameMapTileEntity.Apple
    }    

    public isShark() {
        return this.entity == GameMapTileEntity.Shark
    }
}