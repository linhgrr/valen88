"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import styles from "../app/page.module.css";
import FallingHearts from "./FallingHearts";

interface MainScreenProps {
    name1: string;
    name2: string;
    onGoCollage: () => void;
}

export default function MainScreen({ name1, name2, onGoCollage }: MainScreenProps) {
    const [isOpened, setIsOpened] = useState(false);
    const [isLetterRevealed, setIsLetterRevealed] = useState(false);
    const [envelopeLoaded, setEnvelopeLoaded] = useState({ bot: false, top: false });

    const allEnvelopeLoaded = envelopeLoaded.bot && envelopeLoaded.top;

    const handleClosedEnvelopeClick = () => {
        if (!allEnvelopeLoaded) return; // Wait for opened envelope to load first
        setIsOpened(true);
    };

    const handleOpenedEnvelopeClick = () => {
        if (!isLetterRevealed) {
            setIsLetterRevealed(true);
        } else {
            onGoCollage();
        }
    };

    return (
        <div className={styles.contentWrapper}>
            {/* Background Texture from Design */}
            <div className={styles.backTexture}>
                <Image
                    src="/back-texture.png"
                    alt=""
                    fill
                    style={{ objectFit: 'cover', opacity: 0.12 }}
                    priority
                />
            </div>

            {/* Slow Falling Hearts */}
            <FallingHearts />

            {/* Closed Envelope - hidden when opened */}
            <motion.div
                className={styles.envelopeContainer}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                onClick={handleClosedEnvelopeClick}
                style={{
                    cursor: 'pointer',
                    visibility: isOpened ? 'hidden' : 'visible',
                    position: isOpened ? 'absolute' : 'relative',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <Image
                    src="/close_env.png"
                    alt="Closed Envelope"
                    width={0}
                    height={0}
                    sizes="100vw"
                    className={styles.envelope}
                />
            </motion.div>

            {/* Opened Envelope with Letter - always rendered but hidden until opened */}
            <div
                className={styles.openedEnvelopeContainer}
                onClick={handleOpenedEnvelopeClick}
                style={{
                    cursor: 'pointer',
                    visibility: isOpened ? 'visible' : 'hidden',
                    position: isOpened ? 'relative' : 'absolute',
                }}
            >
                {/* Layer 1: Bottom envelope (env_open_bot) */}
                <Image
                    src="/env_open_bot.png"
                    alt="Envelope Bottom"
                    width={0}
                    height={0}
                    sizes="100vw"
                    className={styles.envelopeBot}
                    priority
                    onLoad={() => setEnvelopeLoaded(prev => ({ ...prev, bot: true }))}
                />

                {/* Layer 2: Top envelope (env_open_top) */}
                <Image
                    src="/env_open_top.png"
                    alt="Envelope Top"
                    width={0}
                    height={0}
                    sizes="100vw"
                    className={styles.envelopeTop}
                    priority
                    onLoad={() => setEnvelopeLoaded(prev => ({ ...prev, top: true }))}
                />

                {/* Layer 3: Letter Content */}
                <motion.div
                    className={styles.letterCard}
                    initial={{ y: 15, opacity: 1 }}
                    animate={{ y: isLetterRevealed ? -120 : 15, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    <p className={styles.letterDate}>14/02/2026</p>
                    <div className={styles.letterContent}>
                        <h1 className={styles.valentineTitle}>Valentine</h1>
                        <p className={styles.happyMoments}>HAPPY MOMENTS</p>
                    </div>
                    <p className={styles.coupleNames}>{name1} & {name2}</p>
                </motion.div>
            </div>
        </div>
    );
}
