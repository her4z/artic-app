import { useUserPreferences } from '../hooks/useUserPreferences';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, ScrollView } from 'react-native';
import { useMemo } from 'react';
import ArtworkCard from '../components/ArtworkCard';
import Header from '../components/Header';

type ArtworkDetailRouteProp = RouteProp<RootStackParamList, 'ArtworkDetail'>;

const ArtworkDetailScreen = () => {
  const route = useRoute<ArtworkDetailRouteProp>();
  const { artwork } = route.params;
  const { effectiveTheme } = useUserPreferences();

  const isDark = effectiveTheme === 'dark';

  // Memoize theme-dependent styles
  const themeStyles = useMemo(
    () => ({
      container: isDark ? 'bg-dark-primary' : 'bg-light-primary',
      text: isDark ? 'text-dark-text-primary' : 'text-light-text-primary',
    }),
    [isDark],
  );

  // Memoize cleaned description text
  const cleanedDescription = useMemo(() => {
    if (!artwork.description) return 'No description available.';
    return artwork.description.replace(/<[^>]*>?/g, '');
  }, [artwork.description]);

  return (
    <SafeAreaView className={`flex-1 ${themeStyles.container} items-center`}>
      <Header />
      <ScrollView
        className="flex-1 mt-12"
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <ArtworkCard artwork={artwork} aspectRatio={0.65} width="w-5/6" />

        <Text className={`text-left text-xl font-playfair px-4 mt-4 underline ${themeStyles.text}`}>
          About the artwork:
        </Text>

        <Text className={`text-left text-md font-playfair px-4 mt-4 ${themeStyles.text}`}>
          {cleanedDescription}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ArtworkDetailScreen;
