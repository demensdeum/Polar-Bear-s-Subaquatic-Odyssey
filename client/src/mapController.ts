import { GameMap } from "./gameMap.js";
import { GameVector2D } from "./gameVector2D.js";

export class MapController {

    public map = new GameMap()

    public initializeMap() {
        this.map = new GameMap()
        this.map.startPoint = new GameVector2D(0, 0)
        for (var y = 0; y < 5; y++) {
            for (var x = 0; x < 5; x++) {
                const cursorX = this.map.startPoint.x - 2 + x
                const cursorY = this.map.startPoint.y - 2 + y
                this.map.setFloor({
                    position: new GameVector2D(cursorX, cursorY)
                })
            }
        }
    }

}