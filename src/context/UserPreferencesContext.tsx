import { debounce } from 'lodash';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useState, useEffect, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { Artwork } from '../types/artwork';

type Theme = 'light' | 'dark' | 'system';
type EffectiveTheme = 'light' | 'dark';

interface UserPreferencesContextType {
  theme: Theme;
  effectiveTheme: EffectiveTheme;
  enableNotifications: boolean;
  bookmarkedArtworks: Artwork[];
  isLoading: boolean;
  setTheme: (theme: Theme) => void;
  setEnableNotifications: (enable: boolean) => void;
  setBookmarkedArtworks: (artworks: Artwork[]) => void;
  addBookmarkedArtwork: (artwork: Artwork) => void;
  removeBookmarkedArtwork: (artwork: Artwork) => void;
}

const STORAGE_KEYS = {
  THEME: 'theme',
  ENABLE_NOTIFICATIONS: 'enableNotifications',
  BOOKMARKED_ARTWORKS: 'bookmarkedArtworks',
} as const;

export const UserPreferencesContext = createContext<UserPreferencesContextType>({
  theme: 'system',
  effectiveTheme: 'light',
  enableNotifications: false,
  bookmarkedArtworks: [],
  isLoading: true,
  setTheme: () => {},
  setEnableNotifications: () => {},
  setBookmarkedArtworks: () => {},
  addBookmarkedArtwork: () => {},
  removeBookmarkedArtwork: () => {},
});

export const UserPreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('system');
  const [enableNotifications, setEnableNotifications] = useState(false);
  const [bookmarkedArtworks, setBookmarkedArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const deviceTheme = useColorScheme();

  // Calculate effective theme based on user preference and device theme
  const effectiveTheme = useMemo((): EffectiveTheme => {
    if (theme === 'system') {
      return (deviceTheme as EffectiveTheme) || 'light';
    }
    return theme;
  }, [theme, deviceTheme]);

  const savePreferences = useCallback(async () => {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.THEME, theme],
        [STORAGE_KEYS.ENABLE_NOTIFICATIONS, enableNotifications.toString()],
        [STORAGE_KEYS.BOOKMARKED_ARTWORKS, JSON.stringify(bookmarkedArtworks)],
      ]);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [theme, enableNotifications, bookmarkedArtworks]);

  // Debounced save to avoid excessive writes
  const debouncedSavePreferences = useMemo(
    () => debounce(savePreferences, 1000),
    [savePreferences],
  );

  const loadPreferences = useCallback(async () => {
    try {
      const [storedTheme, storedEnableNotifications, storedBookmarkedArtworks] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.THEME),
        AsyncStorage.getItem(STORAGE_KEYS.ENABLE_NOTIFICATIONS),
        AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKED_ARTWORKS),
      ]);

      // Validate and set theme
      if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
        setTheme(storedTheme as Theme);
      }

      // Validate and set notifications preference
      if (storedEnableNotifications !== null) {
        setEnableNotifications(storedEnableNotifications === 'true');
      }

      // Validate and set bookmarked artworks
      if (storedBookmarkedArtworks) {
        try {
          const parsed = JSON.parse(storedBookmarkedArtworks);
          if (Array.isArray(parsed)) {
            setBookmarkedArtworks(parsed);
          }
        } catch (parseError) {
          console.error('Error parsing bookmarked artworks:', parseError);
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Save preferences when they change
  useEffect(() => {
    debouncedSavePreferences();
  }, [debouncedSavePreferences]);

  const addBookmarkedArtwork = useCallback((artwork: Artwork) => {
    setBookmarkedArtworks((prev) => {
      // Prevent duplicate bookmarks
      if (prev.some((item) => item.id === artwork.id)) {
        return prev;
      }
      return [artwork, ...prev];
    });
  }, []);

  const removeBookmarkedArtwork = useCallback((artwork: Artwork) => {
    setBookmarkedArtworks((prev) => prev.filter((item) => item.id !== artwork.id));
  }, []);

  const contextValue = useMemo(
    () => ({
      theme,
      effectiveTheme,
      enableNotifications,
      bookmarkedArtworks,
      isLoading,
      setTheme,
      setEnableNotifications,
      setBookmarkedArtworks,
      addBookmarkedArtwork,
      removeBookmarkedArtwork,
    }),
    [
      theme,
      effectiveTheme,
      enableNotifications,
      bookmarkedArtworks,
      isLoading,
      setTheme,
      setEnableNotifications,
      setBookmarkedArtworks,
      addBookmarkedArtwork,
      removeBookmarkedArtwork,
    ],
  );

  return (
    <UserPreferencesContext.Provider value={contextValue}>
      {children}
    </UserPreferencesContext.Provider>
  );
};
