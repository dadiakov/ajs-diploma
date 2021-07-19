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

    if (level === 1) {
      const teamUser = generateTeam([Bowman, Swordsman, Magician], 1, 2);
      teamUser.forEach((e) => this.team.push(new PositionedCharacter(e, this.getIndex(1))));

      const teamComp = generateTeam([Daemon, Undead, Vampire], 1, 2);
      teamComp.forEach((e) => this.team.push(new PositionedCharacter(e, this.getIndex())));
      this.indexArray = [];
    }
  }

  getIndex(player) {
    let index;
    if (player) {
      do { index = Math.round(Math.random()) + Math.round(Math.random() * 8) * 8; } while (this.indexArray.includes(index));
      this.indexArray.push(index);
      return index;
    }
    do { index = 6 + Math.round(Math.random()) + Math.round(Math.random() * 8) * 8; } while (this.indexArray.includes(index));
    this.indexArray.push(index);
    return index;
  }
}
