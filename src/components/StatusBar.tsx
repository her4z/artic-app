import { useMemo } from 'react';
import { StatusBar as ThemedStatusBar } from 'react-native';
import { useUserPreferences } from '../hooks/useUserPreferences';

const StatusBar = () => {
  const { effectiveTheme } = useUserPreferences();

  const barStyle = useMemo(
    () => (effectiveTheme === 'dark' ? 'light-content' : 'dark-content'),
    [effectiveTheme],
  );

  return <ThemedStatusBar barStyle={barStyle} translucent={false} backgroundColor="transparent" />;
};

export default StatusBar;
