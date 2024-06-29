export class GameMapTile {
    public readonly isSolid: boolean
    private items = new Set<string>()

    constructor(
        args: {
            isSolid: boolean
        }
    )
    {
        this.isSolid = args.isSolid
    }

    public addItem(name: string) {
        this.items.add(name)
    }

    public hasItem(name: string) {
        return this.items.has(name)
    }

    public forEachItem(closure: (item: string)=>void) {
        this.items.forEach(closure)
    }
}