export default class GameState {
  constructor() {
    this.isPlayerTurn = true;
    this.isGameOver = false;
    this.selectedCharacter = [];
    this.level = 1;
    this.allPositions = [];
    this.score = 0;
    this.statistics = [];
    this.selected = null;
  }

  static from(object) {
    // TODO: create object
    if (typeof object === "object") return object;
    return null;
  }
}
