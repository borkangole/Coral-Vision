import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import IntroSplash from './src/components/IntroSplash';
import colors from './src/theme/colors';

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const hideIntro = useCallback(() => setShowIntro(false), []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.navy800 }}>
      {/* The app loads underneath so it's ready the moment the logo fades. */}
      <AppNavigator />
      {showIntro && <IntroSplash onFinish={hideIntro} />}
      <StatusBar style="light" />
    </View>
  );
}
