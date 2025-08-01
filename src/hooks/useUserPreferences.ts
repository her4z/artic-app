import { useContext } from 'react';
import { UserPreferencesContext } from '../context/UserPreferencesContext';

/**
 * Custom hook to access user preferences context
 * @returns UserPreferencesContextType
 * @throws Error if used outside of UserPreferencesProvider
 */
export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);

  if (!context) {
    throw new Error(
      'useUserPreferences must be used within UserPreferencesProvider. ' +
        'Make sure your component is wrapped with UserPreferencesProvider.',
    );
  }

  return context;
};
