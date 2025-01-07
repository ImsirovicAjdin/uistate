import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    theme: 'light',
    layout: {
        sidebarExpanded: true,
        contentWidth: 'full'
    },
    components: {
        activeTab: 'dashboard',
        expandedPanels: [],
        notifications: []
    }
};

export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setTheme: (state, action) => {
            state.theme = action.payload;
        },
        toggleSidebar: (state) => {
            state.layout.sidebarExpanded = !state.layout.sidebarExpanded;
        },
        setContentWidth: (state, action) => {
            state.layout.contentWidth = action.payload;
        },
        setActiveTab: (state, action) => {
            state.components.activeTab = action.payload;
        },
        togglePanel: (state, action) => {
            const panelId = action.payload;
            const index = state.components.expandedPanels.indexOf(panelId);
            if (index === -1) {
                state.components.expandedPanels.push(panelId);
            } else {
                state.components.expandedPanels.splice(index, 1);
            }
        },
        addNotification: (state, action) => {
            state.components.notifications.push(action.payload);
        },
        removeNotification: (state, action) => {
            state.components.notifications = state.components.notifications
                .filter(n => n.id !== action.payload);
        }
    }
});

export const {
    setTheme,
    toggleSidebar,
    setContentWidth,
    setActiveTab,
    togglePanel,
    addNotification,
    removeNotification
} = uiSlice.actions;

export default uiSlice.reducer;
