/* eslint-disable linebreak-style */
test('фывв', () => {
  const level = 1;
  const attack = 10;
  const defence = 20;
  const health = 50;
  const message = `\u{1F396}${level}\u{2694}${attack}\u{1F6E1}${defence}\u{2764}${health}`;
  expect(message).toBe('🎖1⚔10🛡20❤50');
});
