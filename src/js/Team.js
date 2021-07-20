/* eslint-disable max-len */
import { generateTeam } from './generators';
import PositionedCharacter from './PositionedCharacter';
import Bowman from './Bowman';
import Swordsman from './Swordsman';
import Magician from './Magician';
import Daemon from './Daemon';
import Undead from './Undead';
import Vampire from './Vampire';

export default class Team {
  constructor(level) {
    this.team = [];
    this.indexArray = [];
    this.currentLevel = 1;

    const teamUser = generateTeam([Bowman, Swordsman, Magician], 1, 2);
    teamUser.forEach((e) => this.team.push(new PositionedCharacter(e, this.getIndex(1))));

    const teamComp = generateTeam([Daemon, Undead, Vampire], 1, 2);
    teamComp.forEach((e) => this.team.push(new PositionedCharacter(e, this.getIndex())));
  }

  getIndex(player) {
    let index;
    if (player) {
      do { index = Math.round(Math.random()) + Math.round(Math.random() * 8) * 8; } while (this.indexArray.includes(index) || index > 63);
      this.indexArray.push(index);
      return index;
    }
    do { index = 6 + Math.round(Math.random()) + Math.round(Math.random() * 8) * 8; } while (this.indexArray.includes(index) || index > 63);
    this.indexArray.push(index);
    return index;
  }

  levelUp() {
    this.indexArray = [];
    this.currentLevel++;
    this.team.forEach((char) => {
      char.character.level++;
      char.position = this.getIndex(1);

      const attackAfter = Math.max(char.character.attack, char.character.attack * (1.8 - char.character.health / 100));
      char.character.attack = attackAfter;

      char.character.health += 80;
      if (char.character.health > 100) char.character.health = 100;

      if (char.character.player === 'comp') {
        this.team.splice(this.team.indexOf(char));
        this.indexArray.splice(this.team.indexOf(char));
      }
    });
    if (this.currentLevel === 2) {
      const teamUser = generateTeam([Bowman, Swordsman, Magician], 1, 1);
      teamUser.forEach((e) => this.team.push(new PositionedCharacter(e, this.getIndex(1))));

      const teamComp = generateTeam([Daemon, Undead, Vampire], 2, this.team.length);
      teamComp.forEach((e) => this.team.push(new PositionedCharacter(e, this.getIndex())));
    }

    if (this.currentLevel === 3) {
      const teamUser = generateTeam([Bowman, Swordsman, Magician], 2, 2);
      teamUser.forEach((e) => this.team.push(new PositionedCharacter(e, this.getIndex(1))));

      const teamComp = generateTeam([Daemon, Undead, Vampire], 3, this.team.length);
      teamComp.forEach((e) => this.team.push(new PositionedCharacter(e, this.getIndex())));
    }

    if (this.currentLevel === 4) {
      const teamUser = generateTeam([Bowman, Swordsman, Magician], 3, 2);
      teamUser.forEach((e) => this.team.push(new PositionedCharacter(e, this.getIndex(1))));

      const teamComp = generateTeam([Daemon, Undead, Vampire], 4, this.team.length);
      teamComp.forEach((e) => this.team.push(new PositionedCharacter(e, this.getIndex())));
    }
  }
}
