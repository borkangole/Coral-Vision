import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { color } from '../theme/tokens';
import { type } from '../theme/type';

const STEPS = ['Reading the photo', 'Comparing species', 'Pulling the profile'];
const SIZE = 92;

// Quiet "identifying" state: the logo inside a slowly turning coral arc,
// with a caption that steps through the work being done.
export default function LogoLoader() {
  const spin = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;
  const [step, setStep] = useState(0);

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: true })
    );
    const breatheLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    spinLoop.start();
    breatheLoop.start();
    const timer = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 1000);
    return () => {
      spinLoop.stop();
      breatheLoop.stop();
      clearInterval(timer);
    };
  }, [spin, breathe]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const scale = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1.02] });

  return (
    <View style={styles.wrap}>
      <View style={styles.stage}>
        <View style={styles.track} />
        <Animated.View style={[styles.arc, { transform: [{ rotate }] }]} />
        <Animated.Image source={require('../../assets/logo.png')} style={[styles.logo, { transform: [{ scale }] }]} />
      </View>
      <Text style={[type.heading, { marginTop: 20 }]}>Identifying</Text>
      <Text style={[type.small, { color: color.ink3, marginTop: 3 }]}>{STEPS[step]}…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 36 },
  stage: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  track: { position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: 2, borderColor: color.hair },
  arc: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: color.coral,
  },
  logo: { width: 64, height: 64, borderRadius: 16 },
});
