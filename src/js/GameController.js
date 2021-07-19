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

    this.currentTeam = new Team();

    this.gamePlay.redrawPositions(this.currentTeam.team);
    console.log(this.currentTeam);
    setTimeout(() => { this.currentTeam.levelUp(); console.log(this.currentTeam); this.gamePlay.redrawPositions(this.currentTeam.team); }, 2000);
    setTimeout(() => { this.currentTeam.levelUp(); console.log(this.currentTeam); this.gamePlay.redrawPositions(this.currentTeam.team); }, 5000);
    setTimeout(() => { this.currentTeam.levelUp(); console.log(this.currentTeam); this.gamePlay.redrawPositions(this.currentTeam.team); }, 7000);
  }

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }
}
