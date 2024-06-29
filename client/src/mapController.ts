import { GameMap } from "./gameMap.js";
import { GameVector2D } from "./gameVector2D.js";
import { Utils } from "./utils.js";
import { Options } from "./options.js";

export class MapController {

    public map = new GameMap()

    public generateRegion(
        args: {
            cursor: GameVector2D,
            onlyFloor: boolean,
            overwrite?: boolean
        }
    ) {
        const {
            overwrite = false
        } = args;

        const cursor = args.cursor
        const region = Options.visibleMapRegion
        for (var y = 0; y < region; y++) {
            for (var x = 0; x < region; x++) {
                const cursorX = cursor.x - Math.floor(region * 0.5) + x
                const cursorY = cursor.y - Math.floor(region * 0.5) + y
                if (!overwrite && this.map.tileAt({position: new GameVector2D(cursorX, cursorY)})) {
                    continue
                }
                if (args.onlyFloor) {
                    this.map.setFloor({
                        position: new GameVector2D(cursorX, cursorY)
                    })
                }
                else {
                    const isSolid = Utils.randomBool()
                    if (isSolid) {
                        this.map.setWall({
                            position: new GameVector2D(cursorX, cursorY)
                        })
                    }
                    else {
                        this.map.setFloor({
                            position: new GameVector2D(cursorX, cursorY)
                        })
                    }
                }
            }
        }
    }

}