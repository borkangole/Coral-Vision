import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CaptureScreen from '../screens/CaptureScreen';
import ResultScreen from '../screens/ResultScreen';
import DashboardScreen from '../screens/DashboardScreen';
import HistoryScreen from '../screens/HistoryScreen';
import HistoryDetailScreen from '../screens/HistoryDetailScreen';
import MapScreen from '../screens/MapScreen';
import { color } from '../theme/tokens';

const Stack = createNativeStackNavigator();

const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: color.paper } };

// Every screen draws its own header, so the native header is off.
export default function AppNavigator() {
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.paper } }}
      >
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Capture" component={CaptureScreen} options={{ contentStyle: { backgroundColor: color.abyss } }} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="HistoryDetail" component={HistoryDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
