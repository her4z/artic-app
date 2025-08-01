import { useState, useMemo } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserPreferences } from '../hooks/useUserPreferences';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  value?: string;
  onChangeText?: (text: string) => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  onSearch,
  onClear,
  value,
  onChangeText,
  className = '',
}) => {
  const { effectiveTheme } = useUserPreferences();
  const [searchText, setSearchText] = useState(value || '');
  const [isFocused, setIsFocused] = useState(false);

  const isDark = effectiveTheme === 'dark';

  // Memoize theme-dependent styles
  const themeStyles = useMemo(
    () => ({
      container: isDark ? 'bg-gray-800' : 'bg-white',
      border: isFocused
        ? isDark
          ? 'border-blue-400 shadow-md'
          : 'border-blue-500 shadow-md'
        : isDark
          ? 'border-gray-700'
          : 'border-gray-200',
      iconColor: isDark ? '#ffffff' : '#000000',
      iconClass: isDark ? 'text-gray-500' : 'text-gray-400',
      textClass: isDark ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500',
    }),
    [isDark, isFocused],
  );

  const handleTextChange = (text: string) => {
    setSearchText(text);
    onChangeText?.(text);
  };

  const handleClear = () => {
    setSearchText('');
    onChangeText?.('');
    onClear?.();
  };

  const handleSubmit = () => {
    onSearch?.(searchText);
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <View className={`relative ${className}`}>
      <View
        className={`
          flex-row items-center
          ${themeStyles.container}
          border rounded-xl px-4 py-3
          shadow-sm
          ${themeStyles.border}
        `}
        style={{
          aspectRatio: 8, // Width:Height ratio of 8:1 for consistent height across platforms
        }}
      >
        <Ionicons
          name="search"
          size={20}
          className={`mr-3 ${themeStyles.iconClass}`}
          color={themeStyles.iconColor}
        />

        <TextInput
          className={`flex-1 text-base ${themeStyles.textClass}`}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={searchText}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="never"
          style={{
            paddingVertical: 0,
            paddingHorizontal: 0,
          }}
        />

        {searchText.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            className="ml-2 p-1"
            accessibilityLabel="Clear search"
            accessibilityRole="button"
          >
            <Ionicons
              name="close-circle"
              size={20}
              className={themeStyles.iconClass}
              color={themeStyles.iconColor}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SearchBar;
