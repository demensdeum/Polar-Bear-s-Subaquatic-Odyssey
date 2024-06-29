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
        const map = args.map
        const centerCursor = args.centerCursor;
        const region = Options.visibleMapRegion
        for (var cursorY = centerCursor.y - Math.floor(region * 0.5); cursorY < centerCursor.y + region; cursorY++) {
            for (var cursorX = centerCursor.x - Math.floor(region * 0.5); cursorX < centerCursor.x + region; cursorX++) {
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

        // top clear
        for (var i = -1; i < Options.visibleMapRegion + 1; i++) {
            const x = centerCursor.x - Math.floor(region * 0.5) + i
            const y = centerCursor.y - Math.floor(region * 0.5) - 1
            const cubeName = `cube-${x}-${y}`
            if (this.addedCubes.has(cubeName)) {
                this.addedCubes.delete(cubeName)
                this.context.sceneController.removeSceneObjectWithName(cubeName)
            }
        }

        // bottom clear

        for (var i = -1; i < Options.visibleMapRegion + 1; i++) {
            const x = centerCursor.x - Math.floor(region * 0.5) + i
            const y = centerCursor.y - Math.floor(region * 0.5) + Options.visibleMapRegion + 1
            const cubeName = `cube-${x}-${y}`
            if (this.addedCubes.has(cubeName)) {
                this.addedCubes.delete(cubeName)
                this.context.sceneController.removeSceneObjectWithName(cubeName)
            }
        }

        // left clear

        for (var i = -1; i < Options.visibleMapRegion + 1; i++) {
            const x = centerCursor.x - Math.floor(region * 0.5) - 1
            const y = centerCursor.y - Math.floor(region * 0.5) + i
            const cubeName = `cube-${x}-${y}`
            if (this.addedCubes.has(cubeName)) {
                this.addedCubes.delete(cubeName)
                this.context.sceneController.removeSceneObjectWithName(cubeName)
            }
        }

        //right clear

        for (var i = -1; i < Options.visibleMapRegion + 1; i++) {
            const x = centerCursor.x - Math.floor(region * 0.5) + Options.visibleMapRegion + 1
            const y = centerCursor.y - Math.floor(region * 0.5) + i
            const cubeName = `cube-${x}-${y}`
            if (this.addedCubes.has(cubeName)) {
                this.addedCubes.delete(cubeName)
                this.context.sceneController.removeSceneObjectWithName(cubeName)
            }
        }

        for (var i = -1; i < Options.visibleMapRegion + 1; i++) {
            const x = centerCursor.x - Math.floor(region * 0.5) + Options.visibleMapRegion + 2
            const y = centerCursor.y - Math.floor(region * 0.5) + i
            const cubeName = `cube-${x}-${y}`
            if (this.addedCubes.has(cubeName)) {
                this.addedCubes.delete(cubeName)
                this.context.sceneController.removeSceneObjectWithName(cubeName)
            }
        }


    }

}