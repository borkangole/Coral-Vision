import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import AppNavigator from './src/navigation/AppNavigator';
import IntroSplash from './src/components/IntroSplash';
import { fontAssets } from './src/theme/type';
import { color } from './src/theme/tokens';

export default function App() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const ready = fontsLoaded || !!fontError;
  const [revealed, setRevealed] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const reveal = useCallback(() => setRevealed(true), []);
  const hideIntro = useCallback(() => setShowIntro(false), []);

  return (
    <View style={{ flex: 1, backgroundColor: color.paper }}>
      {/* The app mounts as the logo starts to fade, so it is in place underneath. */}
      {revealed ? <AppNavigator /> : null}
      {showIntro && <IntroSplash ready={ready} onReveal={reveal} onFinish={hideIntro} />}
    </View>
  );
}
