import { createSlice } from "@reduxjs/toolkit";

export const sidebarSlice = createSlice({
  name: "sidebar",
  initialState: {
    isSidebarOpen: false,
  },
  reducers: {
    handleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    openSidebar: (state) => {
      state.isSidebarOpen = true;
    },
    closeSidebar: (state) => {
      state.isSidebarOpen = false;
    },
  },
});

export const { handleSidebar, openSidebar, closeSidebar } =
  sidebarSlice.actions;

export default sidebarSlice.reducer;
