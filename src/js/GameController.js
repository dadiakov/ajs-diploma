/* eslint-disable no-unused-expressions */
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
    this.gamePlay.drawUi(themes(GameState.currentLevel));
    GameState.from({ player: 'user', index: 0 });

    this.currentTeam = new Team();
    //   this.currentTeam.team[0].position = 29;

    this.gamePlay.redrawPositions(this.currentTeam.team);

    console.log(this.currentTeam);

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));

    // setTimeout(() => { this.currentTeam.levelUp(); this.gamePlay.drawUi(themes(GameState.currentLevel)); this.gamePlay.redrawPositions(this.currentTeam.team); }, 2000);
    // setTimeout(() => { this.currentTeam.levelUp(); this.gamePlay.drawUi(themes(GameState.currentLevel)); this.gamePlay.redrawPositions(this.currentTeam.team); }, 4000);
    // setTimeout(() => { this.currentTeam.levelUp(); this.gamePlay.drawUi(themes(GameState.currentLevel)); this.gamePlay.redrawPositions(this.currentTeam.team); }, 6000);
  }

  onCellClick(index) {
    const char = this.currentTeam.team[this.currentTeam.team.findIndex((e) => e.position === index)];
    this.currentTeam.team.forEach((e) => this.gamePlay.deselectCell(e.position));
    // выбор персонажа
    if (this.currentTeam.team.some((e) => e.position === index) && char.character.player === GameState.player) {
      GameState.char = char;
      GameState.moveArea = this.checkRange(char.position, char.character.moveRange);
      GameState.attackArea = this.checkRange(char.position, char.character.attackRange);
      this.gamePlay.selectCell(index);
      GameState.currentIndex = index;
    // переход на пустую клетку
    } else if (GameState.char && GameState.moveArea.includes(index)
        && !this.currentTeam.team.some((e) => e.position === index && e.character.player !== GameState.player)) {
      GameState.char.position = index;
      this.gamePlay.deselectCell(GameState.char.position);
      GameState.char = null;
      GameState.moveArea = [];
      GameState.attackArea = [];
      GameState.player === 'user' ? GameState.player = 'comp' : GameState.player = 'user';
      this.gamePlay.redrawPositions(this.currentTeam.team);
      if (GameState.player === 'comp') this.contrAttack();
    // реализация атаки
    } else if (GameState.char && GameState.attackArea.includes(index)
    && this.currentTeam.team.some((e) => e.position === index && e.character.player !== GameState.player)) {
      const attacker = GameState.char.character;
      const target = this.currentTeam.team.find((e) => e.position === index).character;
      const damage = Math.max(attacker.attack - target.defence, attacker.attack * 0.1);
      this.gamePlay.showDamage(index, damage).then((responce) => {
        target.health -= damage;
        if (target.health <= 0) {
          this.currentTeam.team.splice(this.currentTeam.team.findIndex((e) => e.position === index), 1);
          GameState.char = null;
        }
        GameState.player === 'user' ? GameState.player = 'comp' : GameState.player = 'user';
        GameState.char = null;
        this.gamePlay.redrawPositions(this.currentTeam.team);
        if (GameState.player === 'comp') this.contrAttack();
      });
      return;
      // тыкаем на пустую клетку
    } else {
      this.gamePlay.deselectCell(GameState.currentIndex);
      GameState.currentIndex = 0;
      GameState.char = null;
      GameState.moveArea = [];
      GameState.attackArea = [];
    }
    // выбираем персонажа вне доступа
    if (char && this.currentTeam.team.some((e) => e.position === index) && char.character.player !== GameState.player) {
      GamePlay.showError('Выберите другого персонажа!');
    }
  }

  onCellEnter(index) {
    const char = this.currentTeam.team[this.currentTeam.team.findIndex((e) => e.position === index)];
    let message = '';
    if (this.currentTeam.team.some((e) => e.position === index)) {
      this.gamePlay.setCursor(cursors.pointer);
      if (char.character.player !== GameState.player) {
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
    }

    GameState.currentIndex = index;
    if (!GameState.char && this.currentTeam.team.some((e) => e.position === index && e.character.player !== GameState.player)) {
      this.gamePlay.setCursor(cursors.notallowed);
    }
    if (GameState.char) {
      if (GameState.moveArea.includes(index) && !this.currentTeam.team.some((e) => e.position === GameState.currentIndex)) this.gamePlay.selectCell(index, 'green');
      if (!GameState.attackArea.includes(index) && !GameState.moveArea.includes(index)) {
        this.gamePlay.selectCell(index, 'auto');
        this.gamePlay.setCursor(cursors.notallowed);
      }
    }
  }

  onCellLeave(index) {
    const char = this.currentTeam.team[this.currentTeam.team.findIndex((e) => e.position === index)];
    this.gamePlay.setCursor(cursors.auto);
    if (this.currentTeam.team.some((e) => e.position === index)) {
      this.gamePlay.hideCellTooltip(index);
    } else {
      this.gamePlay.deselectCell(GameState.currentIndex);
    }
    if (this.currentTeam.team.some((e) => e.position === index) && char.character.player !== GameState.player) {
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
    const sortedArray = array.reduce((uniq, item) => (uniq.includes(item) ? uniq : [...uniq, item]), []);
    sortedArray.splice(sortedArray.indexOf(cur), 1);
    return sortedArray;
  }

  contrAttack() {
    const arrayOfChars = [];
    this.currentTeam.team.forEach((e) => {
      if (e.character.player === 'comp') arrayOfChars.push(e);
    });
    const char = arrayOfChars[Math.floor(Math.random() * arrayOfChars.length)];
    GameState.moveArea = this.checkRange(char.position, char.character.moveRange);
    GameState.attackArea = this.checkRange(char.position, char.character.attackRange);

    let ind;

    GameState.attackArea.forEach((index) => {
      if (this.currentTeam.team.some((e) => (e.position === index) && (e.character.player !== 'comp'))) {
        ind = index;
      }
    });

    if (ind !== undefined) {
      const attacker = char.character;
      const target = this.currentTeam.team.find((e) => e.position === ind).character;
      const damage = Math.max(attacker.attack - target.defence, attacker.attack * 0.1);
      this.gamePlay.showDamage(ind, damage).then((responce) => {
        target.health -= damage;
        if (target.health <= 0) {
          this.currentTeam.team.splice(this.currentTeam.team.findIndex((e) => e.position === ind), 1);
        }
        this.gamePlay.redrawPositions(this.currentTeam.team);
      });
    } else {
      let newPosition = 0;
      do { newPosition = GameState.moveArea[Math.floor(Math.random() * GameState.moveArea.length)]; } while (this.currentTeam.team.some((e) => e.position === newPosition));
      char.position = newPosition;
      this.gamePlay.redrawPositions(this.currentTeam.team);
    }

    GameState.player === 'user' ? GameState.player = 'comp' : GameState.player = 'user';
  }
}
