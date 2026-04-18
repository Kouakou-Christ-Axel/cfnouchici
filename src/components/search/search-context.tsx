"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { HotkeysProvider } from "@tanstack/react-hotkeys";

interface SearchModalContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const SearchModalContext = createContext<SearchModalContextType | null>(null);

export function SearchModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <HotkeysProvider>
      <SearchModalContext.Provider value={{ isOpen, open, close }}>
        {children}
      </SearchModalContext.Provider>
    </HotkeysProvider>
  );
}

export function useSearchModal() {
  const ctx = useContext(SearchModalContext);
  if (!ctx) throw new Error("useSearchModal must be used within SearchModalProvider");
  return ctx;
}
