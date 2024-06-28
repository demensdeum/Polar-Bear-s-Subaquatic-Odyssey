import { GameData } from "./gameData.js"
import { GameDataDelegate } from "./gameDataDelegate.js"
import { debugPrint } from "./runtime.js";

export class GameplayGuiController implements GameDataDelegate {

    public constructor(gameData: GameData) {
        debugPrint(gameData);
    }

    public step() {

    }
}