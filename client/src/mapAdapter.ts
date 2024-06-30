import { Context } from "./context.js"
import { DecorControls } from "./decorControls.js"
import { GameMap } from "./gameMap.js"
import { GameMapTile } from "./gameMapTile.js"
import { GameVector2D } from "./gameVector2D.js"
import { GameVector3 } from "./gameVector3.js"
import { Options } from "./options.js"
import { debugPrint } from "./runtime.js"
import { SceneObjectCommandIdle } from "./sceneObjectCommandIdle.js"
import { Utils } from "./utils.js"

export class MapAdapter {

    private context: Context
    private addedTilesNames = new Set<string>()
    private addedTiles: { [key: string]: GameMapTile } = {};

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
        let newTiles = new Set<string>()
        const oldTiles = new Set<string>(this.addedTilesNames)
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
                    newTiles.add(cubeName)
                    if (this.addedTilesNames.has(cubeName)) {
                        continue
                    }
                    this.addedTilesNames.add(cubeName)
                    this.addedTiles[cubeName] = tile
                    const cubeY = tile.isSolid ? 0 : -1
                    this.context.sceneController.addModelAt(
                        {
                            name: cubeName,
                            modelName: tile.isSolid ? "com.demensdeum.arctica.floor" : "com.demensdeum.arctica.wall",
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
                            ),
                            transparent: tile.isSolid,
                            opacity: tile.isSolid ? 0.8 : 1.0
                        }
                    )
                    if (tile.containsTeleport) {
                        const teleportName = `teleport-${cubeName}`
                        this.context.sceneController.addModelAt(
                            {
                                name: teleportName,
                                modelName: "com.demensdeum.arctica.teleport",
                                position: new GameVector3(cursorX, 0, cursorY),
                                rotation: new GameVector3(0, Utils.degreesToRadians(Utils.randomInt(360)), 0),
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
                                ),
                            }
                        )                        
                    }
                }
            }
        }

        const unusedTiles = new Set([...oldTiles].filter(x => !newTiles.has(x)))
        unusedTiles.forEach(x => this.deleteTile({
            name: x,
            tile: this.addedTiles[x]
        }))
    }

    private deleteTile(args: {
        name: string,
        tile: GameMapTile
    }) {
        args.tile.forEachChild(x => this.context.sceneController.removeSceneObjectWithName(x))
        this.context.sceneController.removeSceneObjectWithName(args.name)
        this.addedTilesNames.delete(args.name)
    }

}