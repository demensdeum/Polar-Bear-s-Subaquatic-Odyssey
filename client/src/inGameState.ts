import { State } from "./state.js"
import { debugPrint } from "./runtime.js"
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

export class InGameState extends State implements GeolocationControllerDelegate,
                                                    AuthorizeControllerDelegate,
                                                    EntitiesControllerDelegate,
                                                    SceneControllerDelegate {
    name = "InGameState"
    
    private position: GeolocationPosition | null = null
    private geolocationController = new GeolocationController(this)
    private entitiesController = new EntitiesController(this)    
    private authorizeController = new AuthorizeController(this)
    private sceneObjectNameToEntity: { [key: string]: Entity } = {}
    private entityUuidToSceneObjectName: { [key: string]: string} = {}
    private gameData = new GameData()
    private entitiesPoller: any
    private cameraLock = false

    initialize(): void {
        const canvas = this.context.canvas
        if (canvas == null) {
            return
        }
        this.context.sceneController.delegate = this
        this.context.sceneController.switchSkyboxIfNeeded(
            "com.demensdeum.blue.field"
        )
        this.context.sceneController.addModelAt(
            "hero",
            "com.demensdeum.hero",
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
        if (this.cameraLock) {
            this.context.sceneController.rotateObjectTo(
                Names.Camera,
                Utils.angleToRadians(-55),
                0,
                0
            )
        }
        this.context.sceneController.addText(
            "balance",
            this.gameData
        )
        this.context.sceneController.addText(
            "message",
            this.gameData
        )

        const self = this;
        const controls = new DecorControls(
            "building",
            new SceneObjectCommandIdle(
                "idle",
                0
            ),
            self.context.sceneController,
            self.context.sceneController,
            self.context.sceneController
        )            
        let action = () => {
            this.entitiesController.build()
        }
        var button = {
            ["Build"] : action
        }
        this.context.sceneController.addButton(
            "Build",
            button
        )
        this.gameData.cameraLock = true
        this.gameData.message = "Authorization"
        this.authorizeController.authorizeIfNeeded()

        this.context.sceneController.addText(
            "cameraLock",
            this.gameData
        )
    }

    step(): void {
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
        this.context.sceneController.debugControlsEnabled = this.gameData.cameraLock == false
    }

    geolocationControllerDidGetPosition(
        controller: GeolocationController,
        position: GeolocationPosition
    ) {
        this.position = position
        debugPrint(`Position: ${position.latitude}, ${position.longitude}`) 
    }

    private modelNameFromType(type: string) {
        if (type == "hero") {
            return "com.demensdeum.hero"
        }
        else if (type == "building") {
            return "com.demensdeum.hitech.building"
        }
        else {
            return "com.demensdeum.hero"
        }
    }

    entitiesControllerDidFetchEntities(
        controller: EntitiesController,
        entities: Entity[]
    ) {
        const self = this
        var i = 0.5
        entities.forEach((entity) => {

            if (entity.uuid == self.gameData.heroUuid) {
                self.gameData.balance = entity.balance
                return
            }

            if (entity.uuid in this.entityUuidToSceneObjectName) {
                return
            }
            else {
                const name = `${entity.type}-${entity.id}`
                const modelName = this.modelNameFromType(entity.type)
                const adaptedX = 1
                const adaptedZ = 0
                const controls = new DecorControls(
                    name,
                    new SceneObjectCommandIdle(
                        "idle",
                        0
                    ),
                    self.context.sceneController,
                    self.context.sceneController,
                    self.context.sceneController
                )
                self.context.sceneController.addBoxAt(
                    `collider-box-${name}`,
                    adaptedX,
                    0.22,
                    adaptedZ,
                    "com.demensdeum.loading",
                    0.4,
                    0xFF00FF,
                    0.6
                )
                self.context.sceneController.addModelAt(
                    name,
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

                self.sceneObjectNameToEntity[name] = entity
                self.entityUuidToSceneObjectName[entity.uuid] = name
            }
        })
        this.entitiesTrackingStep()
    }

    entitiesControllerDidCatchEntity(
        controller: EntitiesController, 
        entity: Entity
    ): void {
        const sceneObjectName = this.entityUuidToSceneObjectName[entity.uuid]
        this.context.sceneController.removeSceneObjectWithName(sceneObjectName)
        this.context.sceneController.removeSceneObjectWithName(`collider-box-${sceneObjectName}`)
        // @ts-ignore
        this.gameData.balance = parseInt(this.gameData.balance) + parseInt(entity.balance)
    }

    entitiesControllerDidNotCatchEntity(
        controller: EntitiesController, 
        entity: Entity, 
        message: string
    ): void {
        debugPrint(message)    
    }

    sceneControllerDidPickSceneObjectWithName(
        controller: SceneController, 
        name: string
    ): void {        
        if (name.startsWith("collider-box-")) {
            name = name.substring("collider-box-".length)
        }
        if (name in this.sceneObjectNameToEntity == false) {
            return
        }
        const entity = this.sceneObjectNameToEntity[name]

        this.entitiesController.catch(entity)      
    }

    private entitiesTrackingStep() {
        this.gameData.message = `Entities Tracking, position is exists: ${this.position != null}`
        const position = this.position
        if (position != null) {
            const self = this
            setTimeout(()=>{
                self.entitiesController.getEntities(position)
            }, 1000)
        }
        else {
            const self = this
            setTimeout(()=>{
                self.entitiesTrackingStep()
            }, 1000)
        }
    }

    authorizeControllerDidAuthorize(
        controller: AuthorizeController
    ) {
        const heroUuid = Utils.getCookieValue("heroUuid")
        if (heroUuid) {
            this.gameData.heroUuid = heroUuid
            this.geolocationController.trackPosition()
            this.entitiesTrackingStep()            
        }
        else {
            alert("No heroUuid in cookie!")
        }
    }

    authorizeControllerDidReceiveError(
        controller: AuthorizeController,
        message: string
    ) {
        alert(`AuthorizeController error: ${message}`)
    }

    entitiesControllerDidBuildEntity(
        controller: EntitiesController,
        entity: Entity
    ): void {
        const controls = new DecorControls(
            "building",
            new SceneObjectCommandIdle(
                "idle",
                0
            ),
            this.context.sceneController,
            this.context.sceneController,
            this.context.sceneController
        )        
        const sceneObjectName = `${entity.type}-${entity.id}`
        this.context.sceneController.addModelAt(
            sceneObjectName,
            this.modelNameFromType(entity.type),
            0,
            0,
            0,
            0,
            0,
            0,
            false,
            controls
        )
        this.entityUuidToSceneObjectName[entity.uuid] = sceneObjectName
        this.sceneObjectNameToEntity[sceneObjectName] = entity   
    }

    entitiesControllerDidNotBuildEntity(
        controller: EntitiesController,
        entity: Entity,
        message: string
    ): void {
        alert(message)
    }
}