import { Context } from "./context.js"
import { GameVector3 } from "./gameVector3.js"
import { MainMenuState } from "./mainMenuState.js"
import { State } from "./state.js"
declare function _t(key: string): string;

export class EndVideoState implements State {

    public readonly name: string
    context: Context

    constructor(
        name: string,
        context: Context
    ) {
        this.name = name
        this.context = context
    }

    initialize(): void {
        const self = this
        
        const videoDiv = document.createElement('div')
        videoDiv.innerHTML = '<iframe width="1280" height="1024" src="https://www.youtube.com/embed/JShD4pytr9A?autoplay=1&loop=1" frameborder="0" allowfullscreen></iframe>'
 
        this.context.sceneController.addCssPlaneObject(
            {
                name: "video",
                div: videoDiv,
                planeSize: {
                    width: 2,
                    height: 2
                },
                position: GameVector3.zeroBut(
                    {   
                        x: -0.4,
                        y: 0,
                        z: -5
                    }
                ),
                rotation: new GameVector3(
                    0,
                    0,
                    0,
                ),
                scale: new GameVector3(
                    0.01,
                    0.01,
                    0.01
                ),
                shadows: {
                    receiveShadow: false,
                    castShadow: false
                },
                display: {
                    isTop: true,
                    stickToCamera: true
                }
            }
        )

        const menuButtonDiv = document.createElement('div')
        menuButtonDiv.onclick = () => {
            self.menuButtonDidPress()
        }
        menuButtonDiv.textContent = _t("MENU_BUTTON")
        menuButtonDiv.style.color = "white"
        menuButtonDiv.style.backgroundColor = 'gray'  
        menuButtonDiv.style.fontSize = "30px"
        menuButtonDiv.style.padding = "22px"         

        this.context.sceneController.addCssPlaneObject(
            {
                name: "playButton",
                div: menuButtonDiv,
                planeSize: {
                    width: 2,
                    height: 2
                },
                position: GameVector3.zeroBut(
                    {   
                        x: -0.4,
                        y: -2,
                        z: -5
                    }
                ),
                rotation: new GameVector3(
                    0,
                    0,
                    0,
                ),
                scale: new GameVector3(
                    0.01,
                    0.01,
                    0.01
                ),
                shadows: {
                    receiveShadow: false,
                    castShadow: false
                },
                display: {
                    isTop: true,
                    stickToCamera: true
                }
            }
        )        
    }

    step(): void {
        
    }

    private menuButtonDidPress() {
        this.context.sceneController.removeAllSceneObjectsExceptCamera();        
        const mainMenuState = new MainMenuState(
            "mainMenuState",
            this.context
        )
        this.context.transitionTo(mainMenuState)
    }

}

