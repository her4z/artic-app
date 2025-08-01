import { memo, useMemo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { sendNotification } from '../services/notifications';
import { Artwork } from '../types/artwork';
import { getArtworkImageUrl } from '../utils/imageUtils';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ArtworkDetail'>;

interface ArtworkCardProps {
  artwork: Artwork;
  aspectRatio?: number;
  width?: string;
}

const ArtworkCard = memo(({ artwork, aspectRatio = 0.75, width = 'w-2/3' }: ArtworkCardProps) => {
  const navigation = useNavigation<NavigationProp>();
  const { effectiveTheme, bookmarkedArtworks, addBookmarkedArtwork, removeBookmarkedArtwork } =
    useUserPreferences();

  const isDark = effectiveTheme === 'dark';
  const isBookmarked = bookmarkedArtworks.some((item) => item.id === artwork.id);

  // Memoize theme-dependent styles
  const themeStyles = useMemo(
    () => ({
      container: `border border-[3px] ${isDark ? 'border-dark-border-primary' : 'border-light-border-primary'} ${width} mb-10 rounded-lg overflow-hidden`,
      text: `${isDark ? 'text-dark-text-primary' : 'text-light-text-primary'} font-playfair text-sm`,
      bookmarkColor: isBookmarked ? '#FFD700' : 'white',
    }),
    [isDark, width, isBookmarked],
  );

  const containerStyle = useMemo(() => ({ aspectRatio }), [aspectRatio]);

  const handleBookmarkToggle = useCallback(() => {
    if (isBookmarked) {
      removeBookmarkedArtwork(artwork);
      sendNotification({
        title: 'Artwork removed from bookmarks 🔖',
        body: artwork.title,
      });
    } else {
      addBookmarkedArtwork(artwork);
      sendNotification({
        title: 'Artwork added to bookmarks 🔖',
        body: artwork.title,
      });
    }
  }, [isBookmarked, removeBookmarkedArtwork, addBookmarkedArtwork, artwork]);

  const handleCardPress = useCallback(() => {
    navigation.navigate('ArtworkDetail', { artwork });
  }, [navigation, artwork]);

  const artworkTitle = useMemo(() => {
    const title = artwork.title || 'Untitled';
    const artist = artwork.artist_title;
    return artist ? `${title} by ${artist}` : title;
  }, [artwork.title, artwork.artist_title]);

  const imageUri = useMemo(() => getArtworkImageUrl(artwork.image_id), [artwork.image_id]);

  return (
    <TouchableOpacity
      className={themeStyles.container}
      style={containerStyle}
      onPress={handleCardPress}
      activeOpacity={0.7}
      accessibilityLabel={`View details for ${artwork.title}`}
      accessibilityRole="button"
    >
      <View className="p-3 flex-shrink-0">
        <Text className={themeStyles.text} numberOfLines={2}>
          {artworkTitle}
        </Text>
      </View>

      <View className="flex-1">
        <Image
          source={{ uri: imageUri }}
          className="w-full h-full"
          resizeMode="cover"
          accessibilityLabel={`Image of ${artwork.title}`}
        />

        <TouchableOpacity
          onPress={handleBookmarkToggle}
          className="absolute bottom-2 right-2 z-10 p-1"
          accessibilityLabel={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
          accessibilityRole="button"
        >
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={32}
            color={themeStyles.bookmarkColor}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

export default ArtworkCard;
