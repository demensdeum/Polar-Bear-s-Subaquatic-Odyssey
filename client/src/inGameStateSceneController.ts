import { Entity } from "./entity.js"
import { GameGeolocationPosition } from "./gameGeolocationPosition.js"
import { GameVector3 } from "./gameVector3.js"
import { debugPrint, raiseCriticalError } from "./runtime.js"
import { float } from "./types.js"
import { DecorControls } from "./decorControls.js"
import { SceneController } from "./sceneController.js"
import { SceneObjectCommandIdle } from "./sceneObjectCommandIdle.js"
import { Utils } from "./utils.js";
import { InGameStateSceneControllerStateItem } from "./InGameStateSceneControllerStateItem.js"

export class InGameStateSceneController {

    private readonly geolocationScale = 2000
    private sceneController: SceneController
    private renderingPlayerGameGeolocation?: GameGeolocationPosition
    private actualPlayerGameGeolocation?: GameGeolocationPosition
    private uuidToPair: { [key: string]: InGameStateSceneControllerStateItem} = {}

    private readonly cameraSpeed = 0.000004
    private readonly entitiesSpeed = 0.000007

    constructor(
        sceneController: SceneController
    ) {
        this.sceneController = sceneController
    }

    public setCurrentPlayerGameGeolocation(geolocation: GameGeolocationPosition) {
        if (this.renderingPlayerGameGeolocation) {           
            this.actualPlayerGameGeolocation = geolocation
        }
        else if (Object.keys(this.uuidToPair).length > 0) {
            raiseCriticalError("Do not update objects position, because this.currentPlayerGameGeolocation is null!")
            debugger
        }
        else {
            debugPrint("First geolocation set")
            this.actualPlayerGameGeolocation = geolocation
            this.renderingPlayerGameGeolocation = geolocation
        }
    }

    public temporaryAdd(entity: Entity) {
        this.add([entity])
    }

    public handle(entities: Entity[]) {
        debugPrint(`handle entity: ${entities}`)

        const addedEntities = entities.filter((e) => { return (e.uuid in this.uuidToPair) == false })
        const movedEntities = entities.filter((e) => { return e.uuid in this.uuidToPair})
        var removedEntities: Entity[] = []

        const entityServerUuids = new Set<string>(entities.map((e) => { return e.uuid }))
        Object.keys(this.uuidToPair).forEach((uuid) => {
            if (!entityServerUuids.has(uuid)) {
                const entity = this.uuidToPair[uuid].entity
                if (entity == null) {
                    debugPrint(`Can't remove - no entity with UUID: ${uuid}`)
                    return
                }
                removedEntities.push(entity)
            }
        })

        this.add(addedEntities)
        this.move(movedEntities)
        this.remove(removedEntities)
    }

    private geolocationToSceneVector(
        geolocation: GameGeolocationPosition,
        y: float = 0
    ): GameVector3 {
        if (this.renderingPlayerGameGeolocation) {
            const position = this.renderingPlayerGameGeolocation
            const diffX = geolocation.longitude - position.longitude
            const diffY = geolocation.latitude - position.latitude        
            const adaptedX = diffX * this.geolocationScale
            const adaptedZ = -(diffY * this.geolocationScale)
            return new GameVector3(
                adaptedX,
                y,
                adaptedZ
            )
        }
        raiseCriticalError("currentPlayerGameGeolocation is null!!!!")
        debugger
        return new GameVector3(
            0,
            0,
            0
        )
    }

    private modelNameFromEntity(entity: Entity) {
        if (entity.model == "DEFAULT") {
            const type = entity.type
            if (type == "hero") {
                return "com.demensdeum.hero"
            }
            else if (type == "building") {
                return "com.demensdeum.hitech.building"
            }
            else if (type == "eye") {
                return "com.demensdeum.eye"
            }
            else {
                return "com.demensdeum.hero"
            }
        }
        else {
            return entity.model
        }
    }    

    private add(entities: Entity[]) {
        debugPrint(`add entity: ${entities.length}`)

        const self = this
        entities.forEach((e) => {
                const sceneObjectUUID = Utils.generateUUID()
                const modelName = this.modelNameFromEntity(e)
                const sceneVector = this.geolocationToSceneVector(
                    e.position
                )

                const controls = new DecorControls(
                    sceneObjectUUID,
                    new SceneObjectCommandIdle(
                        "idle",
                        0
                    ),
                    self.sceneController,
                    self.sceneController,
                    self.sceneController
                )
                const isTransparent = e.name == "BUILDING-ANIMATION"
                const transparency = isTransparent ? 0.4 : 1.0
                self.sceneController.addModelAt(
                    sceneObjectUUID,
                    modelName,
                    sceneVector.x,
                    sceneVector.y,
                    sceneVector.z,
                    0,
                    0,
                    0,
                    false,
                    controls,
                    1.0,
                    ()=>{},
                    0xFFFFFF,
                    isTransparent,
                    transparency
                )
                self.uuidToPair[e.uuid] = new InGameStateSceneControllerStateItem(
                    e,
                    sceneObjectUUID,
                    e.position,
                    e.position
                )
        })
    }

    private move(entities: Entity[]) {
        debugPrint(`move entities: ${entities.length}`)
        
        entities.forEach((e) => {       
            this.uuidToPair[e.uuid].actualPosition.populate(e.position)
        })
    }

    public sceneObjectNameToEntity(name: string): Entity | null {
        var outputEntity: Entity | null = null
        Object.keys(this.uuidToPair).forEach((uuid) => {
            const pair = this.uuidToPair[uuid]
            const entity = pair.entity
            const sceneObjectUUID = pair.sceneObjectUUID
            if (name == sceneObjectUUID) {
                outputEntity = entity
            }
        })
        return outputEntity
    }

    public remove(entities: Entity[]) {
        debugPrint(`remove entities: ${entities.length}`)

        const self = this
        entities.forEach((e) => {
            const uuid = self.uuidToPair[e.uuid].sceneObjectUUID
            self.sceneController.removeSceneObjectWithName(uuid);
            delete self.uuidToPair[e.uuid]
        })
    }

    private updateObjectsPosition() {
        debugPrint(`targetPlayerGameGeolocation: ${this.actualPlayerGameGeolocation}`)
        const self = this

        if (this.renderingPlayerGameGeolocation && this.actualPlayerGameGeolocation) {
            const movedPosition = this.renderingPlayerGameGeolocation.movedPosition(
                this.actualPlayerGameGeolocation,
                this.cameraSpeed
            )

            const diff = this.renderingPlayerGameGeolocation.diff(
                this.actualPlayerGameGeolocation
            )
            const rotationY = Math.atan2(
                diff.longitude,
                diff.latitude
            )
            if (rotationY != 0) {
                this.sceneController.rotateObjectTo(
                    "hero",
                    0,
                    rotationY,
                    0
                )
            }

            this.renderingPlayerGameGeolocation.populate(movedPosition)
        }

        Object.keys(this.uuidToPair).forEach((uuid) => {
            const e = this.uuidToPair[uuid]
            const movedPosition = e.renderingPosition.movedPosition(
                e.actualPosition,
                this.entitiesSpeed
            )
            e.renderingPosition.populate(movedPosition)
            const currentVector = this.geolocationToSceneVector(
                e.renderingPosition
            )
            self.sceneController.moveObjectTo(
                e.sceneObjectUUID,
                currentVector.x,
                currentVector.y,
                currentVector.z
            )
        })          
    }

    public step() {
        this.updateObjectsPosition()


    }
}