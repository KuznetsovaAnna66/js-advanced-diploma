import GameController from "../GameController";
import GamePlay from "../GamePlay";

describe("GameController testing", () => {
  let gameController;
  let gamePlay;

  beforeEach(() => {
    gamePlay = { boardSize: GamePlay.boardSize };
    gameController = new GameController(gamePlay);
  });

  test("formatCharacterInfo should return correct string representation of character stats", () => {
    // Создаем пример персонажа
    const character = {
      level: 1,
      attack: 10,
      defence: 5,
      health: 20,
    };

    const expectedOutput = "\u{1F396} 1 \u{2694} 10 \u{1F6E1} 5 \u{2764} 20";
    const result = gameController.formatCharacterInfo(character);
    expect(result).toBe(expectedOutput);
  });

  test("formatCharacterInfo should return error message for invalid character object", () => {
    const result = gameController.formatCharacterInfo(undefined);
    expect(result).toBe("Invalid character object");

    const result2 = gameController.formatCharacterInfo(null);
    expect(result2).toBe("Invalid character object");

    const result3 = gameController.formatCharacterInfo(123);
    expect(result3).toBe("Invalid character object");
  });
});
