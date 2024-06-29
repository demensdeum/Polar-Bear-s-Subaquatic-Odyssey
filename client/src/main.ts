//import { CompanyLogoState } from "./companyLogoState.js"
import { Context } from "./context.js"
import { InGameState } from "./inGameState.js"

function main(options: {[key: string]: string} = {}) {
  const debugEnabled = options["debugEnabled"] === "true"

  const context = new Context(
      debugEnabled
  )
  
  // const companyLogoState = new CompanyLogoState(
  //   "CompanyLogo",
  //   context
  // )

  // context.start(companyLogoState)

  const startState = new InGameState(
    "InGameState",
    context
  )
  context.start(startState);

  function step() {
      if (!context.isRunning) {
          return
      }
      context.step()
      requestAnimationFrame(step)
  }

  requestAnimationFrame(step)
}

main()