import { create } from 'zustand';

interface UiState {
  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Mobile menu
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

  // Custom Header Right Content (replaces Avatar/Notification when set)
  headerRightContent: React.ReactNode | null;
  setHeaderRightContent: (content: React.ReactNode | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  isMobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),

  headerRightContent: null,
  setHeaderRightContent: (content) => set({ headerRightContent: content }),
}));
