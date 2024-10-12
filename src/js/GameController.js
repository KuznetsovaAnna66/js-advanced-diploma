import themes from "./themes";
import GamePlay from "./GamePlay";
import GameState from "./GameState";
import PositionedCharacter from "./PositionedCharacter";
import { generateTeam } from "./generators";
import Bowman from "./characters/Bowman";
import Swordsman from "./characters/Swordsman";
import Magician from "./characters/Magician";
import Vampire from "./characters/Vampire";
import Undead from "./characters/Undead";
import Daemon from "./characters/Daemon";
import cursors from "./cursors";

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = new GameState();
    this.boardSize = this.gamePlay.boardSize;
    this.positionedCharacters = [];
    this.playerTypes = [Bowman, Swordsman, Magician];
    this.enemyTypes = [Vampire, Undead, Daemon];
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService

    this.gamePlay.drawUi(themes.prairie);

    const { playerPositions, enemyPositions } = this.getPositions();
    const playerTeam = generateTeam(this.playerTypes, 5, 3);
    const enemyTeam = generateTeam(this.enemyTypes, 5, 3);
    const positions = [...playerPositions, ...enemyPositions];

    playerTeam.characters.forEach((character) => {
      // Проверяем, есть ли доступные позиции
      if (playerPositions.length > 0) {
        let playerPositionIndex = Math.floor(
          Math.random() * playerPositions.length
        );
        let playerPosition = playerPositions.splice(playerPositionIndex, 1)[0]; // Извлекаем позицию
        this.positionedCharacters.push(
          new PositionedCharacter(character, playerPosition)
        );
      }
    });

    enemyTeam.characters.forEach((character) => {
      // Проверяем, есть ли доступные позиции
      if (enemyPositions.length > 0) {
        let enemyPositionIndex = Math.floor(
          Math.random() * enemyPositions.length
        );
        let enemyPosition = enemyPositions.splice(enemyPositionIndex, 1)[0]; // Извлекаем позицию
        this.positionedCharacters.push(
          new PositionedCharacter(character, enemyPosition)
        );
      }
    });

    this.gamePlay.redrawPositions(this.positionedCharacters);

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  onCellClick(index) {
    // TODO: react to click
    const selectedCharacter = this.positionedCharacters.find(
      (element) => element.position === index
    );

    if (!selectedCharacter) {
      GamePlay.showError("Ячейка пуста!");
      return;
    }

    const characterType = selectedCharacter.character.constructor;
    if (selectedCharacter && this.playerTypes.includes(characterType)) {
      this.positionedCharacters.forEach((element) => {
        this.gamePlay.deselectCell(element.position);
      });
      this.gamePlay.selectCell(index);
      this.currentCharacter = selectedCharacter;
    } else if (this.enemyTypes.includes(characterType)) {
      GamePlay.showError("Выберите своего персонажа");
    }
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    const selectedCharacter = this.positionedCharacters.find((char) => {
      return char.position === index;
    });

    if (selectedCharacter) {
      // Формируем информацию о персонаже
      this.gamePlay.setCursor("pointer");
      const tooltipInfo = this.formatCharacterInfo(selectedCharacter.character);
      this.gamePlay.showCellTooltip(tooltipInfo, index);
    }

    //подсвечиваются доступные для перехода клетки
    if (
      this.currentCharacter &&
      !this.getCharacter(index) &&
      this.isMoving(index)
    ) {
      this.gamePlay.setCursor(cursors.pointer);
      this.gamePlay.selectCell(index, "green");
    } else if (this.currentCharacter && !this.isUserCharacter(index)) {
      this.gamePlay.setCursor(cursors.notallowed);
    }

    //подсвечиваются для удара
    if (
      this.currentCharacter &&
      this.getCharacter(index) &&
      !this.isUserCharacter(index)
    ) {
      if (this.isAttack(index)) {
        this.gamePlay.setCursor(cursors.crosshair);
        this.gamePlay.selectCell(index, "red");
      } else if (this.currentCharacter && !this.isUserCharacter(index)) {
        this.gamePlay.setCursor(cursors.notallowed);
      }
    }
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    this.gamePlay.cells.forEach((element) =>
      element.classList.remove("selected-red")
    );
    this.gamePlay.cells.forEach((element) =>
      element.classList.remove("selected-green")
    );
    this.gamePlay.setCursor("auto");
    this.gamePlay.hideCellTooltip(index);
  }

  getPositions() {
    const playerPositions = [];
    const enemyPositions = [];
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const position = row * this.boardSize + col; // Вычисляем позицию в одномерном массиве

        // Условия для игрока: первые два столбца
        if (col === 0 || col === 1) {
          playerPositions.push(position);
        }

        // Условия для противника: последние два столбца
        if (col === this.boardSize - 2 || col === this.boardSize - 1) {
          enemyPositions.push(position);
        }
      }
    }

    return {
      playerPositions: playerPositions || [],
      enemyPositions: enemyPositions || [],
    };
  }

  formatCharacterInfo(character) {
    if (!character || typeof character !== "object") {
      return "Invalid character object";
    }
    return `\u{1F396} ${character.level} \u{2694} ${character.attack} \u{1F6E1} ${character.defence} \u{2764} ${character.health}`;
  }

  getCharacter(index) {
    return this.positionedCharacters.find(
      (element) => element.position === index
    );
  }

  isUserCharacter(index) {
    if (this.getCharacter(index)) {
      const char = this.getCharacter(index).character;
      return this.playerTypes.some((element) => char instanceof element);
    }
    return false;
  }

  isMoving(index) {
    if (this.currentCharacter) {
      const mov = this.currentCharacter.character.movement;
      const arr = this.calcMovementRange(this.currentCharacter.position, mov);
      return arr.includes(index);
    }
    return false;
  }

  isAttack(index) {
    if (this.currentCharacter) {
      const attack = this.currentCharacter.character.attackRange;
      const arr = this.calcMovementRange(
        this.currentCharacter.position,
        attack
      );
      return arr.includes(index);
    }
    return false;
  }

  calcMovementRange(index, character) {
    const availableMovements = [];
    const boardSize = this.boardSize;

    const row = Math.floor(index / boardSize);
    const col = index % boardSize;

    //по вертикали
    for (let i = 1; i <= character; i++) {
      if (row + i < boardSize) {
        availableMovements.push(index + boardSize * i); // Вниз
      }
      if (row - i >= 0) {
        availableMovements.push(index - boardSize * i); // Вверх
      }
    }

    //по горизонтали
    for (let i = 1; i <= character; i++) {
      if (col - i >= 0) {
        availableMovements.push(index - i); // Влево
      }
      if (col + i < boardSize) {
        availableMovements.push(index + i); // Вправо
      }
      //по диагонали
      if (row + i < boardSize && col - i >= 0) {
        availableMovements.push(index + (boardSize * i - i)); // Вниз-влево
      }
      if (row + i < boardSize && col + i < boardSize) {
        availableMovements.push(index + (boardSize * i + i)); // Вниз-вправо
      }
      if (row - i >= 0 && col - i >= 0) {
        availableMovements.push(index - (boardSize * i + i)); // Вверх-влево
      }
      if (row - i >= 0 && col + i < boardSize) {
        availableMovements.push(index - (boardSize * i - i)); // Вверх-вправо
      }
    }
    return availableMovements;
  }
}
