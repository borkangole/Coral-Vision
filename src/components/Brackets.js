import { View, StyleSheet } from 'react-native';
import colors from '../theme/colors';

// The four viewfinder corners from the app icon. Overlay it on any
// position:relative container.
export default function Brackets({
  color = colors.bracket,
  size = 26,
  thickness = 3,
  inset = 14,
  radius = 4,
}) {
  const base = { position: 'absolute', width: size, height: size, borderColor: color };
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View
        style={[base, { top: inset, left: inset, borderTopWidth: thickness, borderLeftWidth: thickness, borderTopLeftRadius: radius }]}
      />
      <View
        style={[base, { top: inset, right: inset, borderTopWidth: thickness, borderRightWidth: thickness, borderTopRightRadius: radius }]}
      />
      <View
        style={[base, { bottom: inset, left: inset, borderBottomWidth: thickness, borderLeftWidth: thickness, borderBottomLeftRadius: radius }]}
      />
      <View
        style={[base, { bottom: inset, right: inset, borderBottomWidth: thickness, borderRightWidth: thickness, borderBottomRightRadius: radius }]}
      />
    </View>
  );
}
