"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import styles from "../../page.module.css";
import LoadingScreen from "../../../components/LoadingScreen";
import MainScreen from "../../../components/MainScreen";
import CollageScreen from "../../../components/CollageScreen";
import LetterScreen from "../../../components/LetterScreen";
import DesktopWarning from "../../../components/DesktopWarning";
import { preloadCriticalAssets, preloadRemainingAssetsInBackground } from "../../../utils/preloadAssets";

interface CardData {
  name1: string;
  name2: string;
  images: string[];
  letterImages: string[];
  letterMessage: {
    greeting: string;
    content: string;
  };
  slug: string;
}

const MOBILE_MAX_WIDTH = 480;
const MIN_LOADING_TIME = 600;

export default function CardPage() {
  const pathname = usePathname();
  const slug = pathname.split('/').pop() || '';
  const [screenState, setScreenState] = useState<'loading' | 'main' | 'collage' | 'letter'>('loading');
  const [isHeartTransition, setIsHeartTransition] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

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

  // Fetch card data
  useEffect(() => {
    const controller = new AbortController();

    const fetchCard = async () => {
      try {
        const response = await fetch(`/api/cards/${slug}`, { signal: controller.signal });
        const data = await response.json();

        if (data.success) {
          setCardData(data.card);
        } else {
          setError('Không tìm thấy thiệp');
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setError('Có lỗi xảy ra khi tải thiệp');
      }
    };

    void fetchCard();

    return () => controller.abort();
  }, [slug]);

  // Only block on first-screen assets, so main screen appears fast
  useEffect(() => {
    if (!isMobile || !cardData) return;

    let isCancelled = false;
    let loadingTimer: number | undefined;
    const startTime = Date.now();

    void preloadCriticalAssets()
      .catch(() => {
        // Continue UI flow even if preload has partial failures.
      })
      .finally(() => {
        if (isCancelled) return;

        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsed);

        loadingTimer = window.setTimeout(() => {
          if (!isCancelled) {
            setAssetsLoaded(true);
          }
        }, remainingTime);
      });

    return () => {
      isCancelled = true;
      if (loadingTimer) window.clearTimeout(loadingTimer);
    };
  }, [isMobile, cardData]);

  // Preload collage + remote card images in background (non-blocking)
  useEffect(() => {
    if (!isMobile || !cardData) return;

    preloadRemainingAssetsInBackground([...cardData.images, ...(cardData.letterImages || [])]);
  }, [isMobile, cardData]);

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

  const handleGoLetter = () => {
    setIsHeartTransition(true);
    setTimeout(() => {
      setScreenState('letter');
      setIsHeartTransition(false);
    }, 700);
  };

  if (!isClient) {
    return null;
  }

  if (!isMobile) {
    return <DesktopWarning />;
  }

  if (error) {
    return (
      <main className={styles.container}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          flexDirection: 'column',
          gap: '16px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '64px' }}>💔</span>
          <h1 style={{ fontFamily: 'Dancing Script', color: '#891008', fontSize: '28px' }}>{error}</h1>
          <a href="/" style={{ color: '#891008', fontFamily: 'Dancing Script', fontSize: '20px' }}>
            Về trang chủ
          </a>
        </div>
      </main>
    );
  }

  // cardData loading is handled inside AnimatePresence below

  return (
    <main className={styles.container}>
      <AnimatePresence mode="wait">
        {(screenState === 'loading' || !cardData) && (
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
        {screenState === 'main' && cardData && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={styles.screenWrapper}
          >
            <MainScreen
              name1={cardData.name1}
              name2={cardData.name2}
              onGoCollage={handleGoCollage}
            />
          </motion.div>
        )}
        {screenState === 'collage' && cardData && (
          <motion.div
            key="collage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className={styles.screenWrapper}
            onClick={handleGoLetter}
            style={{ cursor: 'pointer' }}
          >
            <CollageScreen
              name1={cardData.name1}
              name2={cardData.name2}
              images={cardData.images}
            />
          </motion.div>
        )}
        {screenState === 'letter' && cardData && (
          <motion.div
            key="letter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className={styles.screenWrapper}
          >
            <LetterScreen
              name1={cardData.name1}
              name2={cardData.name2}
              images={cardData.letterImages && cardData.letterImages.length > 0 ? cardData.letterImages : cardData.images.slice(0, 3)}
              message={cardData.letterMessage}
            />
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
