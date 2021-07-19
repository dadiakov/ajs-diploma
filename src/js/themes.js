export default function themes(level) {
  switch (level) {
    case 2: return 'desert';
    case 3: return 'arctic';
    case 4: return 'mountain';
    default: return 'prairie';
  }
}

// old code
// const themes = {
//   prairie: 'prairie',
//   desert: 'desert',
//   arctic: 'arctic',
//   mountain: 'mountain',
// };

// export default themes;
