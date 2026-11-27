import { Pressable, StyleSheet } from 'react-native';
import Icon from './Icon';
import { color } from '../theme/tokens';

// 40-pt round control. paper = on light screens, glass = on dark screens,
// scrim = over photos and maps.
const VARIANTS = {
  paper: { bg: color.surface, pressed: color.sunken, icon: color.ink, border: color.hair },
  glass: { bg: color.glass, pressed: color.glassPressed, icon: color.onAbyss, border: 'transparent' },
  scrim: { bg: color.scrim, pressed: 'rgba(10,24,48,0.6)', icon: color.onAbyss, border: 'transparent' },
};

export default function IconButton({ name, onPress, variant = 'paper', label, style }) {
  const v = VARIANTS[variant];
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: pressed ? v.pressed : v.bg, borderColor: v.border },
        variant === 'paper' && styles.lift,
        pressed && { transform: [{ scale: 0.96 }] },
        style,
      ]}
    >
      <Icon name={name} size={20} color={v.icon} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  lift: {
    shadowColor: '#0B1B33',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
});
