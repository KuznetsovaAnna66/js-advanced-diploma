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
    this.themes = Object.keys(themes);
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.gamePlay.drawUi(this.themes[this.gameState.level - 1]);

    const { playerPositions, enemyPositions } = this.getPositions();
    this.playerTeam = generateTeam(this.playerTypes, this.gameState.level, 2);
    this.enemyTeam = generateTeam(this.enemyTypes, this.gameState.level, 2);

    this.positionCharacters(playerPositions, this.playerTeam);
    this.positionCharacters(enemyPositions, this.enemyTeam);

    this.gamePlay.redrawPositions(this.positionedCharacters);
    console.log("Positioned Characters", this.positionedCharacters);
    console.log("Enemy team", this.enemyTeam);

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));
  }

  onCellClick(index) {
    // TODO: react to click
    if (this.gameState.isGameOver) return;

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
    if (this.gameState.isGameOver) return;
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
    if (this.gameState.isGameOver) return;
    this.gamePlay.cells.forEach((element) =>
      element.classList.remove("selected-red")
    );
    this.gamePlay.cells.forEach((element) =>
      element.classList.remove("selected-green")
    );
    this.gamePlay.setCursor("auto");
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor("auto");
    this.gamePlay.hideCellTooltip(index);
  }

  deselectAllCells() {
    this.positionedCharacters.forEach((element) => {
      this.gamePlay.deselectCell(element.position);
    });
    this.gamePlay.cells.forEach((element) => {
      element.classList.remove("selected-green", "selected-red");
    });
  }

  getPositions() {
    const playerPositions = [];
    const enemyPositions = [];
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const position = row * this.boardSize + col; // Вычисляем позицию в одномерном массиве

        // Условия для игрока: первые два столбца
        if (col === 0 || col === 1) playerPositions.push(position);

        // Условия для противника: последние два столбца
        if (col === this.boardSize - 2 || col === this.boardSize - 1)
          enemyPositions.push(position);
      }
    }

    return { playerPositions, enemyPositions };
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
    const availableRange = [];
    const boardSize = this.boardSize;
    const row = Math.floor(index / boardSize);
    const col = index % boardSize;

    //по вертикали
    for (let i = 1; i <= character; i++) {
      if (row + i < boardSize) availableRange.push(index + boardSize * i); // Вниз
      if (row - i >= 0) availableRange.push(index - boardSize * i); // Вверх

      //по горизонтали
      if (col - i >= 0) availableRange.push(index - i); // Влево
      if (col + i < boardSize) availableRange.push(index + i); // Вправо

      //по диагонали
      if (row + i < boardSize && col - i >= 0)
        availableRange.push(index + (boardSize * i - i)); // Вниз-влево
      if (row + i < boardSize && col + i < boardSize)
        availableRange.push(index + (boardSize * i + i)); // Вниз-вправо
      if (row - i >= 0 && col - i >= 0)
        availableRange.push(index - (boardSize * i + i)); // Вверх-влево
      if (row - i >= 0 && col + i < boardSize)
        availableRange.push(index - (boardSize * i - i)); // Вверх-вправо
    }
    return availableRange;
  }

  getScore() {
    this.gameState.score += this.playerTeam
      .toArray()
      .reduce((a, b) => a + b.health, 0);
  }

  getResult() {
    // Если команда игрока пуста, проигрыш
    if (this.playerTeam.characters.size === 0) {
      this.gameState.statistics.push(this.gameState.score);
      GamePlay.showMessage(
        `Вы проиграли:( Количество очков: ${this.gameState.score}.`
      );
      return; // прерываем выполнение функции
    }

    // Если команда врага пуста и уровень 4, победа
    if (this.enemyTeam.characters.size === 0 && this.gameState.level === 4) {
      this.getScore();
      this.gameOver();
      this.gameState.statistics.push(this.gameState.score);

      return; // прерываем выполнение функции
    }

    // Если команда врага пуста и уровень меньше или равен 3, переход на следующий уровень
    if (this.enemyTeam.characters.size === 0 && this.gameState.level <= 3) {
      this.gameState.isPlayerTurn = true;
      this.getScore();
      GamePlay.showMessage(
        `Вы прошли уровень ${this.gameState.level}. Количество очков: ${this.gameState.score}.`
      );
      this.gameState.level += 1;
      this.nextLevel();
    }
  }

  nextLevel() {
    for (const character of this.playerTeam.characters) {
      character.levelUp();
    }
  }

  getLevelUp() {
    this.positionedCharacters = [];
    switch (this.gameState.level) {
      case 1:
        this.gamePlay.drawUi(this.themes[this.gameState.level - 1]);
        // this.playerTeam = generateTeam(this.playerTypes, 1, 1);
        this.enemyTeam = generateTeam(
          this.enemyTypes,
          1,
          this.playerTeam.characters.size
        );
        break;

      case 2:
        this.gamePlay.drawUi(this.themes[this.gameState.level - 1]);
        // this.playerTeam = generateTeam(this.playerTypes, 2, 2);
        this.enemyTeam = generateTeam(
          this.enemyTypes,
          2,
          this.playerTeam.characters.size
        );
        break;

      case 3:
        this.gamePlay.drawUi(this.themes[this.gameState.level - 1]);
        // this.playerTeam = generateTeam(this.playerTypes, 3, 2);
        this.enemyTeam = generateTeam(
          this.enemyTypes,
          3,
          this.playerTeam.characters.size
        );
        break;

      case 4:
        this.gamePlay.drawUi(this.themes[this.gameState.level - 1]);
        // this.playerTeam = generateTeam(this.playerTypes, 4, 2);
        this.enemyTeam = generateTeam(
          this.enemyTypes,
          4,
          this.playerTeam.characters.size
        );
        break;
    }
    const { playerPositions, enemyPositions } = this.getPositions();
    this.positionCharacters(playerPositions, this.playerTeam);
    this.positionCharacters(enemyPositions, this.enemyTeam);
    this.gamePlay.redrawPositions(this.positionedCharacters);
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

      // Проверка победы
      if (this.enemyTeam.characters.size === 0) {
        if (this.gameState.level === 4) {
          this.gameOver(); // Игра закончена, если прошли все 4 уровня
        } else {
          this.getResult();
          this.getLevelUp();
        }
      }

      this.gamePlay.redrawPositions(this.positionedCharacters);
      this.gameState.isPlayerTurn = false;
      this.computerActions();
    }
  }

  getRandom(positions) {
    return positions[Math.floor(Math.random() * positions.length)];
  }

  async computerActions() {
    if (this.gameState.isPlayerTurn) return;

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
      this.getResult();
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

  onNewGameClick() {
    this.gameState.isGameOver = false;
    this.gameState.level = 1;
    this.gameState.score = 0;
    this.gamePlay.drawUi(this.themes[this.gameState.level - 1]);

    const { playerPositions, enemyPositions } = this.getPositions();
    this.playerTeam = generateTeam(this.playerTypes, 1, 2);
    this.enemyTeam = generateTeam(this.enemyTypes, 1, 2);
    this.positionedCharacters = [];

    this.positionCharacters(playerPositions, this.playerTeam);
    this.positionCharacters(enemyPositions, this.enemyTeam);

    this.gamePlay.redrawPositions(this.positionedCharacters);
  }

  positionCharacters(positions, team) {
    team.characters.forEach((character) => {
      if (positions.length > 0) {
        let positionIndex = Math.floor(Math.random() * positions.length);
        let position = positions.splice(positionIndex, 1)[0];
        this.positionedCharacters.push(
          new PositionedCharacter(character, position)
        );
      }
    });
  }

  onSaveGameClick() {
    this.gameState.allPositions = this.positionedCharacters.map(
      (positionedCahr) => ({
        character: {
          type: positionedCahr.character.constructor.name.toLowerCase(), // Предполагается, что имя класса соответствует типу
          level: positionedCahr.character.level,
          health: positionedCahr.character.health,
        },
        position: positionedCahr.position,
      })
    );
    this.stateService.save(GameState.from(this.gameState));
    GamePlay.showMessage("Игра сохранена");
  }

  onLoadGameClick() {
    const load = this.stateService.load();
    if (!load) {
      GamePlay.showError("Ошибка загрузки.");
      return;
    }

    this.gameState.isPlayerTurn = load.isPlayerTurn;
    this.gameState.level = load.level;
    this.gameState.score = load.score;
    this.gameState.statistics = load.statistics;
    this.gameState.selected = load.selected;

    this.playerTeam = new Team();
    this.enemyTeam = new Team();
    this.positionedCharacters = [];

    load.allPositions.forEach((element) => {
      let char;
      switch (element.character.type) {
        case "swordsman":
          char = new Swordsman(element.character.level);
          break;
        case "bowman":
          char = new Bowman(element.character.level);
          break;
        case "magician":
          char = new Magician(element.character.level);
          break;
        case "undead":
          char = new Undead(element.character.level);
          break;
        case "vampire":
          char = new Vampire(element.character.level);
          break;
        case "daemon":
          char = new Daemon(element.character.level);
          break;
        default:
          console.warn(`Неизвестный тип персонажа: ${element.character.type}`);
          return;
      }
      char.health = element.character.health;
      const positionedChar = new PositionedCharacter(char, element.position);
      this.positionedCharacters.push(positionedChar);

      if (this.playerTypes.some((type) => char instanceof type)) {
        this.playerTeam.addAll([char]);
      } else if (this.enemyTypes.some((type) => char instanceof type)) {
        this.enemyTeam.addAll([char]);
      }
    });

    GamePlay.showMessage("Игра загружена");
    this.gamePlay.drawUi(this.themes[this.gameState.level - 1]);
    this.gamePlay.redrawPositions(this.positionedCharacters);
  }

  gameOver() {
    this.gameState.isGameOver = true;
    this.gamePlay.setCursor("auto");
    GamePlay.showMessage(
      `Вы победили! Поздравляем! Количество очков: ${this.gameState.score}`
    );
  }
}
