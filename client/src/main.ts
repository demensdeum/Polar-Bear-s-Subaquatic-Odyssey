// import { CompanyLogoState } from "./companyLogoState.js"
import { Context } from "./context.js"
import { InGameState } from "./inGameState.js"
import { raiseCriticalError } from "./runtime.js"

function main(options: {[key: string]: string} = {}) {
  const debugEnabled = options["debugEnabled"] === "true"

  const context = new Context(
      debugEnabled
  )

  const canvas = context.canvas

  if (canvas) {
    const startState = new InGameState(
      "InGameState",
      canvas,
      context
    )
    context.start(startState);
  
    let lastFrameTime = 0
    const fpsInterval = 1000 / 60

    function step(timestamp: number) {
        if (!context.isRunning) {
            return
        }
        const elapsed = timestamp - lastFrameTime

        if (elapsed > fpsInterval) {
            lastFrameTime = timestamp - (elapsed % fpsInterval)
            context.step()
        }

        requestAnimationFrame(step)
    }
  
    requestAnimationFrame(step)    
  }
  else {
    raiseCriticalError("Can't start game Canvas is null!!!")
  }
}

main()