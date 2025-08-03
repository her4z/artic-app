import { useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { View, Pressable, TouchableOpacity } from 'react-native';
import { useMemo } from 'react';
import ThemeSwitch from './ThemeSwitch';
import { Ionicons } from '@expo/vector-icons';
import ArticLogo from '../../assets/images/artic-logo.svg';
import { useUserPreferences } from '../hooks/useUserPreferences';

export const Header = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { effectiveTheme } = useUserPreferences();

  const isBookmarks = route.name === 'Bookmarks';
  const isDark = effectiveTheme === 'dark';

  // Memoize theme-dependent values
  const themeStyles = useMemo(
    () => ({
      container: isDark ? 'bg-dark-primary border-gray-700' : 'bg-light-primary border-gray-200',
      iconColor: isDark ? 'white' : 'black',
      logoColor: isDark ? 'white' : 'black',
    }),
    [isDark],
  );

  const handleBookmarksPress = () => {
    navigation.navigate('Bookmarks');
  };

  return (
    <View className={`flex-row w-full items-center border-b ${themeStyles.container}`}>
      <View className="flex-row p-5 items-center">
        <View className="flex-1">
          <ThemeSwitch />
        </View>

        <View className="flex-1" />

        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <ArticLogo height={72} width={72} color={themeStyles.logoColor} />
        </TouchableOpacity>

        <View className="flex-1" />

        <View className="flex-1 items-end">
          <Pressable onPress={handleBookmarksPress}>
            <Ionicons
              name={isBookmarks ? 'book' : 'book-outline'}
              size={28}
              color={themeStyles.iconColor}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default Header;
