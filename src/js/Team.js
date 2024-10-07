/**
 * Класс, представляющий персонажей команды
 *
 * @todo Самостоятельно продумайте хранение персонажей в классе
 * Например
 * @example
 * ```js
 * const characters = [new Swordsman(2), new Bowman(1)]
 * const team = new Team(characters);
 *
 * team.characters // [swordsman, bowman]
 * ```
 * */
export default class Team {
  // TODO: write your logic here
  constructor() {
    this.members = new Set();
  }

  add(character) {
    if (this.members.has(character)) {
      throw new Error("Такой персонаж уже добавлен");
    }
    this.members.add(character);
  }

  addAll(...characters) {
    characters.forEach((character) => this.members.add(character));
  }

  toArray() {
    return [...this.members];
  }

  *[Symbol.iterator]() {
    for (const character of [...this.characters]) {
      yield character;
    }
  }
}
