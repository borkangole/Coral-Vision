import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import colors from '../theme/colors';

const STEPS = ['Scanning image', 'Matching species', 'Retrieving profile'];

// Animated "analyzing" state: the logo breathes inside a spinning coral ring
// with a soft pulse wave behind it, and the caption cycles through steps.
export default function LogoLoader() {
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const wave = useRef(new Animated.Value(0)).current;
  const [step, setStep] = useState(0);

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1100, easing: Easing.linear, useNativeDriver: true })
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 650, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 650, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    const waveLoop = Animated.loop(
      Animated.timing(wave, { toValue: 1, duration: 1600, easing: Easing.out(Easing.quad), useNativeDriver: true })
    );
    spinLoop.start();
    pulseLoop.start();
    waveLoop.start();
    const timer = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 900);
    return () => {
      spinLoop.stop();
      pulseLoop.stop();
      waveLoop.stop();
      clearInterval(timer);
    };
  }, [spin, pulse, wave]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const logoScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.04] });
  const waveScale = wave.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.5] });
  const waveOpacity = wave.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });

  return (
    <View style={styles.wrap}>
      <View style={styles.stage}>
        <Animated.View style={[styles.wave, { opacity: waveOpacity, transform: [{ scale: waveScale }] }]} />
        <Animated.View style={[styles.ring, { transform: [{ rotate }] }]} />
        <Animated.Image
          source={require('../../assets/logo.png')}
          style={[styles.logo, { transform: [{ scale: logoScale }] }]}
        />
      </View>
      <Text style={styles.title}>Analyzing coral</Text>
      <Text style={styles.step}>{STEPS[step]}…</Text>
    </View>
  );
}

const SIZE = 148;

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 28 },
  stage: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  wave: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.coral500,
  },
  ring: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 3,
    borderColor: 'rgba(242,139,130,0.18)',
    borderTopColor: colors.coral500,
    borderRightColor: colors.coral500,
  },
  logo: { width: 104, height: 104, borderRadius: 26 },
  title: { marginTop: 20, fontSize: 17, fontWeight: '700', color: colors.ink },
  step: { marginTop: 4, fontSize: 14, color: colors.inkMuted },
});
