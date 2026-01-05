/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Theme {
    name: string;
    text: {
        primary: string;
        secondary: string;
        link: string;
        accent: string;
        response: string;
    };
    background: {
        primary: string;
        diff: {
            added: string;
            removed: string;
        };
    };
    border: {
        default: string;
        focused: string;
    };
    ui: {
        comment: string;
        symbol: string;
        dark: string;
        gradient: string[];
    };
    status: {
        error: string;
        success: string;
        warning: string;
    };
}

export const themes: Record<string, Theme> = {
    dark: {
        name: 'dark',
        text: {
            primary: '',
            secondary: '#6C7086',
            link: '#89B4FA',
            accent: '#CBA6F7',
            response: '',
        },
        background: {
            primary: '#1E1E2E',
            diff: {
                added: '#28350B',
                removed: '#430000',
            },
        },
        border: {
            default: '#6C7086',
            focused: '#89B4FA',
        },
        ui: {
            comment: '#6C7086',
            symbol: '#6C7086',
            dark: '#45485A',
            gradient: ['#4796E4', '#847ACE', '#C3677F'],
        },
        status: {
            error: '#F38BA8',
            success: '#A6E3A1',
            warning: '#F9E2AF',
        },
    },
    light: {
        name: 'light',
        text: {
            primary: '#4c4f69',
            secondary: '#9ca0b0',
            link: '#1e66f5',
            accent: '#8839ef',
            response: '#4c4f69',
        },
        background: {
            primary: '#eff1f5',
            diff: {
                added: '#e6e9ef',
                removed: '#ccd0da',
            },
        },
        border: {
            default: '#9ca0b0',
            focused: '#1e66f5',
        },
        ui: {
            comment: '#9ca0b0',
            symbol: '#9ca0b0',
            dark: '#bcc0cc',
            gradient: ['#1e66f5', '#8839ef', '#ea76cb'],
        },
        status: {
            error: '#d20f39',
            success: '#40a02b',
            warning: '#df8e1d',
        },
    },
    dracula: {
        name: 'dracula',
        text: {
            primary: '#f8f8f2',
            secondary: '#6272a4',
            link: '#8be9fd',
            accent: '#bd93f9',
            response: '#f8f8f2',
        },
        background: {
            primary: '#282a36',
            diff: {
                added: '#2b352b',
                removed: '#3c2020',
            },
        },
        border: {
            default: '#44475a',
            focused: '#bd93f9',
        },
        ui: {
            comment: '#6272a4',
            symbol: '#6272a4',
            dark: '#44475a',
            gradient: ['#bd93f9', '#ff79c6', '#8be9fd'],
        },
        status: {
            error: '#ff5555',
            success: '#50fa7b',
            warning: '#f1fa8c',
        },
    },
    nord: {
        name: 'nord',
        text: {
            primary: '#D8DEE9', // Nord 6 (Snow Storm)
            secondary: '#4C566A', // Nord 3 (Dark Gray)
            link: '#88C0D0', // Nord 8 (Frost Blue)
            accent: '#81A1C1', // Nord 9 (Frost Blue)
            response: '#E5E9F0',
        },
        background: {
            primary: '#2E3440', // Nord 0 (Polar Night)
            diff: {
                added: '#2F3D36', // Green-ish tint
                removed: '#3B2E2E', // Red-ish tint
            },
        },
        border: {
            default: '#434C5E', // Nord 2
            focused: '#88C0D0', // Nord 8
        },
        ui: {
            comment: '#4C566A',
            symbol: '#4C566A',
            dark: '#3B4252',
            gradient: ['#88C0D0', '#81A1C1', '#A3BE8C'],
        },
        status: {
            error: '#BF616A', // Nord 11
            success: '#A3BE8C', // Nord 14
            warning: '#EBCB8B', // Nord 13
        },
    },
};

export const defaultTheme = themes.dark;
