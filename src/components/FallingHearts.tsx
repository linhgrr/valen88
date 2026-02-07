"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import styles from "../app/page.module.css";

// Pre-generate heart positions to avoid Math.random() on every render (rendering-hoist-jsx)
interface HeartPosition {
    left: number;
    initialRotate: number;
    finalRotate: number;
    duration: number;
    delay: number;
}

export default function FallingHearts() {
    // Memoize random positions so they don't change on re-render (rerender-lazy-state-init)
    const heartPositions = useMemo<HeartPosition[]>(() =>
        Array.from({ length: 15 }, () => ({
            left: Math.random() * 100,
            initialRotate: Math.random() * 360,
            finalRotate: Math.random() * 360 + 360,
            duration: 7 + Math.random() * 5,
            delay: Math.random() * 10
        })),
    []);

    return (
        <div className={styles.fallingHearts}>
            {heartPositions.map((pos, i) => (
                <motion.div
                    key={i}
                    className={styles.fallingHeart}
                    initial={{
                        top: -50,
                        left: `${pos.left}%`,
                        opacity: 0,
                        rotate: pos.initialRotate
                    }}
                    animate={{
                        top: "110vh",
                        opacity: [0, 1, 1, 0],
                        rotate: pos.finalRotate
                    }}
                    transition={{
                        duration: pos.duration,
                        repeat: Infinity,
                        delay: pos.delay,
                        ease: "linear"
                    }}
                >
                    <Image
                        src="/heart-small.png"
                        alt="heart"
                        width={58}
                        height={58}
                        className={styles.miniHeartImage}
                    />
                </motion.div>
            ))}
        </div>
    );
}
