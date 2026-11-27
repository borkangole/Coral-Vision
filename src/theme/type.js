import { color } from './tokens';

// Instrument Serif for names (field-guide voice), Instrument Sans for UI.
// Custom families carry their own weight, so fontWeight is never set.
export const font = {
  sans: 'InstrumentSans_400Regular',
  sansMedium: 'InstrumentSans_500Medium',
  sansSemi: 'InstrumentSans_600SemiBold',
  serif: 'InstrumentSerif_400Regular',
  serifItalic: 'InstrumentSerif_400Regular_Italic',
};

export const type = {
  display: { fontFamily: font.serif, fontSize: 40, lineHeight: 44, letterSpacing: -0.6, color: color.ink },
  title: { fontFamily: font.sansSemi, fontSize: 26, lineHeight: 31, letterSpacing: -0.6, color: color.ink },
  heading: { fontFamily: font.sansSemi, fontSize: 17, lineHeight: 22, letterSpacing: -0.2, color: color.ink },
  body: { fontFamily: font.sans, fontSize: 15, lineHeight: 22, color: color.ink },
  bodyMedium: { fontFamily: font.sansMedium, fontSize: 15, lineHeight: 20, letterSpacing: -0.1, color: color.ink },
  small: { fontFamily: font.sans, fontSize: 13, lineHeight: 18, color: color.ink2 },
  smallMedium: { fontFamily: font.sansMedium, fontSize: 13, lineHeight: 18, color: color.ink2 },
  label: { fontFamily: font.sansSemi, fontSize: 11, lineHeight: 14, letterSpacing: 1.3, textTransform: 'uppercase', color: color.ink3 },
  binomial: { fontFamily: font.serifItalic, color: color.ink2 },
  numeric: { fontVariant: ['tabular-nums'] },
};

export const fontAssets = {
  InstrumentSans_400Regular: require('../../assets/fonts/InstrumentSans_400Regular.ttf'),
  InstrumentSans_500Medium: require('../../assets/fonts/InstrumentSans_500Medium.ttf'),
  InstrumentSans_600SemiBold: require('../../assets/fonts/InstrumentSans_600SemiBold.ttf'),
  InstrumentSerif_400Regular: require('../../assets/fonts/InstrumentSerif_400Regular.ttf'),
  InstrumentSerif_400Regular_Italic: require('../../assets/fonts/InstrumentSerif_400Regular_Italic.ttf'),
};
