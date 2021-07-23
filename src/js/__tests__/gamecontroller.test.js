/* eslint-disable prefer-destructuring *//* eslint-disable linebreak-style */
import GamePlay from '../GamePlay';
import GameController from '../GameController';
import GameStateService from '../GameStateService';
import PositionedCharacter from '../PositionedCharacter';
import Bowman from '../Bowman';
import Daemon from '../Daemon';
import GameState from '../GameState';

let gamePlay;
let stateService;
let gameCtrl;

beforeEach(() => {
  const container = document.createElement('div');
  container.setAttribute('id', 'game-container');
  gamePlay = new GamePlay();
  gamePlay.bindToDOM(container);
  stateService = new GameStateService(localStorage);
  gameCtrl = new GameController(gamePlay, stateService);

  gameCtrl.init();
  gameCtrl.currentTeam.team = [
    new PositionedCharacter(new Bowman(1), 0),
    new PositionedCharacter(new Daemon(1), 1),
    new PositionedCharacter(new Bowman(1), 2),
  ];
  jest.resetAllMocks();
});

test('Наведение на другого персонажа', () => {
  GameState.char = gameCtrl.currentTeam.team[0];
  GameState.attackArea = [1];
  GameState.moveArea = [8];
  gameCtrl.gamePlay.selectCell = jest.fn();
  gameCtrl.gamePlay.setCursor = jest.fn();
  gameCtrl.onCellEnter(2);
  expect(gameCtrl.gamePlay.selectCell).toHaveBeenCalledWith(2, 'auto');
  expect(gameCtrl.gamePlay.setCursor).toHaveBeenCalledWith('pointer');
});

test('Выбор другого персонажа', () => {
  GameState.char = gameCtrl.currentTeam.team[0];
  GameState.attackArea = [1];
  GameState.moveArea = [8];
  gameCtrl.gamePlay.selectCell = jest.fn();
  gameCtrl.gamePlay.setCursor = jest.fn();
  gameCtrl.onCellClick(2);
  expect(gameCtrl.gamePlay.selectCell).toHaveBeenCalledWith(2);
});

test('Переход на другую клетку', () => {
  GameState.char = gameCtrl.currentTeam.team[0];
  GameState.attackArea = [1];
  GameState.moveArea = [8];
  gameCtrl.onCellClick(8);
  expect(gameCtrl.currentTeam.team[0].position).toBe(8);
});

test('Проверка отображения атаки', () => {
  GameState.char = gameCtrl.currentTeam.team[0];
  GameState.attackArea = [1];
  GameState.moveArea = [8];
  gameCtrl.gamePlay.selectCell = jest.fn();
  gameCtrl.gamePlay.setCursor = jest.fn();
  gameCtrl.onCellEnter(1);
  expect(gameCtrl.gamePlay.selectCell).toHaveBeenCalledWith(1, 'red');
  expect(gameCtrl.gamePlay.setCursor).toHaveBeenCalledWith('crosshair');
});

test('Недопустимое действие', () => {
  GameState.char = gameCtrl.currentTeam.team[0];
  GameState.attackArea = [1];
  GameState.moveArea = [8];
  gameCtrl.gamePlay.selectCell = jest.fn();
  gameCtrl.gamePlay.setCursor = jest.fn();
  gameCtrl.onCellEnter(9);
  expect(gameCtrl.gamePlay.selectCell).toHaveBeenCalledWith(9, 'auto');
  expect(gameCtrl.gamePlay.setCursor).toHaveBeenCalledWith('not-allowed');
});

test('Проверка тегиронного шаблона', () => {
  GameState.char = gameCtrl.currentTeam.team[0];
  gameCtrl.gamePlay.showCellTooltip = jest.fn();
  gameCtrl.onCellEnter(0);
  expect(gameCtrl.gamePlay.showCellTooltip).toHaveBeenCalledWith('🎖1⚔25🛡25❤50', 0);
});

jest.mock('../GameStateService');

test('should be ok', () => {
  gameCtrl.stateService.load.mockReturnValue(
    {
      team: [
        new PositionedCharacter(new Bowman(1), 0),
        new PositionedCharacter(new Daemon(1), 1),
        new PositionedCharacter(new Bowman(1), 2),
      ],
      player: 'user',
      currentLevel: 1,
      maxScore: 300,
    },
  );
  expect(() => gameCtrl.loadGame()).not.toThrow();
});

test('should to throw', () => {
  gameCtrl.stateService.load.mockReturnValue({});
  expect(() => gameCtrl.loadGame()).toThrow();
});
