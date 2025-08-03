import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import ArtworkDetailScreen from '../screens/ArtworkDetailScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import { Artwork } from '../types/artwork';

export type RootStackParamList = {
  Home: undefined;
  Bookmarks: undefined;
  ArtworkDetail: { artwork: Artwork };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ animation: 'slide_from_left' }}
        />
        <Stack.Screen
          name="Bookmarks"
          component={BookmarksScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="ArtworkDetail"
          component={ArtworkDetailScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
