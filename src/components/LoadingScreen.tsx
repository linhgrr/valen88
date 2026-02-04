"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import styles from "../app/page.module.css";
import { generateLoveTextPattern } from "../utils/patterns";

export default function LoadingScreen() {
    const loveTextContent = generateLoveTextPattern();

    return (
        <div className={styles.contentWrapper}>
            {/* Background pattern with love words */}
            <div className="love-text-pattern">
                <div className="text-content">{loveTextContent}</div>
            </div>

            {/* Floating hearts decoration */}
            <div className={styles.floatingHearts}>
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        className={styles.miniHeart}
                        style={{
                            left: `${10 + ((i * 7) % 80)}%`,
                            top: `${5 + ((i * 13) % 85)}%`,
                        }}
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                            duration: 2 + (i % 3),
                            repeat: Infinity,
                            delay: i * 0.2,
                        }}
                    >
                        ♡
                    </motion.div>
                ))}
            </div>

            {/* Center content */}
            <div className={styles.centerContent}>
                {/* Animated Heart - Using actual Figma asset */}
                <motion.div
                    className={styles.heartContainer}
                    animate={{
                        scale: [1, 1.15, 1],
                    }}
                    transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <Image
                        src="/heart.png"
                        alt="Heart"
                        width={89}
                        height={89}
                        className={styles.heartImage}
                        priority
                    />
                </motion.div>

                {/* Loading text */}
                <motion.div
                    className={styles.loadingText}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <span>Loading</span>
                    <span className={styles.dots}>
                        {[0, 1, 2].map((i) => (
                            <motion.span
                                key={i}
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
                            >
                                .
                            </motion.span>
                        ))}
                    </span>
                </motion.div>
            </div>
        </div>
    );
}
