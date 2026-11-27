import { View, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Brackets from './Brackets';
import IconButton from './IconButton';
import { color, radius } from '../theme/tokens';

export const HERO_HEIGHT = 380;

// Full-bleed photo at the top of a result, with a floating back button.
// Children render over the photo (e.g. the scanning line).
export default function PhotoHero({ uri, onBack, children }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.hero}>
      {uri ? <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : null}
      <View style={styles.topShade} pointerEvents="none" />
      {children}
      {/* Viewfinder frame sits below the back button and above the sheet */}
      <View style={[styles.frame, { top: insets.top + 60 }]} pointerEvents="none">
        <Brackets color="rgba(255,255,255,0.85)" size={24} inset={0} />
      </View>
      <IconButton
        name="back"
        variant="scrim"
        label="Go back"
        onPress={onBack}
        style={{ position: 'absolute', top: insets.top + 8, left: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: HERO_HEIGHT, backgroundColor: color.abyss2, overflow: 'hidden' },
  frame: { position: 'absolute', left: 20, right: 20, bottom: radius.lg + 20 },
  topShade: { position: 'absolute', top: 0, left: 0, right: 0, height: 120, backgroundColor: 'rgba(10,24,48,0.18)' },
});
