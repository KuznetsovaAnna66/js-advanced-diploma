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
    if (selectedCharacter || this.playerTypes.includes(characterType)) {
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
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
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
    return this.positionedCharacters[index];
  }
}
