import { InputControllerDelegate } from "./inputControllerDelegate"
import { GameInputMouseEvent } from "./gameInputMouseEvent.js";
import { GameVector2D } from "./gameVector2D.js";
import { GameInputMouseEventNames } from "./gameInputMouseEventNames.js";
import { debugPrint } from "./runtime.js";

export class InputController {

    private isTouching: boolean = false;
    private touchStartX: number = 0;
    private touchStartY: number = 0;
    private currentTouchX: number = -1;
    private currentTouchY: number = -1;

    private canvas: HTMLCanvasElement;
    private delegate: InputControllerDelegate;

    constructor(
        canvas: HTMLCanvasElement,
        delegate: InputControllerDelegate
    )
    {
        this.canvas = canvas;
        this.delegate = delegate;

        const inputController = this;
        canvas.addEventListener('mousedown', (e)=> inputController.onMouseDown(e));
        canvas.addEventListener('mouseup', (e)=> inputController.onMouseUp(e));
        canvas.addEventListener('mousemove', (e)=> inputController.onMouseMove(e));
        canvas.addEventListener('touchstart', (e)=>inputController.onTouchStart(e), false);
        canvas.addEventListener('touchend', (e)=>inputController.onTouchEnd(e), false);
        canvas.addEventListener('touchcancel', (e)=>inputController.onTouchEnd(e), false);
        canvas.addEventListener('touchmove', (e)=>inputController.onTouchMove(e), false);
    }

    private onMouseDown(event: MouseEvent) {
        this.touchStartX = event.x;
        this.touchStartY = event.y;
        this.currentTouchX = this.touchStartX;
        this.currentTouchY = this.touchStartY;
        this.isTouching = true;
    }

    private onMouseUp(_: MouseEvent) {
        this.isTouching = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
    }    

    private onMouseMove(event: MouseEvent) {
        this.currentTouchX = event.x;
        this.currentTouchY = event.y;
    }      

    private onTouchStart(event: TouchEvent) {
        if (event.touches.length == 1) {
            this.isTouching = true;            
            this.touchStartX = event.touches[0].pageX;
            this.touchStartY = event.touches[0].pageY;
        }
    }

    private onTouchEnd(_: TouchEvent) {
        this.isTouching = false;        
        this.touchStartX = 0;
        this.touchStartY = 0;
    }

    private onTouchMove(event: TouchEvent) {
        if (event.touches.length == 1) {
            debugPrint(`currentTouchX: ${this.currentTouchX} | currentTouchY: ${this.currentTouchY}`)
            this.currentTouchX = event.touches[0].pageX;
            this.currentTouchY = event.touches[0].pageY;            
        }
    }

    public step() {
        if (this.isTouching) {
            if (this.currentTouchX == -1 || this.currentTouchY == -1) {
                return
            }
            const xLimit = this.canvas.width;
            const yLimit = this.canvas.height;
            var xAspect = (this.currentTouchX - this.touchStartX) / xLimit;
            xAspect = Math.min(xLimit, xAspect);
            const yAspect = (this.currentTouchY - this.touchStartY) / yLimit;
            const mouseEvent = new GameInputMouseEvent(
                {
                    name: GameInputMouseEventNames.MouseMove,
                    value: new GameVector2D(xAspect, yAspect)
                }
            )
            this.delegate.inputControllerDidReceive(this, mouseEvent);        
        }
        else {
            const mouseEvent = new GameInputMouseEvent({
                name: GameInputMouseEventNames.MouseUp,
                value: new GameVector2D(0, 0)
            })
            this.delegate.inputControllerDidReceive(this, mouseEvent)
        }
    }
}