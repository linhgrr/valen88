"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import styles from "../app/page.module.css";

export default function FallingHearts() {
    return (
        <div className={styles.fallingHearts}>
            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={i}
                    className={styles.fallingHeart}
                    initial={{
                        top: -50,
                        left: `${Math.random() * 100}%`,
                        opacity: 0,
                        rotate: Math.random() * 360
                    }}
                    animate={{
                        top: "110vh",
                        opacity: [0, 1, 1, 0],
                        rotate: Math.random() * 360 + 360
                    }}
                    transition={{
                        duration: 7 + Math.random() * 5,
                        repeat: Infinity,
                        delay: Math.random() * 10,
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
