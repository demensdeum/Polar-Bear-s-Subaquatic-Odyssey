import { Context } from "./context.js"
import { DecorControls } from "./decorControls.js"
import { GameMap } from "./gameMap.js"
import { GameMapTileEntity as GameMapTileEntity } from "./gameMapTileEntity.js"
import { GameVector2D } from "./gameVector2D.js"
import { GameVector3 } from "./gameVector3.js"
import { Options } from "./options.js"
import { debugPrint } from "./runtime.js"
import { SceneObjectCommandIdle } from "./sceneObjectCommandIdle.js"
import { Utils } from "./utils.js"

export class MapAdapter {

    private context: Context
    private addedTilesNames = new Set<string>()

    private apples = new Set<string>()
    private teleports = new Set<string>()
    private sharks = new Set<string>()

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
                        }
                    )
                    if (tile.entity == GameMapTileEntity.Teleport) {
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
                        this.teleports.add(teleportName)                   
                    }
                    else if (tile.entity == GameMapTileEntity.Apple) {
                        const appleName = `apple-${cubeName}`
                        this.context.sceneController.addModelAt(
                            {
                                name: appleName,
                                modelName: "com.demensdeum.arctica.apple",
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
                        this.context.sceneController.objectPlayAnimation({
                            name: appleName,
                            animationName: "rotation"
                        })   
                        this.apples.add(appleName)                                               
                    }
                    else if (tile.entity == GameMapTileEntity.Shark) {
                        const sharkName = `shark-${cubeName}`
                        this.context.sceneController.addModelAt(
                            {
                                name: sharkName,
                                modelName: "com.demensdeum.arctica.enemy",
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
                        this.context.sceneController.objectPlayAnimation({
                            name: sharkName,
                            animationName: "swim"
                        })   
                        this.sharks.add(sharkName)                                               
                    }
                }
            }
        }

        const unusedTiles = new Set([...oldTiles].filter(x => !newTiles.has(x)))
        unusedTiles.forEach(x => this.deleteTile({
            name: x
        }))
    }

    public removeApple(args:{
        cursor: GameVector2D
    }) {
        const cursor = args.cursor
        const appleName = `apple-cube-${cursor.x}-${cursor.y}`
        if (this.apples.has(appleName)) {
            this.context.sceneController.removeSceneObjectWithName(appleName)
            this.apples.delete(appleName)
        }
    }

    public removeShark(args:{
        cursor: GameVector2D
    }) {
        const cursor = args.cursor
        const sharkName = `shark-cube-${cursor.x}-${cursor.y}`
        if (this.sharks.has(sharkName)) {
            this.context.sceneController.removeSceneObjectWithName(sharkName)
            this.sharks.delete(sharkName)
        }
    }    

    private deleteTile(args: {
        name: string
    }) {
        const name = args.name
        this.context.sceneController.removeSceneObjectWithName(args.name)
        this.addedTilesNames.delete(args.name)

        const appleName = `apple-${name}`
        if (this.apples.has(appleName)) {
            this.context.sceneController.removeSceneObjectWithName(appleName)
            this.apples.delete(appleName)
        }

        const teleportName = `teleport-${name}`
        if (this.teleports.has(teleportName)) {
            this.context.sceneController.removeSceneObjectWithName(teleportName)
            this.teleports.delete(teleportName)
        }

        const sharkName = `shark-${name}`
        if (this.sharks.has(sharkName)) {
            this.context.sceneController.removeSceneObjectWithName(sharkName)
            this.sharks.delete(sharkName)
        }
    }

}