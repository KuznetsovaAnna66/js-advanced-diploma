import Bowman from "../characters/Bowman";
import Daemon from "../characters/Daemon";
import Magician from "../characters/Magician";
import Swordsman from "../characters/Swordsman";
import Undead from "../characters/Undead";
import Vampire from "../characters/Vampire";
import { characterGenerator, generateTeam } from "../generators";

describe("characterGenerator testing", () => {
  const allowedTypes = [Bowman, Daemon, Magician, Swordsman, Undead, Vampire];

  test("The characterGenerator should produce infinitely new characters from the list", () => {
    expect(characterGenerator(allowedTypes, 4).next().done).toBeFalsy();
  });

  test("the generated characters should be from the allowedTypes", () => {
    const characters = [];
    const gen = characterGenerator(allowedTypes, 4);

    for (let i = 0; i < 10; i++) {
      const character = gen.next().value;
      characters.push(character.constructor.name);

      const validTypes = allowedTypes.map((type) => type.name);
      characters.forEach((name) => {
        expect(validTypes.includes(name)).toBeTruthy();
      });
    }
  });
});

describe("generateTeam testing", () => {
  const allowedTypes = [Bowman, Daemon, Magician, Swordsman, Undead, Vampire];
  const maxLevel = 4;
  const characterCount = 6;

  test("should generate correct number of characters", () => {
    const team = generateTeam(allowedTypes, maxLevel, characterCount);
    expect([...team.characters].length).toBe(characterCount);
  });

  test("should generate correct level of characters", () => {
    const team = generateTeam(allowedTypes, maxLevel, characterCount);
    expect(
      [...team.characters].every(
        (character) => character.level >= 1 && character.level <= 5
      )
    ).toBeTruthy();
  });
});
