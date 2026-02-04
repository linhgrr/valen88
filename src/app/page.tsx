"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import styles from "./page.module.css";
import LoadingScreen from "../components/LoadingScreen";
import MainScreen from "../components/MainScreen";
import OpenedEnvelopeScreen from "../components/OpenedEnvelopeScreen";
import CollageScreen from "../components/CollageScreen";
import DesktopWarning from "../components/DesktopWarning";

const MOBILE_MAX_WIDTH = 480;

export default function Page() {
  const searchParams = useSearchParams();
  const [screenState, setScreenState] = useState<'loading' | 'closed' | 'opened' | 'collage'>('loading');
  const [isHeartTransition, setIsHeartTransition] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [isClient, setIsClient] = useState(false);

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

  useEffect(() => {
    if (!isMobile) return;
    
    const timer = setTimeout(() => {
      setScreenState('closed');
    }, 2000); // Transition after 2 seconds
    return () => clearTimeout(timer);
  }, [isMobile]);

  const handleOpenEnvelope = () => {
    setScreenState('opened');
  };

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
        {screenState === 'closed' && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={styles.screenWrapper}
          >
            <MainScreen onOpenEnvelope={handleOpenEnvelope} />
          </motion.div>
        )}
        {screenState === 'opened' && (
          <div
            key="opened"
            className={styles.screenWrapper}
          >
            <OpenedEnvelopeScreen name1={name1} name2={name2} onGoCollage={handleGoCollage} />
          </div>
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
