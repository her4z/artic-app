import { SafeAreaView, View } from 'react-native';
import { useState, useMemo, useCallback } from 'react';
import { useUserPreferences } from '../hooks/useUserPreferences';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import ArtworkCardList from '../components/ArtworkCardList';

const BookmarksScreen = () => {
  const { effectiveTheme, bookmarkedArtworks } = useUserPreferences();
  const [searchQuery, setSearchQuery] = useState('');

  const isDark = effectiveTheme === 'dark';

  // Memoize theme-dependent styles
  const themeStyles = useMemo(
    () => ({
      container: isDark ? 'bg-dark-primary' : 'bg-light-primary',
    }),
    [isDark],
  );

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Memoize filtered bookmarked artworks based on search query
  const filteredBookmarks = useMemo(() => {
    if (!searchQuery.trim()) return bookmarkedArtworks;

    const query = searchQuery.toLowerCase().trim();
    return bookmarkedArtworks.filter((artwork) => {
      const title = artwork.title?.toLowerCase() || '';
      const artist = artwork.artist_title?.toLowerCase() || '';
      const description = artwork.description?.toLowerCase() || '';

      return title.includes(query) || artist.includes(query) || description.includes(query);
    });
  }, [bookmarkedArtworks, searchQuery]);

  return (
    <SafeAreaView className={`flex-1 ${themeStyles.container}`}>
      <Header />

      <View className="px-4 mt-4">
        <SearchBar
          placeholder="Search bookmarks..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearch={handleSearch}
          onClear={handleClearSearch}
        />
      </View>

      <View className="flex-1 mt-4">
        <ArtworkCardList artworks={filteredBookmarks} isBookmarks />
      </View>
    </SafeAreaView>
  );
};

export default BookmarksScreen;
