import { GameMap } from "./gameMap.js";
import { GameVector2D } from "./gameVector2D.js";
import { Utils } from "./utils.js";
import { Options } from "./options.js";
import { int } from "./types.js";

export class MapController {

    public map = new GameMap()

    public generateRegion(
        args: {
            centerCursor: GameVector2D,
            onlyFloor: boolean,
            roomFrequency?: int,
            overwrite?: boolean
        }
    ) {
        const {
            overwrite = false,
            roomFrequency = 40
        } = args;

        const centerCursor = args.centerCursor
        const region = Options.visibleMapRegion
        for (var y = 0; y < region; y++) {
            for (var x = 0; x < region; x++) {
                const cursorX = centerCursor.x - Math.floor(region * 0.5) + x
                const cursorY = centerCursor.y - Math.floor(region * 0.5) + y
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
                            if (Utils.randomInt(10) == 0) {
                                const itemCursor = new GameVector2D(cursorX, cursorY)
                                this.putRandomEntity(
                                    {cursor: itemCursor}
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    public isTeleport(args: {
        position: GameVector2D
    }) {
        const tile = this.map.tileAt({position: args.position})
        if (tile == null) {
            debugger
        }
        return tile.isTeleport()
    }

    public isSolid(args: {
        position: GameVector2D
    }) {
        const tile = this.map.tileAt({position: args.position})
        if (tile == null) {
            debugger
        }
        return tile.isSolid
    }

    public isApple(args: {
        position: GameVector2D
    }) {
        const tile = this.map.tileAt({position: args.position})
        if (tile == null) {
            debugger
        }
        return tile.isApple()
    }    

    public removeApple(args:
        {
            cursor:GameVector2D
        }
    )
    {
        this.map.setFloor({position: args.cursor})
    }

    private putRandomEntity(args:{
        cursor: GameVector2D
    }) {
        if (Utils.randomBool()) {
            this.map.setApple({position: args.cursor.clone()})
        }
        else {
            this.map.setShark({position: args.cursor.clone()})
        }
    }

    public putTeleportRandomly(args:{
        startCursor: GameVector2D
    }) {
        const startCursor = args.startCursor
        var cursor = startCursor.clone()
        const teleportDebug = false
        const rounds = teleportDebug ? 2 : 6 + Utils.randomInt(10)
        for (var i = 0; i < rounds; i++) {
            const cursorDirectionRandom = Utils.randomInt(4)
            switch (cursorDirectionRandom) {
                case 0:
                    cursor = this.drawLineUp({startCursor: cursor, length: 4 + Utils.randomInt(10)})
                    break
                case 1:
                    cursor = this.drawLineLeft({startCursor: cursor, length: 4 + Utils.randomInt(10)})
                    break
                case 2:
                    cursor = this.drawLineRight({startCursor: cursor, length: 4 + Utils.randomInt(10)})
                    break
                case 3:
                    cursor = this.drawLineDown({startCursor: cursor, length: 4 + Utils.randomInt(10)})
                    break
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