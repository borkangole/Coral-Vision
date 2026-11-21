import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';

// Flat navy header that runs up under the status bar. Kept deliberately
// plain: one colour, a title, an optional subtitle, optional back/right.
export default function ScreenHeader({ title, subtitle, subtitleItalic, onBack, leading, right }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 10 }]}>
      <View style={styles.row}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={10}
            style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <View style={styles.chevron} />
          </Pressable>
        ) : null}

        {leading}

        <View style={styles.titles}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, subtitleItalic && styles.italic]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.navy700,
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPressed: { backgroundColor: 'rgba(255,255,255,0.24)' },
  chevron: {
    width: 10,
    height: 10,
    borderLeftWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: colors.white,
    transform: [{ rotate: '45deg' }],
    marginLeft: 4,
  },
  titles: { flex: 1 },
  title: { color: colors.white, fontSize: 22, fontWeight: '700' },
  subtitle: { color: colors.skyMuted, fontSize: 13, marginTop: 2 },
  italic: { fontStyle: 'italic' },
});
