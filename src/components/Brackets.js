import { View, StyleSheet } from 'react-native';
import { color as palette } from '../theme/tokens';

// Viewfinder corner brackets, taken from the logo.
export default function Brackets({ color = palette.onAbyss3, size = 22, thickness = 2, inset = 16, radius = 6 }) {
  const corner = { position: 'absolute', width: size, height: size, borderColor: color };
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[corner, { top: inset, left: inset, borderTopWidth: thickness, borderLeftWidth: thickness, borderTopLeftRadius: radius }]} />
      <View style={[corner, { top: inset, right: inset, borderTopWidth: thickness, borderRightWidth: thickness, borderTopRightRadius: radius }]} />
      <View style={[corner, { bottom: inset, left: inset, borderBottomWidth: thickness, borderLeftWidth: thickness, borderBottomLeftRadius: radius }]} />
      <View style={[corner, { bottom: inset, right: inset, borderBottomWidth: thickness, borderRightWidth: thickness, borderBottomRightRadius: radius }]} />
    </View>
  );
}
