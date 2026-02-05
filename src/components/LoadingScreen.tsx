"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import styles from "../app/page.module.css";
import FallingHearts from "./FallingHearts";

export default function LoadingScreen() {
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
