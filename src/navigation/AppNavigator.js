import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CaptureScreen from '../screens/CaptureScreen';
import ResultScreen from '../screens/ResultScreen';
import DashboardScreen from '../screens/DashboardScreen';
import HistoryScreen from '../screens/HistoryScreen';
import HistoryDetailScreen from '../screens/HistoryDetailScreen';
import MapScreen from '../screens/MapScreen';
import colors from '../theme/colors';

const Stack = createNativeStackNavigator();

// Every screen draws its own navy header (components/ScreenHeader) so the
// gradient can run under the status bar; the native header is switched off.
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.mist },
        }}
      >
        <Stack.Screen name="Capture" component={CaptureScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="HistoryDetail" component={HistoryDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
