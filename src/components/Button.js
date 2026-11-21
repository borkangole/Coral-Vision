import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import colors from '../theme/colors';

// primary = coral (the one main action per screen), navy = secondary action,
// outline = tertiary, onDark = sits on the navy header.
const VARIANTS = {
  primary: { bg: colors.coral500, pressed: colors.coral600, text: colors.navy900, border: 'transparent' },
  navy: { bg: colors.navy700, pressed: colors.navy800, text: colors.white, border: 'transparent' },
  outline: { bg: 'transparent', pressed: 'rgba(21,51,98,0.08)', text: colors.navy700, border: colors.navy600 },
  onDark: { bg: 'rgba(255,255,255,0.12)', pressed: 'rgba(255,255,255,0.22)', text: colors.white, border: 'rgba(255,255,255,0.30)' },
};

export default function Button({ label, onPress, variant = 'primary', disabled, loading, compact, style }) {
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
        {
          backgroundColor: disabled ? colors.line : pressed ? v.pressed : v.bg,
          borderColor: disabled ? 'transparent' : v.border,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <Text
          style={[styles.label, compact && styles.labelCompact, { color: disabled ? colors.inkMuted : v.text }]}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  regular: { minHeight: 54, paddingHorizontal: 18, borderRadius: 16 },
  compact: { minHeight: 38, paddingHorizontal: 14, borderRadius: 12 },
  label: { fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
  labelCompact: { fontSize: 13 },
});
