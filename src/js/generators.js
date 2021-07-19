/* eslint-disable max-len */
/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  yield new allowedTypes[Math.floor(Math.random() * allowedTypes.length)](Math.floor(Math.random() * maxLevel - 0.01) + 1);
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const team = [];
  for (let i = 0; i < characterCount; i += 1) {
    const generator = characterGenerator(allowedTypes, maxLevel);
    team.push(generator.next().value);
  }
  return team;
}
