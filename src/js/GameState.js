export default class GameState {
  static from(object) {
    this.player = object.player;
    this.currentIndex = object.index;
    return null;
  }
}
