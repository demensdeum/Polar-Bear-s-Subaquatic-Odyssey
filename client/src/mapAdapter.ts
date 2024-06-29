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
        const region = 6
        for (var cursorY = centerCursor.y - region * 0.5; cursorY < centerCursor.y + region; cursorY++) {
            for (var cursorX = centerCursor.x - region * 0.5; cursorX < centerCursor.x + region; cursorX++) {
                const tile = map.tileAt({
                    position: new GameVector2D(cursorX, cursorY)
                })
                if (tile) {
                    const cubeName = `cube-${cursorX}-${cursorY}`
                    if (this.addedCubes.has(cubeName)) {
                        continue
                    }
                    this.addedCubes.add(cubeName)
                    const cubeY = tile.isSolid ? 0 : -1
                    this.context.sceneController.addModelAt(
                        {
                            name: cubeName,
                            modelName: "com.demensdeum.arctica.cube",
                            position: new GameVector3(cursorX, cubeY, cursorY),
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