import { State } from "./state.js"
import { debugPrint, raiseCriticalError } from "./runtime.js"
import { GeolocationController } from "./geolocationController.js"
import { GeolocationControllerDelegate } from "./geolocationControllerDelegate.js"
import { GeolocationPosition } from "./geolocationPosition.js"
import { EntitiesController } from "./entitiesController.js"
import { EntitiesControllerDelegate } from "./entitiesControllerDelegate.js"
import { Entity } from "./entity.js"
import { DecorControls } from "./decorControls.js"
import { SceneObjectCommandIdle } from "./sceneObjectCommandIdle.js"
import { Names } from "./names.js"
import { Utils } from "./utils.js"
import { SceneControllerDelegate } from "./sceneControllerDelegate.js"
import { SceneController } from "./sceneController.js"
import { GameData } from "./gameData.js"
import { AuthorizeController } from "./authorizeController.js"
import { AuthorizeControllerDelegate } from "./authorizeControllerDelegte.js"
import { HeroStatusControllerDelegate } from "./heroStatusControllerDelegate.js"
import { HeroStatusController } from "./heroStatusController.js"
import { BuildingStatusController } from "./buildingStatusController.js"

export class InGameState extends State implements GeolocationControllerDelegate,
                                                    AuthorizeControllerDelegate,
                                                    EntitiesControllerDelegate,
                                                    SceneControllerDelegate,
                                                    HeroStatusControllerDelegate {
    name = "InGameState"
    
    private buildingStatusController = new BuildingStatusController(this)
    private geolocationController = new GeolocationController(this)
    private entitiesController = new EntitiesController(this)    
    private authorizeController = new AuthorizeController(this)
    private sceneObjectUuidToEntity: { [key: string]: Entity } = {}
    private entityUuidToSceneObjectUuid: { [key: string]: string} = {}
    private heroStatusController = new HeroStatusController(this)
    private gameData = new GameData()
    private readonly cameraLockEnabled = false
    private readonly buildingEnabled = true
    private readonly orderChangeEnabled = true
    private readonly entitiesTrackingStepTimeout = 3000
    private heroInserted = false
    private lastBuildingAnimationObjectUUID = "NONE"

    initialize(): void {
        const canvas = this.context.canvas
        if (canvas == null) {
            return
        }
        this.context.sceneController.delegate = this
        this.context.sceneController.switchSkyboxIfNeeded(
            "com.demensdeum.blue.field"
        )
        this.switchHeroModel(this.gameData.model)
        this.context.sceneController.addModelAt(
            "floor",
            "com.demensdeum.floor",
            0,
            0,
            0,
            0,
            0,
            0,
            false,
            new DecorControls(
                "floor",
                new SceneObjectCommandIdle(
                    "idle",
                    0
                ),
                this.context.sceneController,
                this.context.sceneController,
                this.context.sceneController
            )                
        )
        this.context.sceneController.rotateObjectTo(
            Names.Camera,
            Utils.angleToRadians(-55),
            0,
            0
        )
        this.context.sceneController.addText(
            "name",
            this.gameData
        )
        this.context.sceneController.addText(
            "balance",
            this.gameData
        )      
        this.context.sceneController.addText(
            "message",
            this.gameData
        )
        this.context.sceneController.addText(
            "order",
            this.gameData
        )

        if (this.orderChangeEnabled) {        
            let action = () => {
                this.switchOrder()
            }
            const button = {
                ["Order"] : action
            }
            this.context.sceneController.addButton(
                "Order",
                button
            )
        }

        if (this.buildingEnabled) {            
            let action = () => {
                if (this.gameData.isLocationResolvedOnce() == false) {
                    alert("Строить нельзя пока не будут определены ваши координаты!")
                    return
                }
                this.showBuildingAnimation()
                this.entitiesController.build()
            }
            const button = {
                ["Build"] : action
            }
            this.context.sceneController.addButton(
                "Build",
                button
            )
        }

        this.gameData.cameraLock = false
        this.gameData.message = "Authorization"
        this.authorizeController.authorizeIfNeeded()

        if (this.cameraLockEnabled) {
            this.context.sceneController.addText(
                "cameraLock",
                this.gameData
            )
        }

        const cameraPosition = this.context.sceneController.sceneObjectPosition("hero").clone()
        cameraPosition.y += 1.7
        cameraPosition.z += 1.2

        this.context.sceneController.moveObjectTo(
            Names.Camera,
            cameraPosition.x,
            cameraPosition.y,
            cameraPosition.z
        )        
    }

    switchOrder() {
        const order = prompt("Название масонского ордена")
        if (order) {
            this.heroStatusController.set(order)
        }
    }

    private showBuildingAnimation() {
        if (this.lastBuildingAnimationObjectUUID in this.sceneObjectUuidToEntity) {
            debugPrint("Can't present another building animation! Already showing one!")
            return
        }
        const position = this.gameData.position
        if (position == null) {
            return
        }
        const uuid = Utils.generateUUID()
        this.lastBuildingAnimationObjectUUID = uuid
        const entity = new Entity(
            -1,
            uuid,
            "BUILDING-ANIMATION",
            this.gameData.name,
            this.gameData.order,
            "building",
            "com.demensdeum.hitech.building",
            0,
            position
        )
        const controls = new DecorControls(
            uuid,
            new SceneObjectCommandIdle(
                "idle",
                0
            ),
            this.context.sceneController,
            this.context.sceneController,
            this.context.sceneController
        )        
        this.context.sceneController.addModelAt(
            uuid,
            "com.demensdeum.hitech.building",
            0,
            0,
            0,
            0,
            0,
            0,
            false,
            controls,
            1.0,
            ()=>{},
            0xFFFFFF,
            true,
            0.4
        )

        this.sceneObjectUuidToEntity[uuid] = entity
        this.entityUuidToSceneObjectUuid[entity.uuid] = uuid        
    }

    step() {
        if (this.gameData.cameraLock) {
            const cameraPosition = this.context.sceneController.sceneObjectPosition("hero").clone()
            cameraPosition.y += 1.7
            cameraPosition.z += 1.2

            this.context.sceneController.moveObjectTo(
                Names.Camera,
                cameraPosition.x,
                cameraPosition.y,
                cameraPosition.z
            )
        }
    }

    geolocationControllerDidGetPosition(
        _: GeolocationController,
        position: GeolocationPosition
    ) {
        this.gameData.position = position

        if (window.localStorage.getItem("gameplayStartInfo") != "YES") {
            window.localStorage.setItem("gameplayStartInfo", "YES")
            alert("Ваши координаты определены. Для перемещения в игре ходите с устройством в реальной жизни, собирайте масонские знаки, и стройте здания за свой орден. Приятной игры!")
        }

        debugPrint(`Position: ${position.latitude}, ${position.longitude}`) 
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

    geolocationControllerGeolocationAccessGranted(
        _: GeolocationController,
        position: GeolocationPosition
    ) {
        this.gameData.position = position
        this.geolocationController.trackPosition()    
    }

    geolocationControllerGeolocationDidReceiveError(
        _: GeolocationController, 
        error: string
    ) {
        alert(error)
    }

    private switchHeroModel(model: string) {
        if (this.heroInserted == true) {
            this.context.sceneController.removeSceneObjectWithName("hero")
        }
        this.context.sceneController.addModelAt(
            "hero",
            model == "DEFAULT" ? "com.demensdeum.hero" : model,
            0,
            0,
            0,
            0,
            0,
            0,
            true,
            new DecorControls(
                "hero",
                new SceneObjectCommandIdle(
                    "idle",
                    0
                ),
                this.context.sceneController,
                this.context.sceneController,
                this.context.sceneController
            )
        )
        this.heroInserted = true
    }

    private removeEntityIfExists(entity: Entity) {
        if ((entity.uuid in this.entityUuidToSceneObjectUuid) == false) {
            return
        }
        this.removeEntity(entity)
    }

    private modelIsSameForEntity(entity: Entity): boolean {
        if ((entity.uuid in this.entityUuidToSceneObjectUuid) == false) {
            raiseCriticalError(`Can't check same model or not, because there is no entity ${entity.uuid} in entityUuidToSceneObjectUuid`)
            return false
        }
        const currentEntity = this.sceneObjectUuidToEntity[this.entityUuidToSceneObjectUuid[entity.uuid]]
        const result = currentEntity.model == entity.model
        return result
    }

    entitiesControllerDidFetchEntities(
        _: EntitiesController,
        entities: Entity[]
    ) {
        const self = this
        var i = 0.5

        const entityServerUuids = new Set<string>(entities.map((entity) => {return entity.uuid}))
        //debugger
        Object.keys(this.sceneObjectUuidToEntity).forEach((uuid) => {
            if (!entityServerUuids.has(uuid)) {
                const entity = this.sceneObjectUuidToEntity[uuid]
                if (entity == null) {
                    debugPrint(`Can't remove - no entity with UUID: ${uuid}`)
                    return
                }
                this.removeEntity(entity)
            }
        })

        entities.forEach((entity) => {

            if (entity.uuid == self.gameData.heroUUID) {
                self.gameData.name = entity.name 
                self.gameData.balance = entity.balance
                self.gameData.order = entity.order

                if (self.gameData.model != entity.model) {
                    self.gameData.model = entity.model
                    self.switchHeroModel(entity.model)
                }
                return
            }

            if (
                entity.uuid in this.entityUuidToSceneObjectUuid 
                &&
                this.modelIsSameForEntity(entity)
            ) {
                const position = this.gameData.position  
                if (position == null) {
                    raiseCriticalError(`Position is null!`)
                    return
                }                              
                const diffX = entity.position.longitude - position.longitude
                const diffY = entity.position.latitude - position.latitude

                debugPrint(`diffX: ${diffX}; diffY: ${diffY}`)

                this.sceneObjectUuidToEntity[this.entityUuidToSceneObjectUuid[entity.uuid]].name = entity.name

                const scale = 2000
                const adaptedX = diffX * scale
                const adaptedZ = -(diffY * scale)    
                
                const uuid = entity.uuid
                this.context.sceneController.moveObjectTo(
                    uuid,
                    adaptedX,
                    0,
                    adaptedZ
                )
                if (entity.type == "building") {
                    const uuid = entity.uuid
                    const objectName = `order-zone-${uuid}`                    
                    this.context.sceneController.moveObjectTo(
                        objectName,
                        adaptedX,
                        0.01,
                        adaptedZ
                    )
                }
            }
            else {   
                this.removeEntityIfExists(entity)
                const uuid = entity.uuid
                const modelName = this.modelNameFromEntity(entity)

                const position = this.gameData.position
                if (position == null) {
                    raiseCriticalError(`Position is null!`)
                    return
                }

                const diffX = entity.position.longitude - position.longitude
                const diffY = entity.position.latitude - position.latitude

                debugPrint(`diffX: ${diffX}; diffY: ${diffY}`)

                const scale = 2000
                const adaptedX = diffX * scale
                const adaptedZ = -(diffY * scale)
                const controls = new DecorControls(
                    uuid,
                    new SceneObjectCommandIdle(
                        "idle",
                        0
                    ),
                    self.context.sceneController,
                    self.context.sceneController,
                    self.context.sceneController
                )
                self.context.sceneController.addModelAt(
                    uuid,
                    modelName,
                    adaptedX,
                    0,
                    adaptedZ,
                    0,
                    0,
                    0,
                    false,
                    controls
                )
                i += 0.5

                if (entity.type == "building") {
                    this.context.sceneController.addPlaneAt(
                        `order-zone-${uuid}`,
                        adaptedX,
                        0.01,
                        adaptedZ,
                        4,
                        4,
                        "com.demensdeum.dollar",
                        0xFFFFFF,
                        false,
                        true,
                        0.4                                     
                    )
                    this.context.sceneController.rotateObjectTo(
                        `order-zone-${uuid}`,
                        Utils.angleToRadians(90),
                        0,
                        0
                    )
                }

                self.sceneObjectUuidToEntity[uuid] = entity
                self.entityUuidToSceneObjectUuid[entity.uuid] = uuid
            }
        })
        this.entitiesTrackingStep()
    }

    private removeEntity(entity: Entity) {
        const sceneObjectUuid = this.entityUuidToSceneObjectUuid[entity.uuid]
        this.context.sceneController.removeSceneObjectWithName(sceneObjectUuid)

        if (entity.type == "building") {
            const uuid = entity.uuid
            const objectName = `order-zone-${uuid}`
            this.context.sceneController.removeSceneObjectWithName(objectName);
        }

        const name = `${entity.type}-${entity.id}`
        delete this.entityUuidToSceneObjectUuid[entity.uuid]
        delete this.sceneObjectUuidToEntity[name]        
    }

    entitiesControllerDidCatchEntity(
        _: EntitiesController, 
        entity: Entity
    ): void {
        this.removeEntity(entity)
        // @ts-ignore
        this.gameData.balance = parseInt(this.gameData.balance) + parseInt(entity.balance)
    }

    entitiesControllerDidNotCatchEntity(
        _: EntitiesController, 
        __: Entity, 
        message: string
    ): void {
        debugPrint(message)    
    }

    askIfWantToRemoveBuilding(entity: Entity) {
        if (this.gameData.order == entity.order) {
            if (confirm(`Это здание ${entity.name} вашего ордена ${entity.order} - построено ${entity.ownerName}. Переименовать?`)) {
                this.renameBuilding(entity)
            }
            return
        }
        else if (confirm(`Хотите уничтожить здание масонского ордена ${entity.order} - построено ${entity.ownerName} ?`)) {
            this.entitiesController.destroy(entity)
            return
        }
    }

    renameBuilding(entity: Entity) {
        const name = prompt("Введите название здания:") || "NONE"
        entity.name = name
        this.buildingStatusController.rename(entity, name)
    }

    entitiesControllerDidDestroyEntity(
        _: EntitiesController,
        entity: Entity
    ): void {
        this.removeEntity(entity)
    }

    entitiesControllerDidNotDestroyEntity(
        _: EntitiesController, 
        __: Entity, 
        message: string
    ): void {
        alert(message);
    }

    sceneControllerDidPickSceneObjectWithName(
        _: SceneController, 
        name: string
    ): void {     
        if (name in this.sceneObjectUuidToEntity) {
            const entity = this.sceneObjectUuidToEntity[name]
            if (entity.type == "building") {
                this.askIfWantToRemoveBuilding(entity)
                return
            }
        }
        if (name in this.sceneObjectUuidToEntity == false) {
            return
        }
        const entity = this.sceneObjectUuidToEntity[name]

        if (entity.type != "eye") {
            debugPrint(`Unknown entity type tap: ${entity.type}`)
        }
        else {
            this.entitiesController.catch(entity)      
        }
    }

    private entitiesTrackingStep() {
        this.gameData.message = `${this.gameData.position?.latitude} - ${this.gameData.position?.longitude}`
        const position = this.gameData.position
        if (position != null) {
            const self = this
            setTimeout(()=>{
                self.entitiesController.getEntities(position)
            }, self.entitiesTrackingStepTimeout)
        }
        else {
            const self = this
            setTimeout(()=>{
                self.entitiesTrackingStep()
            }, self.entitiesTrackingStepTimeout)
        }
    }

    authorizeControllerDidAuthorize(
        _: AuthorizeController
    ) {
        const heroUUID = Utils.getCookieValue("heroUUID")
        if (heroUUID) {
            this.gameData.heroUUID = heroUUID
            if (window.localStorage.getItem("showedStartInfo") != "YES") {
                window.localStorage.setItem("showedStartInfo", "YES")
                alert("Masonry-AR - это игра в дополненной реальности, потребуется доступ к вашей геолокации")
            }
            this.geolocationController.askPermission()
            this.entitiesTrackingStep()            
        }
        else {
            alert("No heroUUID in cookie!")
        }
    }

    authorizeControllerDidReceiveError(
        _: AuthorizeController,
        message: string
    ) {
        alert(`AuthorizeController error: ${message}`)
    }

    entitiesControllerDidBuildEntity(
        _: EntitiesController,
        __: Entity
    ): void {
        debugPrint("Build success")
    }

    entitiesControllerDidNotBuildEntity(
        _: EntitiesController,
        __: Entity,
        message: string
    ): void {
        alert(message)
    }

    heroStatusControllerDidChange(
        _: HeroStatusController, 
        order: string
    ): void {
        this.gameData.order = order
    }

    heroStatusControllerDidReceiveError(
        _: HeroStatusController,
        error: string
    ): void {
        alert(error)
    }

    buildingStatusControllerDidRename(
        _: BuildingStatusController, 
        __: string, 
        ___: string
    ) {
        debugPrint("Building rename success")
    }

    buildingStatusControllerDidReceiveError(
        _: BuildingStatusController, 
        string: string
    ) {
        alert(string)
    }
}