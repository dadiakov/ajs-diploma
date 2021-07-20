/* eslint-disable max-len */
import themes from './themes';
import Team from './Team';

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
    

    // this.gamePlay.addCellLeaveListener(this.onCellEnter);
    // this.gamePlay.addCellClickListener(this.onCellEnter);

    this.currentTeam = new Team();

    this.gamePlay.redrawPositions(this.currentTeam.team);

    console.log(this.currentTeam);

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    // setTimeout(() => { this.currentTeam.levelUp(); console.log(this.currentTeam); this.gamePlay.redrawPositions(this.currentTeam.team); }, 2000);
    // setTimeout(() => { this.currentTeam.levelUp(); console.log(this.currentTeam); this.gamePlay.redrawPositions(this.currentTeam.team); }, 5000);
    // setTimeout(() => { this.currentTeam.levelUp(); console.log(this.currentTeam); this.gamePlay.redrawPositions(this.currentTeam.team); }, 7000);
  }

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
    let message = '';
    if(this.currentTeam.indexArray.includes(index)) {
      let {level, attack, defence, health} = this.currentTeam.team[this.currentTeam.indexArray.indexOf(index)].character;
      message = '\u{1F396}' + level + '\u{2694}' + attack + '\u{1F6E1}' + defence + '\u{2764}' + health;
      this.gamePlay.showCellTooltip(message, index);
    }
  }

  onCellLeave(index) {
    if(this.currentTeam.indexArray.includes(index)) {
      this.gamePlay.hideCellTooltip(index);
    }
  }
}
