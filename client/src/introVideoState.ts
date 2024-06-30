import { Context } from "./context.js"
import { GameVector3 } from "./gameVector3.js"
import { InGameState } from "./inGameState.js"
import { raiseCriticalError } from "./runtime.js"
import { State } from "./state.js"
declare function _t(key: string): string;

export class IntroVideoState implements State {

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
        videoDiv.innerHTML = '<iframe width="1280" height="1024" src="https://www.youtube.com/embed/tzDtjb-opp8?autoplay=1&loop=1" frameborder="0" allowfullscreen></iframe>'
 
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

        const playButtonDiv = document.createElement('div')
        playButtonDiv.onclick = () => {
            self.playButtonDidPress()
        }
        playButtonDiv.textContent = _t("PLAY_BUTTON")
        playButtonDiv.style.color = "white"
        playButtonDiv.style.backgroundColor = 'gray'  
        playButtonDiv.style.fontSize = "30px"
        playButtonDiv.style.padding = "22px"         

        this.context.sceneController.addCssPlaneObject(
            {
                name: "playButton",
                div: playButtonDiv,
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

    private playButtonDidPress() {
        this.context.sceneController.removeAllSceneObjectsExceptCamera();
        
        const canvas = this.context.canvas

        if (canvas) {
            const ingameState = new InGameState(
                "initializationScreenState",
                canvas,
                this.context
            )

            this.context.transitionTo(ingameState)
        }
        else {
            raiseCriticalError("Can't start game - canvas is null!!!11")
        }        
    }

}

