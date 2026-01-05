import { jsx as _jsx } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { createContext, useContext, useState } from 'react';
import { themes, defaultTheme } from '../themes/index.js';
const ThemeContext = createContext({
    theme: defaultTheme,
    setTheme: () => { },
    availableThemes: [],
});
export const useTheme = () => useContext(ThemeContext);
export const ThemeProvider = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState(defaultTheme);
    const setThemeName = (name) => {
        if (themes[name]) {
            setCurrentTheme(themes[name]);
        }
    };
    return (_jsx(ThemeContext.Provider, { value: {
            theme: currentTheme,
            setTheme: setThemeName,
            availableThemes: Object.keys(themes)
        }, children: children }));
};
