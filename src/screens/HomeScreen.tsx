import { debounce } from 'lodash';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { useState, useMemo, useCallback } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import ArtworkCardList from '../components/ArtworkCardList';
import { useUserPreferences } from '../hooks/useUserPreferences';

const HomeScreen = () => {
  const { effectiveTheme } = useUserPreferences();
  const [searchQuery, setSearchQuery] = useState('');

  const isDark = effectiveTheme === 'dark';

  // Memoize theme-dependent styles
  const themeStyles = useMemo(
    () => ({
      container: isDark ? 'bg-dark-primary' : 'bg-light-primary',
    }),
    [isDark],
  );

  // Memoize debounced search function
  const debouncedSetSearchQuery = useMemo(() => debounce(setSearchQuery, 500), []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  return (
    <SafeAreaView className={`flex-1 ${themeStyles.container}`}>
      <Header />

      <View className="px-4 mt-4">
        <SearchBar
          placeholder="Search artworks..."
          value={searchQuery}
          onChangeText={debouncedSetSearchQuery}
          onSearch={handleSearch}
          onClear={handleClearSearch}
        />
      </View>

      <View className="flex-1 mt-4">
        <ArtworkCardList searchQuery={searchQuery} />
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
