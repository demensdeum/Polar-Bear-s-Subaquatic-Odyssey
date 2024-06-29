import { Context } from "./context.js"
import { DecorControls } from "./decorControls.js"
import { GameMap } from "./gameMap.js"
import { GameVector2D } from "./gameVector2D.js"
import { GameVector3 } from "./gameVector3.js"
import { debugPrint } from "./runtime.js"
import { SceneObjectCommandIdle } from "./sceneObjectCommandIdle.js"

export class MapAdapter {

    private context: Context

    constructor(
        context: Context
    )
    {
        this.context = context
        debugPrint(this.context)
    }

    public adapt(args: {
        map: GameMap
    }) {
        const map = args.map
        for (var y = -100; y < 100; y++) {
            for (var x = -100; x < 100; x++) {
                const tile = map.tileAt({
                    position: new GameVector2D(x, y)
                })
                if (tile && tile.isSolid == false) {
                    debugger
                    this.context.sceneController.addModelAt(
                        {
                            name: `cube-${x}-${y}`,
                            modelName: "com.demensdeum.arctica.cube",
                            position: new GameVector3(x, -1, y),
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