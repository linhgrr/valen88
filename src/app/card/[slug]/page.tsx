"use client";

import { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import styles from "../../page.module.css";
import LoadingScreen from "../../../components/LoadingScreen";
import MainScreen from "../../../components/MainScreen";
import OpenedEnvelopeScreen from "../../../components/OpenedEnvelopeScreen";
import CollageScreen from "../../../components/CollageScreen";
import DesktopWarning from "../../../components/DesktopWarning";

interface CardData {
  name1: string;
  name2: string;
  images: string[];
  slug: string;
}

const MOBILE_MAX_WIDTH = 480;

export default function CardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [screenState, setScreenState] = useState<'loading' | 'closed' | 'opened' | 'collage'>('loading');
  const [isHeartTransition, setIsHeartTransition] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    const fetchCard = async () => {
      try {
        const response = await fetch(`/api/cards/${slug}`);
        const data = await response.json();
        
        if (data.success) {
          setCardData(data.card);
        } else {
          setError('Không tìm thấy thiệp');
        }
      } catch (err) {
        setError('Có lỗi xảy ra khi tải thiệp');
      }
    };

    fetchCard();
  }, [slug]);

  useEffect(() => {
    if (!isMobile || !cardData) return;
    
    const timer = setTimeout(() => {
      setScreenState('closed');
    }, 2000);
    return () => clearTimeout(timer);
  }, [isMobile, cardData]);

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

  if (!cardData) {
    return (
      <main className={styles.container}>
        <LoadingScreen />
      </main>
    );
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
            <OpenedEnvelopeScreen 
              name1={cardData.name1} 
              name2={cardData.name2} 
              onGoCollage={handleGoCollage} 
            />
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
            <CollageScreen 
              name1={cardData.name1} 
              name2={cardData.name2}
              images={cardData.images}
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
