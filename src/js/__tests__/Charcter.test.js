import Character from "../Character";
import Bowman from "../characters/Bowman";
import Daemon from "../characters/Daemon";
import Magician from "../characters/Magician";
import Swordsman from "../characters/Swordsman";
import Undead from "../characters/Undead";
import Vampire from "../characters/Vampire";

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

describe("create characters at Level 1", () => {
  test("should create a new character Bowman", () => {
    const bowman = new Bowman(1);
    expect(bowman).toBeInstanceOf(Bowman);
    expect(bowman.level).toBe(1);
    expect(bowman.type).toBe("bowman");
    expect(bowman.attack).toBe(25);
    expect(bowman.defence).toBe(25);
  });

  test("should create a new character Daemon", () => {
    const daemon = new Daemon(1);
    expect(daemon).toBeInstanceOf(Daemon);
    expect(daemon.level).toBe(1);
    expect(daemon.type).toBe("daemon");
    expect(daemon.attack).toBe(10);
    expect(daemon.defence).toBe(10);
  });

  test("should create a new character Magician", () => {
    const magician = new Magician(1);
    expect(magician).toBeInstanceOf(Magician);
    expect(magician.level).toBe(1);
    expect(magician.type).toBe("magician");
    expect(magician.attack).toBe(10);
    expect(magician.defence).toBe(40);
  });

  test("should create a new character Swordsman", () => {
    const swordsman = new Swordsman(1);
    expect(swordsman).toBeInstanceOf(Swordsman);
    expect(swordsman.level).toBe(1);
    expect(swordsman.type).toBe("swordsman");
    expect(swordsman.attack).toBe(40);
    expect(swordsman.defence).toBe(10);
  });
  test("should create a new character Undead", () => {
    const undead = new Undead(1);
    expect(undead).toBeInstanceOf(Undead);
    expect(undead.level).toBe(1);
    expect(undead.type).toBe("undead");
    expect(undead.attack).toBe(40);
    expect(undead.defence).toBe(10);
  });

  test("should create a new character Vampire", () => {
    const vampire = new Vampire(1);
    expect(vampire).toBeInstanceOf(Vampire);
    expect(vampire.level).toBe(1);
    expect(vampire.type).toBe("vampire");
    expect(vampire.attack).toBe(25);
    expect(vampire.defence).toBe(25);
  });
});
