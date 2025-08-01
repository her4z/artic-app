import { useRef, useEffect, useMemo } from 'react';
import { View, TouchableOpacity, Animated, Easing } from 'react-native';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { Ionicons } from '@expo/vector-icons';

const ThemeSwitch = () => {
  const { theme, setTheme } = useUserPreferences();
  const slideAnim = useRef(new Animated.Value(theme === 'dark' ? 1 : 0)).current;

  const isDark = theme === 'dark';

  // Memoize theme-dependent styles
  const themeStyles = useMemo(
    () => ({
      container: {
        backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
      },
      shadowColor: isDark ? '#000' : '#fff',
      sunColor: isDark ? '#9ca3af' : '#f59e0b',
      moonColor: isDark ? '#3b82f6' : '#9ca3af',
    }),
    [isDark],
  );

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isDark ? 1 : 0,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [isDark, slideAnim]);

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <TouchableOpacity
      onPress={handleToggle}
      style={{
        width: 60,
        height: 30,
        borderRadius: 15,
        padding: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        ...themeStyles.container,
      }}
    >
      {/* Sun Icon */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="sunny" size={16} color={themeStyles.sunColor} />
      </View>

      {/* Moon Icon */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="moon" size={16} color={themeStyles.moonColor} />
      </View>

      {/* Sliding Indicator */}
      <Animated.View
        style={{
          position: 'absolute',
          width: 26,
          height: 26,
          backgroundColor: '#ffffff',
          borderRadius: 13,
          shadowColor: themeStyles.shadowColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          transform: [
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [2, 32],
              }),
            },
          ],
        }}
      />
    </TouchableOpacity>
  );
};

export default ThemeSwitch;
