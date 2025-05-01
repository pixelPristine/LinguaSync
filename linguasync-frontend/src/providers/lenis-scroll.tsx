"use client";

import Lenis from "lenis";
import { createContext, ReactNode, useContext, useEffect, useRef } from "react";

type LenisContextType = {
  lockScroll: () => void;
  unlockScroll: () => void;
} | null;

const LenisContext = createContext<LenisContextType>(null);

export const useLenis = () => {
  const context = useContext(LenisContext);
  if (!context) {
    throw new Error("useLenis must be used within a LenisScrollProvider");
  }
  return context;
};

type LenisScrollProviderProps = {
  children: ReactNode;
};

const LenisScrollProvider = ({ children }: LenisScrollProviderProps) => {
  const lenisRef = useRef<Lenis | undefined>(undefined);
  const rafHandleRef = useRef<number | null>(null);
  useEffect(() => {
    if (!lenisRef.current) {
      lenisRef.current = new Lenis({
        syncTouch: true,
      });
      const raf = (time: number) => {
        lenisRef.current?.raf(time);
        rafHandleRef.current = requestAnimationFrame(raf);
      };
      rafHandleRef.current = requestAnimationFrame(raf);
    }
    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = undefined;
      }
      if (rafHandleRef.current) {
        cancelAnimationFrame(rafHandleRef.current);
        rafHandleRef.current = null;
      }
    };
  }, []);

  const lockScroll = () => {
    if (lenisRef.current) {
      lenisRef.current.stop();
    }
  };

  const unlockScroll = () => {
    if (lenisRef.current) {
      lenisRef.current.start();
    }
  };

  return (
    <LenisContext.Provider
      value={{
        lockScroll,
        unlockScroll,
      }}
    >
      {children}
    </LenisContext.Provider>
  );
};

export default LenisScrollProvider;
