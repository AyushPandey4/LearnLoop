'use client';

import { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    // Always use dark mode
    useEffect(() => {
        if (typeof window !== 'undefined') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    }, []);

    // Provide a dummy toggle function that does nothing
    const toggleDarkMode = () => {
        // Do nothing since we're always in dark mode
    };

    return (
        <ThemeContext.Provider value={{ darkMode: true, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
} 