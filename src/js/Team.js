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
    this.characters = new Set();
  }

  add(character) {
    if (this.characters.has(character)) {
      throw new Error("Такой персонаж уже добавлен");
    }
    this.characters.add(character);
  }

  addAll(...characters) {
    characters.forEach((character) => this.characters.add(character));
  }

  delete(character) {
    this.characters.delete(character);
  }

  toArray() {
    return [...this.characters];
  }
}
