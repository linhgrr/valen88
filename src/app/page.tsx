"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import styles from "./page.module.css";
import LoadingScreen from "../components/LoadingScreen";
import MainScreen from "../components/MainScreen";
import CollageScreen from "../components/CollageScreen";
import DesktopWarning from "../components/DesktopWarning";
import { preloadStaticAssets } from "../utils/preloadAssets";

const MOBILE_MAX_WIDTH = 480;
const MIN_LOADING_TIME = 2000; // Minimum loading time in ms

function PageContent() {
  const searchParams = useSearchParams();
  const [screenState, setScreenState] = useState<'loading' | 'main' | 'collage'>('loading');
  const [isHeartTransition, setIsHeartTransition] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // Get names from query params
  const name1 = searchParams.get('name1') || 'Tuan';
  const name2 = searchParams.get('name2') || 'Vy';

  // Check if screen is mobile size
  useEffect(() => {
    setIsClient(true);

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= MOBILE_MAX_WIDTH);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Preload all assets during loading screen
  useEffect(() => {
    if (!isMobile) return;

    const startTime = Date.now();

    preloadStaticAssets().then(() => {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsed);

      // Ensure minimum loading time for smooth UX
      setTimeout(() => {
        setAssetsLoaded(true);
      }, remainingTime);
    });
  }, [isMobile]);

  // Transition to main screen when assets are loaded
  useEffect(() => {
    if (assetsLoaded && screenState === 'loading') {
      setScreenState('main');
    }
  }, [assetsLoaded, screenState]);

  const handleGoCollage = () => {
    setIsHeartTransition(true);
    setTimeout(() => {
      setScreenState('collage');
      setIsHeartTransition(false);
    }, 700);
  };

  // Show nothing during SSR, then check screen size on client
  if (!isClient) {
    return null;
  }

  // Show desktop warning for non-mobile screens
  if (!isMobile) {
    return <DesktopWarning />;
  }

  return (
    <main className={styles.container}>
      <AnimatePresence mode="wait">
        {screenState === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className={styles.screenWrapper}
          >
            <LoadingScreen />
          </motion.div>
        )}
        {screenState === 'main' && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={styles.screenWrapper}
          >
            <MainScreen name1={name1} name2={name2} onGoCollage={handleGoCollage} />
          </motion.div>
        )}
        {screenState === 'collage' && (
          <motion.div
            key="collage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className={styles.screenWrapper}
          >
            <CollageScreen name1={name1} name2={name2} />
          </motion.div>
        )}
      </AnimatePresence>
      {isHeartTransition && (
        <motion.div
          className={styles.heartTransition}
          initial={{ scale: 0.2, opacity: 0.9 }}
          animate={{ scale: 20, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeIn" }}
        >
          <Image src="/heart.png" alt="Heart transition" width={200} height={200} className={styles.heartTransitionImg} />
        </motion.div>
      )}
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <PageContent />
    </Suspense>
  );
}
