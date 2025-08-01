import { getArtworks } from '../api/artworks';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl, Text } from 'react-native';
import ArtworkCard from './ArtworkCard';
import { Artwork } from '../types/artwork';
import { useUserPreferences } from '../hooks/useUserPreferences';

interface ArtworkCardListProps {
  searchQuery?: string;
  artworks?: Artwork[]; // For BookmarksScreen to pass saved artworks
  isBookmarks?: boolean; // Flag to indicate if this is for bookmarks
}

const ArtworkCardList = ({
  searchQuery = '',
  artworks: propArtworks,
  isBookmarks = false,
}: ArtworkCardListProps) => {
  const { effectiveTheme } = useUserPreferences();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isDark = effectiveTheme === 'dark';

  // If artworks are provided as props (for bookmarks), use them directly
  const displayArtworks = useMemo(
    () => (isBookmarks ? propArtworks || [] : artworks),
    [isBookmarks, propArtworks, artworks],
  );

  // Memoize theme-dependent styles
  const themeStyles = useMemo(
    () => ({
      activityColor: isDark ? '#cccccc' : '#000000',
      refreshColors: isDark ? ['#cccccc', '#ffffff'] : ['#000000', '#666666'],
      refreshBackground: isDark ? '#333333' : '#f0f0f0',
      emptyText: isDark ? 'text-gray-400' : 'text-gray-600',
    }),
    [isDark],
  );

  const fetchArtworks = useCallback(
    async (page: number = 1, isRefresh: boolean = false, query?: string) => {
      if (isBookmarks) return; // Don't fetch for bookmarks screen

      setError(null);

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const res = await getArtworks(page, 10, query);

        if (isRefresh) {
          setArtworks(res.data);
          setCurrentPage(1);
        } else {
          setArtworks((prev) => [...prev, ...res.data]);
          setCurrentPage(page);
        }

        setHasMoreData(page < res.pagination.total_pages);
      } catch (err) {
        console.error('Error fetching artworks:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch artworks');
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [isBookmarks],
  );

  const loadMoreArtworks = useCallback(() => {
    if (isBookmarks) return; // Don't load more for bookmarks
    if (!loading && hasMoreData && !refreshing && displayArtworks.length > 0) {
      fetchArtworks(currentPage + 1, false, searchQuery);
    }
  }, [
    loading,
    hasMoreData,
    currentPage,
    refreshing,
    searchQuery,
    isBookmarks,
    fetchArtworks,
    displayArtworks.length,
  ]);

  const handleRefresh = useCallback(() => {
    if (isBookmarks) return; // Don't refresh for bookmarks
    fetchArtworks(1, true, searchQuery);
  }, [searchQuery, isBookmarks, fetchArtworks]);

  // Effect to handle search query changes
  useEffect(() => {
    if (isBookmarks) return; // Don't fetch for bookmarks

    setArtworks([]);
    setCurrentPage(1);
    setHasMoreData(true);
    setError(null);
    fetchArtworks(1, true, searchQuery);
  }, [searchQuery, isBookmarks, fetchArtworks]);

  // Initial load effect - only run once when component mounts
  useEffect(() => {
    if (!isBookmarks) {
      fetchArtworks(1, true, searchQuery);
    }
  }, [fetchArtworks, searchQuery, isBookmarks]);

  const renderItem = useCallback(({ item }: { item: Artwork }) => {
    return <ArtworkCard artwork={item} />;
  }, []);

  const keyExtractor = useCallback((item: Artwork) => `${item.id.toString()}-${item.title}`, []);

  const renderFooter = useCallback(() => {
    if (!loading || isBookmarks) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="large" color={themeStyles.activityColor} animating />
      </View>
    );
  }, [loading, themeStyles.activityColor, isBookmarks]);

  const renderEmpty = useCallback(() => {
    if (loading || refreshing) return null;

    const message = error
      ? 'Failed to load artworks. Pull to refresh.'
      : isBookmarks
        ? 'No bookmarked artworks found'
        : 'No artworks found';

    return (
      <View className="flex-1 justify-center items-center py-8">
        <Text className={`text-center ${themeStyles.emptyText}`}>{message}</Text>
      </View>
    );
  }, [loading, refreshing, error, isBookmarks, themeStyles.emptyText]);

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
        tintColor={themeStyles.activityColor}
        colors={themeStyles.refreshColors}
        progressBackgroundColor={themeStyles.refreshBackground}
      />
    ),
    [refreshing, handleRefresh, themeStyles],
  );

  return (
    <FlatList<Artwork>
      data={displayArtworks}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReached={loadMoreArtworks}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ alignItems: 'center' }}
      removeClippedSubviews
      maxToRenderPerBatch={5}
      windowSize={5}
      initialNumToRender={5}
      updateCellsBatchingPeriod={50}
      refreshControl={refreshControl}
    />
  );
};

export default ArtworkCardList;
