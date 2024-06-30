import { GameMap } from "./gameMap.js";
import { GameVector2D } from "./gameVector2D.js";
import { Utils } from "./utils.js";
import { Options } from "./options.js";
import { int } from "./types.js";

export class MapController {

    public map = new GameMap()

    public generateRegion(
        args: {
            cursor: GameVector2D,
            onlyFloor: boolean,
            roomFrequency?: int,
            overwrite?: boolean
        }
    ) {
        const {
            overwrite = false,
            roomFrequency = 40
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
                        const isRoom = Utils.randomInt(roomFrequency) == 0
                        if (isRoom) {
                            this.putRoomAt(
                                {
                                    centerCursor: new GameVector2D(cursorX, cursorY)
                                }
                            )
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

    public putExitRandomly(args:{
        startCursor: GameVector2D
    }) {
        const startCursor = args.startCursor
        var cursor = startCursor.clone()
        const rounds = 6 + Utils.randomInt(10)
        for (var i = 0; i < rounds; i++) {
            const cursorDirectionRandom = Utils.randomInt(4)
            switch (cursorDirectionRandom) {
                case 0:
                    cursor = this.drawLineUp({startCursor: cursor, length: 4 + Utils.randomInt(10)})
                case 1:
                    cursor = this.drawLineLeft({startCursor: cursor, length: 4 + Utils.randomInt(10)})
                case 2:
                    cursor = this.drawLineRight({startCursor: cursor, length: 4 + Utils.randomInt(10)})
                case 3:
                    cursor = this.drawLineDown({startCursor: cursor, length: 4 + Utils.randomInt(10)})
            }
        }
        this.map.setFloor({position: cursor})
        this.map.setTeleport({position: cursor})
    }

    private drawLineUp(args: {
        startCursor: GameVector2D,
        length: int
    }): GameVector2D
    {
        const length = args.length
        let cursor = args.startCursor.clone()
        for (var i = 0; i < length; i++) {
            this.map.setFloor({position: cursor})
            cursor.y -= 1
        }
        debugger
        return cursor
    }

    private drawLineDown(args: {
        startCursor: GameVector2D,
        length: int
    }): GameVector2D
    {
        const length = args.length
        let cursor = args.startCursor.clone()
        for (var i = 0; i < length; i++) {
            this.map.setFloor({position: cursor})
            cursor.y += 1
        }
        return cursor
    }

    private drawLineLeft(args: {
        startCursor: GameVector2D,
        length: int
    }): GameVector2D
    {
        const length = args.length
        let cursor = args.startCursor.clone()
        for (var i = 0; i < length; i++) {
            this.map.setFloor({position: cursor})
            cursor.x -= 1
        }
        return cursor
    }

    private drawLineRight(args: {
        startCursor: GameVector2D,
        length: int
    }): GameVector2D
    {
        const length = args.length
        let cursor = args.startCursor.clone()
        for (var i = 0; i < length; i++) {
            this.map.setFloor({position: cursor})
            cursor.x += 1
        }
        return cursor
    }

    private putRoomAt(args: {
        centerCursor: GameVector2D
    })
    {
        const centerCursor = args.centerCursor
        const roomSizeWidth = 5 + Utils.randomInt(Options.visibleMapRegion)
        const roomSizeHeight = 5 + Utils.randomInt(Options.visibleMapRegion)

        const startCursorX = centerCursor.x - Math.floor(roomSizeWidth * 0.5)
        const startCursorY = centerCursor.y - Math.floor(roomSizeHeight * 0.5)

        for (var y = 0; y < roomSizeHeight; y++) {
            for (var x = 0; x < roomSizeWidth; x++) {
                const cursorX = startCursorX + x;
                const cursorY = startCursorY + y;
                this.map.setFloor({
                    position: new GameVector2D(cursorX, cursorY)
                })
            }
        }

    }

}