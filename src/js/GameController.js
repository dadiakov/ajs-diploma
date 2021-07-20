/* eslint-disable no-continue */
/* eslint-disable no-plusplus */
/* eslint-disable no-shadow */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
import themes from './themes';
import Team from './Team';
import GamePlay from './GamePlay';
import GameState from './GameState';
import cursors from './cursors';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.level = 1;
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.gamePlay.drawUi(themes(this.level));
    GameState.from({ player: 'user', index: 0 });

    this.currentTeam = new Team();
 //   this.currentTeam.team[0].position = 29;

    this.gamePlay.redrawPositions(this.currentTeam.team);

    console.log(this.currentTeam);

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  onCellClick(index) {
    const char = this.currentTeam.team[this.currentTeam.team.findIndex(e => e.position === index)];
    this.currentTeam.team.forEach(e => this.gamePlay.deselectCell(e.position));
    if (this.currentTeam.team.some(e => e.position === index) && char.character.player === 'user') {
      GameState.char = char;
      GameState.moveArea = this.checkRange(char.position, char.character.moveRange);
      GameState.attackArea = this.checkRange(char.position, char.character.attackRange);
      this.gamePlay.selectCell(index);
      GameState.currentIndex = index;
    } else {
      this.gamePlay.deselectCell(GameState.currentIndex);
      GameState.currentIndex = 0;
      GameState.char = null;
      GameState.moveArea = [];
      GameState.attackArea = [];
    }
    if (this.currentTeam.team.some(e => e.position === index) && char.character.player === 'comp') {
      GamePlay.showError('Выберите другого персонажа!');
    }
  }

  onCellEnter(index) {
    const char = this.currentTeam.team[this.currentTeam.team.findIndex(e => e.position === index)];
    let message = '';
    if (this.currentTeam.team.some(e => e.position === index)) {
      this.gamePlay.setCursor(cursors.pointer);
      if (char.character.player === 'comp') {
        if (GameState.char && GameState.attackArea.includes(index)) {
          this.gamePlay.setCursor(cursors.crosshair);
          this.gamePlay.selectCell(index, 'red');
        }
        GameState.currentIndex = index;
      }
      const {
        level, attack, defence, health,
      } = char.character;
      message = `\u{1F396}${level}\u{2694}${attack}\u{1F6E1}${defence}\u{2764}${health}`;
      this.gamePlay.showCellTooltip(message, index);
    } else {
      this.gamePlay.selectCell(index, 'green');
      GameState.currentIndex = index;
    }
    if (GameState.char) {
      if (!GameState.attackArea.includes(index) && !GameState.moveArea.includes(index)) {
        this.gamePlay.setCursor(cursors.notallowed);
      }
    }
  }

  onCellLeave(index) {
    const char = this.currentTeam.team[this.currentTeam.team.findIndex(e => e.position === index)];
    this.gamePlay.setCursor(cursors.auto);
    if (this.currentTeam.team.some(e => e.position === index)) {
      this.gamePlay.hideCellTooltip(index);
    } else {
      this.gamePlay.deselectCell(GameState.currentIndex);
    }
    if (this.currentTeam.team.some(e => e.position === index) && char.character.player === 'comp') {
      this.gamePlay.deselectCell(GameState.currentIndex);
    }
  }

  checkRange(cur, range) {
    const array = [];
    let a;

    for (let i = cur - 8 * range; i <= cur + range * 8; i += 8) {
      if (i < 0 || i > 63) continue;
      const y = i;
      for (let i = y; i >= y - range; i--) {
        array.push(i);
        if (i % 8 === 0) { a = i; break; }
      }
      for (let i = y; i <= y + range; i++) {
        if (i % 8 === 0) break;
        array.push(i);
      }
      for (let i = a; i <= y + range; i++) {
        array.push(i);
      }
    }
    return array;
  }
}
