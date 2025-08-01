import './global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UserPreferencesProvider } from './src/context/UserPreferencesContext';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { configureNotifications } from './src/services/notifications';
import Navigation from './src/navigation';
import StatusBar from './src/components/StatusBar';
import { View, Text } from 'react-native';

const AppContent = () => (
  <SafeAreaProvider>
    <StatusBar />
    <Navigation />
  </SafeAreaProvider>
);

const LoadingScreen = () => (
  <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
    <Text className="text-gray-600 dark:text-gray-300">Loading...</Text>
  </View>
);

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay: require('./assets/fonts/PlayfairDisplay-VariableFont_wght.ttf'),
    'PlayfairDisplay-Italic': require('./assets/fonts/PlayfairDisplay-Italic-VariableFont_wght.ttf'),
  });

  // Configure notifications on app start
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        await configureNotifications();
      } catch (error) {
        console.warn('Failed to configure notifications:', error);
      }
    };

    setupNotifications();
  }, []);

  // Show loading screen while fonts are loading
  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  // Show error screen if font loading failed
  if (fontError) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Text className="text-red-600 dark:text-red-400">Failed to load fonts</Text>
      </View>
    );
  }

  return (
    <UserPreferencesProvider>
      <AppContent />
    </UserPreferencesProvider>
  );
}
