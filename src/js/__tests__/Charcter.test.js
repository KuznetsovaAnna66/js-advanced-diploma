import Character from "../Character";
import Bowman from "../characters/Bowman";
import Daemon from "../characters/Daemon";
import Magician from "../characters/Magician";
import Swordsman from "../characters/Swordsman";
import Undead from "../characters/Undead";
import Vampire from "../characters/Vampire";
import { generateTeam } from "../generators";

test("should be thrown an error when using new Charcter()", () => {
  expect(() => new Character(1)).toThrow(
    new Error("The base class cannot be used to create a character")
  );
});

test("should not be thrown an error when creating objects of classes inherited from Character", () => {
  expect(() => new Daemon(1)).not.toThrow(
    new Error("The base class cannot be used to create a character")
  );
});

describe("Character Attributes at Level 1", () => {
  const allowedTypes = [Bowman, Daemon, Magician, Swordsman, Undead, Vampire];
  const maxLevel = 1;
  const characterCount = 6;
  const team = generateTeam(allowedTypes, maxLevel, characterCount);

  const expectedAttributes = [
    {
      type: Bowman,
      expectedLevel: 1,
      expectedAttack: 25,
      expectedDefence: 25,
    },
    {
      type: Swordsman,
      expectedLevel: 1,
      expectedAttack: 40,
      expectedDefence: 10,
    },

    {
      type: Magician,
      expectedLevel: 1,
      expectedAttack: 10,
      expectedDefence: 40,
    },
    {
      type: Vampire,
      expectedLevel: 1,
      expectedAttack: 25,
      expectedDefence: 25,
    },
    {
      type: Undead,
      expectedLevel: 1,
      expectedAttack: 40,
      expectedDefence: 10,
    },
    {
      type: Daemon,
      expectedLevel: 1,
      expectedAttack: 10,
      expectedDefence: 10,
    },
  ];

  expectedAttributes.forEach(
    ({ type, expectedLevel, expectedAttack, expectedDefence }) => {
      it(`should create a ${type.name} character with correct attributes at level 1`, () => {
        team.characters.forEach((character) => {
          if (character instanceof type) {
            expect(character.level).toBe(expectedLevel);
            expect(character.attack).toBe(expectedAttack);
            expect(character.defence).toBe(expectedDefence);
          }
        });
      });
    }
  );
});
