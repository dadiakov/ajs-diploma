/* eslint-disable linebreak-style *//* eslint-disable no-loop-func */
/* eslint-disable no-unused-vars *//* eslint-disable func-names */
/* eslint-disable no-self-assign *//* eslint-disable no-unused-expressions */
/* eslint-disable no-continue *//* eslint-disable no-plusplus */
/* eslint-disable no-shadow *//* eslint-disable class-methods-use-this */
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
  }

  init() {
    GameState.from({ player: 'user', currentLevel: 1 });
    this.gamePlay.drawUi(themes(GameState.currentLevel));

    this.currentTeam = new Team();

    this.gamePlay.redrawPositions(this.currentTeam.team);

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addNewGameListener(this.newGame.bind(this));
    this.gamePlay.addSaveGameListener(this.saveGame.bind(this));
    this.gamePlay.addLoadGameListener(this.loadGame.bind(this));
  }

  onCellClick(index) {
    const char = this.getChar(index);
    this.currentTeam.team.forEach((e) => this.gamePlay.deselectCell(e.position));
    // выбор персонажа
    if (this.checkIndex(index) && char.character.player === GameState.player) {
      GameState.char = char;
      GameState.moveArea = this.checkRange(char.position, char.character.moveRange);
      GameState.attackArea = this.checkRange(char.position, char.character.attackRange);
      this.gamePlay.selectCell(index);
      GameState.currentIndex = index;
    // переход на пустую клетку
    } else if (GameState.char && GameState.moveArea.includes(index) && !this.checkNotPlayer(index)) {
      GameState.char.position = index;
      this.gamePlay.deselectCell(GameState.char.position);
      GameState.char = null;
      GameState.moveArea = [];
      GameState.attackArea = [];
      this.changePlayer();
      this.gamePlay.redrawPositions(this.currentTeam.team);
      if (GameState.player === 'comp') this.contrAttack();
    // реализация атаки
    } else if (GameState.char && GameState.attackArea.includes(index) && this.checkNotPlayer(index)) {
      const attacker = GameState.char.character;
      const target = this.currentTeam.team.find((e) => e.position === index).character;
      const damage = +Math.max(attacker.attack - target.defence, attacker.attack * 0.1).toFixed(2);
      this.gamePlay.showDamage(index, damage).then((responce) => {
        target.health -= damage;
        if (target.health <= 0) {
          this.deleteCharByIndex(index);
          GameState.char = null;
        }
        this.changePlayer();
        GameState.char = null;
        this.gamePlay.redrawPositions(this.currentTeam.team);
        if (!this.currentTeam.team.some((e) => e.character.player === 'comp')) {
          this.checkWin();
        } else if (GameState.player === 'comp') this.contrAttack();
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
    if (char && this.checkIndex(index) && char.character.player !== GameState.player) {
      GamePlay.showError('Выберите другого персонажа!');
    }
  }

  onCellEnter(index) {
    const char = this.getChar(index);
    let message = '';
    if (this.checkIndex(index)) {
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
    if (!GameState.char && this.checkNotPlayer(index)) {
      this.gamePlay.setCursor(cursors.notallowed);
    }
    if (GameState.char) {
      if (GameState.moveArea.includes(index)
      && !this.currentTeam.team.some((e) => e.position === GameState.currentIndex)) {
        this.gamePlay.selectCell(index, 'green');
      }
      if (!GameState.moveArea.includes(index)) {
        this.gamePlay.selectCell(index, 'auto');
        this.gamePlay.setCursor(cursors.notallowed);
      }

      if(GameState.attackArea.includes(index) && this.checkNotPlayer(index)) {
        this.gamePlay.setCursor(cursors.crosshair);
        this.gamePlay.selectCell(index, 'red');
      };
    }
  }

  onCellLeave(index) {
    const char = this.getChar(index);
    this.gamePlay.setCursor(cursors.auto);
    if (this.checkIndex(index)) {
      this.gamePlay.hideCellTooltip(index);
    } else {
      this.gamePlay.deselectCell(GameState.currentIndex);
    }
    if (this.checkIndex(index) && char.character.player !== GameState.player) {
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
          this.deleteCharByIndex(ind);
        }
        this.gamePlay.redrawPositions(this.currentTeam.team);
        if (!this.currentTeam.team.some((e) => e.character.player === 'user')) {
          this.endGame();
        }
      });
    } else {
      let newPosition = 0;
      do { newPosition = GameState.moveArea[Math.floor(Math.random() * GameState.moveArea.length)]; }
      while (this.currentTeam.team.some((e) => e.position === newPosition));
      char.position = newPosition;
      this.gamePlay.redrawPositions(this.currentTeam.team);
    }

    this.changePlayer();
  }

  checkWin() {
    if (GameState.currentLevel === 4) {
      this.endGame();
    } else {
      this.addScore();
      this.currentTeam.levelUp();
      this.gamePlay.drawUi(themes(GameState.currentLevel));
      this.gamePlay.redrawPositions(this.currentTeam.team);
      GameState.player = 'user';
    }
  }

  endGame() {
    this.addScore();
    this.currentTeam.team = [];
    Array.from(document.querySelectorAll('.cell')).forEach((e) => {
      e.addEventListener('mouseenter', function () {
        this.outerHTML = this.outerHTML;
      }, false);
      e.addEventListener('mouseleave', function () {
        this.outerHTML = this.outerHTML;
      }, false);
      e.addEventListener('click', function () {
        this.outerHTML = this.outerHTML;
      }, false);
    });
  }

  addScore() {
    let score = 0;
    this.currentTeam.team.forEach((e) => {
      if (e.character.player === 'user') score += e.character.health;
      GameState.maxScore = Math.max(score, GameState.maxScore || score);
    });
  }

  newGame() {
    GameState.player = 'user';
    GameState.currentLevel = 1;
    this.gamePlay.drawUi(themes(GameState.currentLevel));
    this.currentTeam = new Team();
    this.gamePlay.redrawPositions(this.currentTeam.team);
  }

  saveGame() {
    const obj = {};
    GameState.team = this.currentTeam.team;
    Object.keys(GameState).forEach((key) => {
      obj[key] = GameState[key];
    });
    this.stateService.save(obj);
  }

  loadGame() {
    const obj = this.stateService.load();
    this.currentTeam.team = obj.team;
    GameState.player = obj.player;
    GameState.currentLevel = obj.currentLevel;
    GameState.maxScore = obj.maxScore;
    this.gamePlay.drawUi(themes(GameState.currentLevel));
    this.gamePlay.redrawPositions(this.currentTeam.team);
  }

  checkIndex(index) {
    return this.currentTeam.team.some((e) => e.position === index);
  }

  checkNotPlayer(index) {
    return this.currentTeam.team.some((e) => e.position === index && e.character.player !== GameState.player);
  }

  getChar(index) {
    return this.currentTeam.team[this.currentTeam.team.findIndex((e) => e.position === index)];
  }

  changePlayer() {
    GameState.player === 'user' ? GameState.player = 'comp' : GameState.player = 'user';
  }

  deleteCharByIndex(index) {
    this.currentTeam.team.splice(this.currentTeam.team.findIndex((e) => e.position === index), 1);
  }
}
