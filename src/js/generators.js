import Team from "./Team.js";

/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  // TODO: write logic here

  while (true) {
    const indexType = Math.floor(Math.random() * allowedTypes.length);
    const level = Math.floor(Math.random() * maxLevel + 1);

    yield new allowedTypes[indexType](level);
  }
}

/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @returns экземпляр Team, хранящий экземпляры персонажей. Количество персонажей в команде - characterCount
 * */
export function generateTeam(allowedTypes, maxLevel, characterCount) {
  // TODO: write logic here
  const team = new Team();
  const character = characterGenerator(allowedTypes, maxLevel);

  for (let i = 0; i < characterCount; i++) {
    const newCharacter = character.next().value; // Получаем нового персонажа
    if (newCharacter) {
      // Проверяем, создан ли персонаж
      team.add(newCharacter); // Добавляем его в команду
    }
  }

  return team;
}
