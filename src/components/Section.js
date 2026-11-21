import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';

// Plain white card with an optional title.
export default function Section({ title, children, style }) {
  return (
    <View style={[styles.card, style]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    marginBottom: 12,
  },
  title: { fontSize: 15, fontWeight: '700', color: colors.ink, marginBottom: 12 },
});
