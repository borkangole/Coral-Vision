import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IconButton from './IconButton';
import { color, gutter } from '../theme/tokens';
import { type } from '../theme/type';

// Page header for paper screens: controls row, then an editorial serif title.
export default function ScreenHeader({ eyebrow, title, subtitle, onBack, right }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }]}>
      <View style={styles.controls}>
        {onBack ? <IconButton name="back" label="Go back" onPress={onBack} /> : <View />}
        {right || <View />}
      </View>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={type.display} numberOfLines={2}>
        {title}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: gutter, paddingBottom: 20, backgroundColor: color.paper },
  controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 40, marginBottom: 20 },
  eyebrow: { ...type.label, marginBottom: 6 },
  subtitle: { ...type.small, marginTop: 6 },
});
