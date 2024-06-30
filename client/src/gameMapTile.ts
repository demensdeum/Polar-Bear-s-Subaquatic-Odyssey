export class GameMapTile {
    public readonly isSolid: boolean
    public readonly containsTeleport: boolean

    private childsNames = new Set<string>()

    constructor(
        args: {
            isSolid: boolean
            containsTeleport?: boolean
        }
    )
    {
        const {
            containsTeleport = false
        } = args

        this.isSolid = args.isSolid
        this.containsTeleport = containsTeleport
    }

    public addChild(name: string) {
        this.childsNames.add(name)
    }

    public hasChild(name: string) {
        return this.childsNames.has(name)
    }

    public forEachChild(closure: (child: string)=>void) {
        this.childsNames.forEach(closure)
    }
}