import { Context } from "./context.js"
import { DecorControls } from "./decorControls.js"
import { GameMap } from "./gameMap.js"
import { GameVector2D } from "./gameVector2D.js"
import { GameVector3 } from "./gameVector3.js"
import { debugPrint } from "./runtime.js"
import { SceneObjectCommandIdle } from "./sceneObjectCommandIdle.js"

export class MapAdapter {

    private context: Context
    private addedCubes = new Set<string>()

    constructor(
        context: Context
    )
    {
        this.context = context
        debugPrint(this.context)
    }

    public adapt(args: {
        centerCursor: GameVector2D
        map: GameMap
    }) {
        const map = args.map
        const centerCursor = args.centerCursor;
        const range = 6
        for (var cursorY = centerCursor.y - range * 0.5; cursorY < centerCursor.y + range; cursorY++) {
            for (var cursorX = centerCursor.x - range * 0.5; cursorX < centerCursor.x + range; cursorX++) {
                const tile = map.tileAt({
                    position: new GameVector2D(cursorX, cursorY)
                })
                if (tile && tile.isSolid == false) {
                    const cubeName = `cube-${cursorX}-${cursorY}`
                    if (this.addedCubes.has(cubeName)) {
                        continue
                    }
                    this.addedCubes.add(cubeName)
                    this.context.sceneController.addModelAt(
                        {
                            name: cubeName,
                            modelName: "com.demensdeum.arctica.cube",
                            position: new GameVector3(cursorX, -1, cursorY),
                            rotation: new GameVector3(0, 0, 0),
                            isMovable: true,
                            controls: new DecorControls(
                                "cube",
                                new SceneObjectCommandIdle(
                                    "idle",
                                    0
                                ),
                                this.context.sceneController,
                                this.context.sceneController,
                                this.context.sceneController
                            )
                        }
                    )
                }
            }
        }

        debugPrint(map)
    }

}