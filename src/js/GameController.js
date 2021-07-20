/* eslint-disable max-len */
import themes from './themes';
import Team from './Team';
import GamePlay from './GamePlay';
import GameState from './GameState';

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

    this.gamePlay.redrawPositions(this.currentTeam.team);

    console.log(this.currentTeam);

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  onCellClick(index) {
    if (this.currentTeam.indexArray.includes(index) && this.currentTeam.team[this.currentTeam.indexArray.indexOf(index)].character.player === 'user') {
      this.gamePlay.deselectCell(GameState.currentIndex);
      this.gamePlay.selectCell(index);
      GameState.currentIndex = index;
    } else {
      this.gamePlay.deselectCell(GameState.currentIndex);
    }
    if (this.currentTeam.indexArray.includes(index) && this.currentTeam.team[this.currentTeam.indexArray.indexOf(index)].character.player === 'comp') {
      GamePlay.showError('Выберите другого персонажа!');
    }
  }

  onCellEnter(index) {
    let message = '';
    if (this.currentTeam.indexArray.includes(index)) {
      const {
        level, attack, defence, health,
      } = this.currentTeam.team[this.currentTeam.indexArray.indexOf(index)].character;
      message = `\u{1F396}${level}\u{2694}${attack}\u{1F6E1}${defence}\u{2764}${health}`;
      this.gamePlay.showCellTooltip(message, index);
    }
  }

  onCellLeave(index) {
    if (this.currentTeam.indexArray.includes(index)) {
      this.gamePlay.hideCellTooltip(index);
    }
  }
}
