import { Pressable, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import Icon from './Icon';
import { color, radius } from '../theme/tokens';
import { font } from '../theme/type';

// primary = ink (default action) · accent = coral (the one key action per
// screen) · quiet = tonal, on paper · glass = on dark screens.
const VARIANTS = {
  primary: { bg: color.ink, pressed: '#162B4D', text: color.surface },
  accent: { bg: color.coral, pressed: color.coralPressed, text: color.abyss },
  quiet: { bg: color.sunken, pressed: '#E0DCD3', text: color.ink },
  glass: { bg: color.glass, pressed: color.glassPressed, text: color.onAbyss },
};

export default function Button({ label, onPress, variant = 'primary', icon, disabled, loading, compact, style }) {
  const v = VARIANTS[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      style={({ pressed }) => [
        styles.base,
        compact ? styles.compact : styles.regular,
        { backgroundColor: pressed ? v.pressed : v.bg, opacity: disabled ? 0.4 : 1 },
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon name={icon} size={compact ? 16 : 19} color={v.text} /> : null}
          <Text style={[styles.label, compact && styles.labelCompact, { color: v.text }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  regular: { height: 54, borderRadius: 15, paddingHorizontal: 20 },
  compact: { height: 38, borderRadius: 11, paddingHorizontal: 14 },
  pressed: { transform: [{ scale: 0.98 }] },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontFamily: font.sansSemi, fontSize: 16, letterSpacing: -0.1 },
  labelCompact: { fontSize: 14 },
});
