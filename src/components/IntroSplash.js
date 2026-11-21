import { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text } from 'react-native';
import colors from '../theme/colors';

const SHOW_MS = 2000;
const FADE_MS = 350;

// Full-screen logo shown for ~2 seconds when the app opens, then fades out
// and calls onFinish. Drawn in JS so it also appears inside Expo Go, which
// always shows its own native splash instead of the app's.
export default function IntroSplash({ onFinish }) {
  const logoIn = useRef(new Animated.Value(0)).current;
  const screenOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(logoIn, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    const timer = setTimeout(() => {
      Animated.timing(screenOut, { toValue: 0, duration: FADE_MS, useNativeDriver: true }).start(
        () => onFinish && onFinish()
      );
    }, SHOW_MS);
    return () => clearTimeout(timer);
  }, [logoIn, screenOut, onFinish]);

  const scale = logoIn.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });

  return (
    <Animated.View style={[styles.root, { opacity: screenOut }]}>
      <Animated.View style={{ opacity: logoIn, transform: [{ scale }], alignItems: 'center' }}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.name}>Coral Vision</Text>
        <Text style={styles.tagline}>Coral species identification</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    elevation: 100,
    backgroundColor: colors.navy800,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 140, height: 140, borderRadius: 32 },
  name: { color: colors.white, fontSize: 26, fontWeight: '700', marginTop: 22 },
  tagline: { color: colors.skyMuted, fontSize: 14, marginTop: 6 },
});
