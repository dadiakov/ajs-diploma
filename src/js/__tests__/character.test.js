/* eslint-disable linebreak-style */
import Bowman from '../Bowman';
import Character from '../Character';

test('new Character to throw', () => {
  expect(() => new Character(1, 'bowman')).toThrow();
  expect(() => new Bowman(1)).not.toThrow();
});
