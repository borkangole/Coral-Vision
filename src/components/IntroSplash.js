import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { color } from '../theme/tokens';
import { font } from '../theme/type';

const MIN_SHOW_MS = 2000;
const FADE_MS = 320;

// Logo screen shown when the app opens. Stays at least 2 s and until the
// app is ready (fonts loaded), then fades out and calls onFinish.
export default function IntroSplash({ ready, onReveal, onFinish }) {
  const enter = useRef(new Animated.Value(0)).current;
  const exit = useRef(new Animated.Value(1)).current;
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 600,
      easing: Easing.bezier(0.23, 1, 0.32, 1),
      useNativeDriver: true,
    }).start();
    const timer = setTimeout(() => setMinElapsed(true), MIN_SHOW_MS);
    return () => clearTimeout(timer);
  }, [enter]);

  useEffect(() => {
    if (!ready || !minElapsed) return;
    if (onReveal) onReveal();
    Animated.timing(exit, { toValue: 0, duration: FADE_MS, useNativeDriver: true }).start(() => onFinish && onFinish());
  }, [ready, minElapsed, exit, onFinish, onReveal]);

  const rise = enter.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });

  return (
    <Animated.View style={[styles.root, { opacity: exit }]}>
      <StatusBar style="light" />
      <Animated.View style={{ alignItems: 'center', opacity: enter, transform: [{ translateY: rise }] }}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={[styles.name, !ready && styles.fallback]}>Coral Vision</Text>
        <Text style={[styles.tagline, !ready && styles.fallbackSans]}>REEF SPECIES FIELD GUIDE</Text>
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
    backgroundColor: color.abyss,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 104, height: 104, borderRadius: 26 },
  name: { fontFamily: font.serif, fontSize: 36, color: color.onAbyss, marginTop: 24, letterSpacing: -0.4 },
  tagline: { fontFamily: font.sansSemi, fontSize: 11, letterSpacing: 2, color: color.onAbyss3, marginTop: 8 },
  // Before the custom fonts are ready, fall back to the system font.
  fallback: { fontFamily: undefined, fontWeight: '600', fontSize: 30 },
  fallbackSans: { fontFamily: undefined, fontWeight: '600' },
});
