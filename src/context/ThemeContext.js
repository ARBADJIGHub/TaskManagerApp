import React, { createContext, useState, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import {
    MD3DarkTheme,
    MD3LightTheme,
    adaptNavigationTheme,
} from 'react-native-paper';
import { 
    DarkTheme as NavigationDarkTheme,
    DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';

// Adapter les thèmes de navigation pour qu'ils soient compatibles avec react-native-paper
const { LightTheme: AdaptedNavigationLight, DarkTheme: AdaptedNavigationDark } = adaptNavigationTheme({
    reactNavigationLight: NavigationDefaultTheme,
    reactNavigationDark: NavigationDarkTheme,
});

// Définir les thèmes paper personnalisés ( On peut rajouter des couleurs ici si besoin)
const CombinedDefaultTheme = {
    ...MD3LightTheme, // Thème paper clair par défault
    ...AdaptedNavigationLight.colors, // Thème Navigation clair adapté
    colors: {
        ...MD3LightTheme.colors,
        ...AdaptedNavigationLight.colors,
        // Ajouter mes couleurs personnalisées pour le thème clair ici si nécessaire
        // primary: 'tomato',
        // accent: 'yellow',
    },
},

const CombinedDarkTheme = {
    ...MD3DarkTheme,
    ...AdaptedNavigationDark.colors,
    colors: {
        ...MD3DarkTheme.colors,
        ...AdaptedNavigationDark.colors,
    // Ajoutez vos couleurs personnalisées pour le thème sombre ici si nécessaire
        // primary: 'blue',
        // accent: 'green',
    },
};

export const ThemeContext = createContext({
    isDarkMode: false,
    theme: CombinedDefaultTheme,
    toggleTheme: () => {},
});

export const ThemeProviser = ({ children }) => {
    const ColorScheme = useColorScheme(); // Détecte le mode sombre ou clair du système
    const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark'); // Initialise le mode sombre en fonction du système

    // Fonction pour basculer le thème
    const toggleTheme = useCallback(() => {
        setIsDarkMode(prevMode => !prevMode); // Inverse le mode sombre
    }, []);

    // Sélectionner le thème paper/Navigation combiné basé sur l'état isDarkMode
    const theme = useMemo(
        () => (isDarkMode ? CombinedDarkTheme : CombinedDefaultTheme),
        [isDarkMode]
    );

    return (
        <ThemeContext.Provider value={{ isDarkMode, theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

