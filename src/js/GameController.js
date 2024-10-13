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
import Team from "./Team";

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = new GameState();
    this.boardSize = this.gamePlay.boardSize;
    this.positionedCharacters = [];
    this.playerTypes = [Bowman, Swordsman, Magician];
    this.enemyTypes = [Vampire, Undead, Daemon];
    this.enemyTeam = new Team();
    this.playerTeam = new Team();
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService

    this.gamePlay.drawUi(themes.prairie);

    const { playerPositions, enemyPositions } = this.getPositions();
    this.playerTeam = generateTeam(this.playerTypes, 5, 3);
    this.enemyTeam = generateTeam(this.enemyTypes, 5, 3);
    const positions = [...playerPositions, ...enemyPositions];

    this.playerTeam.characters.forEach((character) => {
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

    this.enemyTeam.characters.forEach((character) => {
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
    const selectedCharacter = this.getCharacter(index);

    if (selectedCharacter) {
      if (this.isPlayerCharacter(index)) {
        this.deselectAllCells();
        this.gamePlay.selectCell(index);
        this.currentCharacter = selectedCharacter;
        this.gameState.selected = index;
      } else if (this.currentCharacter && this.canAttack(index)) {
        this.deselectAllCells();
        this.attack(index);
        this.currentCharacter = null;
        this.computerActions();
      } else {
        GamePlay.showError("Выберите своего персонажа");
      }
    } else if (this.currentCharacter && this.canMove(index)) {
      this.deselectAllCells();
      this.currentCharacter.position = index; // Обновляем позицию текущего персонажа
      this.gamePlay.redrawPositions(this.positionedCharacters); // Перерисовка персонажей после перемещения
      this.currentCharacter = null;
      this.gameState.isPlayerTurn = false;
      this.computerActions();
    }
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    const selectedCharacter = this.getCharacter(index);

    if (selectedCharacter) {
      // Формируем информацию о персонаже
      this.gamePlay.setCursor("pointer");
      const tooltipInfo = this.formatCharacterInfo(selectedCharacter.character);
      this.gamePlay.showCellTooltip(tooltipInfo, index);
    }

    if (this.currentCharacter) {
      if (!selectedCharacter && this.canMove(index)) {
        // Подсвечиваются доступные для перехода клетки
        this.gamePlay.setCursor(cursors.pointer);
        this.gamePlay.selectCell(index, "green");
      } else if (selectedCharacter && !this.isPlayerCharacter(index)) {
        // Подсвечиваются для удара
        if (this.canAttack(index)) {
          this.gamePlay.setCursor(cursors.crosshair);
          this.gamePlay.selectCell(index, "red");
        } else {
          this.gamePlay.setCursor(cursors.notallowed);
        }
      } else if (!this.isPlayerCharacter(index)) {
        this.gamePlay.setCursor(cursors.notallowed);
      }
    }
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    this.deselectAllCells();
    this.gamePlay.setCursor("auto");
    this.gamePlay.hideCellTooltip(index);
  }

  deselectAllCells() {
    this.positionedCharacters.forEach((element) => {
      this.gamePlay.deselectCell(element.position);
    });
    this.gamePlay.cells.forEach((element) => {
      element.classList.remove("selected-green", "selected-yellow");
    });
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

  isPlayerCharacter(index) {
    if (this.getCharacter(index)) {
      const char = this.getCharacter(index).character;
      return this.playerTypes.some((element) => char instanceof element);
    }
    return false;
  }

  canMove(index) {
    if (this.currentCharacter) {
      const mov = this.currentCharacter.character.movement;
      const arr = this.calcRange(this.currentCharacter.position, mov);
      return arr.includes(index);
    }
    return false;
  }

  canAttack(index) {
    if (this.currentCharacter) {
      const attack = this.currentCharacter.character.attackRange;
      const arr = this.calcRange(this.currentCharacter.position, attack);
      return arr.includes(index);
    }
    return false;
  }

  calcRange(index, character) {
    const availableMovements = [];
    const boardSize = this.boardSize;

    const row = Math.floor(index / boardSize);
    const col = index % boardSize;

    //по вертикали
    for (let i = 1; i <= character; i++) {
      if (row + i < boardSize) availableMovements.push(index + boardSize * i); // Вниз
      if (row - i >= 0) availableMovements.push(index - boardSize * i); // Вверх

      //по горизонтали
      if (col - i >= 0) availableMovements.push(index - i); // Влево
      if (col + i < boardSize) availableMovements.push(index + i); // Вправо

      //по диагонали
      if (row + i < boardSize && col - i >= 0)
        availableMovements.push(index + (boardSize * i - i)); // Вниз-влево
      if (row + i < boardSize && col + i < boardSize)
        availableMovements.push(index + (boardSize * i + i)); // Вниз-вправо
      if (row - i >= 0 && col - i >= 0)
        availableMovements.push(index - (boardSize * i + i)); // Вверх-влево
      if (row - i >= 0 && col + i < boardSize)
        availableMovements.push(index - (boardSize * i - i)); // Вверх-вправо
    }
    return availableMovements;
  }

  getDelete(index) {
    this.positionedCharacters.splice(
      this.positionedCharacters.indexOf(this.getCharacter(index)),
      1
    );
  }

  async attack(index) {
    if (this.gameState.isPlayerTurn) {
      const attacker = this.currentCharacter.character;
      const target = this.getCharacter(index).character;
      const damage = Math.max(
        attacker.attack - target.defence,
        attacker.attack * 0.1
      ); // Расчет урона

      if (!attacker || !target) {
        console.error("Attacker or target not found");
        return;
      }

      await this.gamePlay.showDamage(index, damage);
      target.health -= damage;

      if (target.health <= 0) {
        this.getDelete(index);
        this.enemyTeam.delete(target);
      }

      this.gamePlay.redrawPositions(this.positionedCharacters);
      // this.getResult();
      this.gameState.isPlayerTurn = false;
      this.computerActions();
    }
  }

  getRandom(positions) {
    this.positions = positions;
    return this.positions[Math.floor(Math.random() * this.positions.length)];
  }

  async computerActions() {
    if (this.gameState.isPlayerTurn) {
      return;
    }

    const enemyTeam = this.positionedCharacters.filter((element) =>
      this.enemyTypes.some((type) => element.character instanceof type)
    );
    const playerTeam = this.positionedCharacters.filter((element) =>
      this.playerTypes.some((type) => element.character instanceof type)
    );

    let attacker = null;
    let target = null;

    if (enemyTeam.length === 0 || playerTeam.length === 0) {
      return;
    }

    enemyTeam.forEach((enemyChar) => {
      const rangeAttack = this.calcRange(
        enemyChar.position,
        enemyChar.character.attackRange
      );
      playerTeam.forEach((playerChar) => {
        if (rangeAttack.includes(playerChar.position)) {
          attacker = enemyChar;
          target = playerChar;
        }
      });
    });

    if (target) {
      const damage = Math.max(
        attacker.character.attack - target.character.defence,
        attacker.character.attack * 0.1
      );

      await this.gamePlay.showDamage(target.position, damage);
      target.character.health -= damage;

      if (target.character.health <= 0) {
        this.getDelete(target.position);
        this.playerTeam.delete(target.character);
      }

      this.gamePlay.redrawPositions(this.positionedCharacters);
      this.gameState.isPlayerTurn = true;
      // this.getResult();
    } else {
      attacker = enemyTeam[Math.floor(Math.random() * enemyTeam.length)];
      const attackerRange = this.calcRange(
        attacker.position,
        attacker.character.movement
      );
      attackerRange.forEach((element) => {
        this.positionedCharacters.forEach((i) => {
          if (element === i.position) {
            attackerRange.splice(attackerRange.indexOf(i.position), 1);
          }
        });
      });
      const attackerPosition = this.getRandom(attackerRange);
      attacker.position = attackerPosition;

      this.gamePlay.redrawPositions(this.positionedCharacters);
      this.gameState.isPlayerTurn = true;
    }
  }
}
