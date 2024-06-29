import { Context } from "./context.js"
import { DecorControls } from "./decorControls.js"
import { GameMap } from "./gameMap.js"
import { GameVector2D } from "./gameVector2D.js"
import { GameVector3 } from "./gameVector3.js"
import { Options } from "./options.js"
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

    public adaptRegion(args: {
        centerCursor: GameVector2D
        map: GameMap
    }) {
        let newCubes = new Set<string>()
        const oldCubes = new Set<string>(this.addedCubes)
        const map = args.map
        const centerCursor = args.centerCursor
        const region = Options.visibleMapRegion
        const startCursorX = centerCursor.x - Math.floor(region * 0.5)
        const startCursorY = centerCursor.y - Math.floor(region * 0.5)
        for (var cursorY = startCursorY; cursorY < centerCursor.y + region; cursorY++) {
            for (var cursorX = startCursorX; cursorX < centerCursor.x + region; cursorX++) {
                const tile = map.tileAt({
                    position: new GameVector2D(cursorX, cursorY)
                })
                if (tile) {
                    const cubeName = `cube-${cursorX}-${cursorY}`
                    newCubes.add(cubeName)
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

        const unusedCubes = new Set([...oldCubes].filter(x => !newCubes.has(x)))
        unusedCubes.forEach(x => this.deleteCube(x))
    }

    private deleteCube(name: string) {
        this.context.sceneController.removeSceneObjectWithName(name)
        this.addedCubes.delete(name)
    }

}