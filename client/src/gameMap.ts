import { GameMapTile } from "./gameMapTile.js";
import { GameVector2D } from "./gameVector2D.js";

export class GameMap {
    
    public startPoint: GameVector2D = new GameVector2D(0,0)
    public tiles: { [key: string]: GameMapTile } = {};

    public tileAt(args :{
        position: GameVector2D
    })
    {
        const position = args.position 
        const key = `${position.x}-${position.y}`
        return this.tiles[key]
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