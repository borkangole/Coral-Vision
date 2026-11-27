// Coral Vision design tokens.
// A field guide and a dive log: warm sand-white paper, deep-ocean ink, and a
// single coral accent reserved for the main action and the top match.

export const color = {
  // Paper (light screens)
  paper: '#F4F2ED', // page: bleached sand
  surface: '#FFFFFF', // cards
  sunken: '#EAE7E0', // tracks, wells, thumbnails while loading

  // Ink (text on paper), four levels
  ink: '#0B1B33', // primary: deep water
  ink2: '#45516A', // secondary
  ink3: '#7D8698', // metadata
  ink4: '#A9B0BD', // disabled, chevrons

  hair: 'rgba(11,27,51,0.08)', // card edges, separators
  hairStrong: 'rgba(11,27,51,0.14)',

  // Abyss (dark screens: capture, hero, splash)
  abyss: '#0A1830',
  abyss2: '#12264A',
  onAbyss: '#FFFFFF',
  onAbyss2: 'rgba(255,255,255,0.66)',
  onAbyss3: 'rgba(255,255,255,0.38)',
  glass: 'rgba(255,255,255,0.12)',
  glassPressed: 'rgba(255,255,255,0.2)',
  scrim: 'rgba(10,24,48,0.42)',

  // The one accent
  coral: '#E46F64',
  coralPressed: '#D25E53',
  coralSoft: '#FBE6E3',

  // Semantic
  kelp: '#2D7A57',
  kelpSoft: '#E2F0E8',
  amber: '#A8701A',
  amberSoft: '#F7ECD8',
  alert: '#B23A33',
  alertSoft: '#F8E3E0',
};

export const radius = { sm: 10, md: 16, lg: 24, pill: 999 };

// 4-pt grid
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, xxxl: 40 };
export const gutter = 20;
