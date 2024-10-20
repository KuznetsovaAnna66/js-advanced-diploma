import Bowman from "../characters/Bowman";
import Daemon from "../characters/Daemon";
import Magician from "../characters/Magician";
import Swordsman from "../characters/Swordsman";
import Undead from "../characters/Undead";
import Vampire from "../characters/Vampire";
import GameController from "../GameController";
import GamePlay from "../GamePlay";
import PositionedCharacter from "../PositionedCharacter";

describe("GameController testing", () => {
  let gameController;
  beforeEach(() => {
    const gamePlay = new GamePlay();
    const stateService = {};
    gameController = new GameController(gamePlay, stateService);
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

  describe("Movement", () => {
    test("should allow Bowman to move and attack within range", () => {
      const character = new Bowman(1);
      gameController.positionedCharacters.push(
        new PositionedCharacter(character, 0)
      );
      gameController.currentCharacter = gameController.positionedCharacters[0];

      const canMove = gameController.canMove(1);
      const canAttack = gameController.canAttack(1);
      expect(canMove).toBe(true);
      expect(canAttack).toBe(true);
    });

    test("should not allow Bowman to move and attack out of range", () => {
      const character = new Bowman(1);
      gameController.positionedCharacters.push(
        new PositionedCharacter(character, 0)
      );
      gameController.currentCharacter = gameController.positionedCharacters[0];

      const canMove = gameController.canMove(4);
      const canAttack = gameController.canAttack(4);
      expect(canMove).toBe(false);
      expect(canAttack).toBe(false);
    });

    test("should allow Swordsman to move and attack within range", () => {
      const character = new Swordsman(1);
      gameController.positionedCharacters.push(
        new PositionedCharacter(character, 0)
      );
      gameController.currentCharacter = gameController.positionedCharacters[0];

      const canMove = gameController.canMove(3);
      const canAttack = gameController.canAttack(1);
      expect(canMove).toBe(true);
      expect(canAttack).toBe(true);
    });

    test("should not allow Swordsman to move and attack out of range", () => {
      const character = new Swordsman(1);
      gameController.positionedCharacters.push(
        new PositionedCharacter(character, 0)
      );
      gameController.currentCharacter = gameController.positionedCharacters[0];

      const canMove = gameController.canMove(5);
      const canAttack = gameController.canAttack(2);
      expect(canMove).toBe(false);
      expect(canAttack).toBe(false);
    });

    test("should allow Magician to move and attack within range", () => {
      const character = new Magician(1);
      gameController.positionedCharacters.push(
        new PositionedCharacter(character, 0)
      );
      gameController.currentCharacter = gameController.positionedCharacters[0];

      const canMove = gameController.canMove(1);
      const canAttack = gameController.canAttack(3);
      expect(canMove).toBe(true);
      expect(canAttack).toBe(true);
    });

    it("should not allow Magician to move and attack out of range", () => {
      const character = new Magician(1);
      gameController.positionedCharacters.push(
        new PositionedCharacter(character, 0)
      );
      gameController.currentCharacter = gameController.positionedCharacters[0];

      const canMove = gameController.canMove(4);
      const canAttack = gameController.canAttack(5);
      expect(canMove).toBe(false);
      expect(canAttack).toBe(false);
    });

    test("should allow Daemon to move and attack within range", () => {
      const character = new Daemon(1);
      gameController.positionedCharacters.push(
        new PositionedCharacter(character, 0)
      );
      gameController.currentCharacter = gameController.positionedCharacters[0];

      const canMove = gameController.canMove(1);
      const canAttack = gameController.canAttack(3);
      expect(canMove).toBe(true);
      expect(canAttack).toBe(true);
    });

    test("should not allow Daemon to move and attack out of range", () => {
      const character = new Daemon(1);
      gameController.positionedCharacters.push(
        new PositionedCharacter(character, 0)
      );
      gameController.currentCharacter = gameController.positionedCharacters[0];

      const canMove = gameController.canMove(2);
      const canAttack = gameController.canAttack(5);
      expect(canMove).toBe(false);
      expect(canAttack).toBe(false);
    });

    test("should allow Vampire to move and attack within range", () => {
      const character = new Vampire(1);
      gameController.positionedCharacters.push(
        new PositionedCharacter(character, 0)
      );
      gameController.currentCharacter = gameController.positionedCharacters[0];

      const canMove = gameController.canMove(2);
      const canAttack = gameController.canAttack(2);
      expect(canMove).toBe(true);
      expect(canAttack).toBe(true);
    });

    test("should not allow Vampire to move and attack out of range", () => {
      const character = new Vampire(1);
      gameController.positionedCharacters.push(
        new PositionedCharacter(character, 0)
      );
      gameController.currentCharacter = gameController.positionedCharacters[0];

      const canMove = gameController.canMove(3);
      const canAttack = gameController.canAttack(4);
      expect(canMove).toBe(false);
      expect(canAttack).toBe(false);
    });

    test("should allow Undead to move and attack within range", () => {
      const character = new Undead(1);
      gameController.positionedCharacters.push(
        new PositionedCharacter(character, 0)
      );
      gameController.currentCharacter = gameController.positionedCharacters[0];

      const canMove = gameController.canMove(3);
      const canAttack = gameController.canAttack(1);
      expect(canMove).toBe(true);
      expect(canAttack).toBe(true);
    });

    test("should not allow Undead to move and attack out of range", () => {
      const character = new Undead(1);
      gameController.positionedCharacters.push(
        new PositionedCharacter(character, 0)
      );
      gameController.currentCharacter = gameController.positionedCharacters[0];

      const canMove = gameController.canMove(5);
      const canAttack = gameController.canAttack(2);
      expect(canMove).toBe(false);
      expect(canAttack).toBe(false);
    });
  });
});
