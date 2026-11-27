import { View, Text, Pressable, StyleSheet } from 'react-native';
import { color, radius } from '../theme/tokens';
import { type } from '../theme/type';

// A labelled group: small-caps label (with an optional action) above a card.
// flush = no inner padding (lists); bare = no card at all.
export default function Group({ label, action, note, children, flush, bare, style }) {
  return (
    <View style={[styles.wrap, style]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={type.label}>{label}</Text>
          {action ? (
            <Pressable onPress={action.onPress} hitSlop={10}>
              {({ pressed }) => (
                <Text style={[styles.action, pressed && { opacity: 0.6 }]}>{action.label}</Text>
              )}
            </Pressable>
          ) : note ? (
            <Text style={styles.note}>{note}</Text>
          ) : null}
        </View>
      ) : null}
      {bare ? children : <View style={[styles.card, flush && styles.flush]}>{children}</View>}
    </View>
  );
}

export const cardStyle = {
  backgroundColor: color.surface,
  borderRadius: radius.md,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: color.hairStrong,
};

const styles = StyleSheet.create({
  wrap: { marginBottom: 28 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingHorizontal: 4 },
  action: { ...type.smallMedium, color: color.coralPressed },
  note: { ...type.small, color: color.ink3 },
  card: { ...cardStyle, padding: 16 },
  flush: { padding: 0, overflow: 'hidden' },
});
