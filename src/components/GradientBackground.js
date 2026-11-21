import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

// Fills its parent with the app icon's diagonal gradient. Built on
// react-native-svg (already installed for the QR codes) so it needs no new
// native module. `id` must be unique per screen if two gradients are mounted
// at once.
export default function GradientBackground({ id = 'bg', from, to }) {
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={from} />
          <Stop offset="1" stopColor={to} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
