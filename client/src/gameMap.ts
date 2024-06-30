import { GameMapTile } from "./gameMapTile.js";
import { GameMapTileEntity } from "./gameMapTileEntity.js";
import { GameVector2D } from "./gameVector2D.js";

export class GameMap {
    
    public tiles: { [key: string]: GameMapTile } = {};

    public setTeleport(args: {
        position: GameVector2D
    })
    {
        const position = args.position 
        const key = `${position.x}-${position.y}`
        this.tiles[key] = new GameMapTile(
            {
                isSolid: false,
                item: GameMapTileEntity.Teleport
            }
        )
    }

    public tileAt(args :{
        position: GameVector2D
    })
    {
        const position = args.position 
        const key = `${position.x}-${position.y}`
        return this.tiles[key]
    }

    public setShark(args:{
        position: GameVector2D
    })
    {
        const tile = new GameMapTile(
            {
                isSolid: false,
                item: GameMapTileEntity.Shark
            }
        )

        const position = args.position
        const key = `${position.x}-${position.y}`
        this.tiles[key] = tile     
    }

    public setApple(args:{
        position: GameVector2D
    })
    {
        const tile = new GameMapTile(
            {
                isSolid: false,
                item: GameMapTileEntity.Apple
            }
        )

        const position = args.position
        const key = `${position.x}-${position.y}`
        this.tiles[key] = tile     
    }

    public setFloor(args: {
        position: GameVector2D
    })
    {
        const position = args.position
        const key = `${position.x}-${position.y}`
        this.tiles[key] = this.floorTile()
    }

    public setWall(args: {
        position: GameVector2D
    })
    {
        const position = args.position
        const key = `${position.x}-${position.y}`
        this.tiles[key] = this.wallTile()
    }    

    private floorTile() {
        const tile = new GameMapTile({
            isSolid: false
        })
        return tile
    }

    private wallTile() {
        const tile = new GameMapTile({
            isSolid: true
        })
        return tile
    }
}