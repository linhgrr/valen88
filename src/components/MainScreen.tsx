"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import styles from "../app/page.module.css";
import FallingHearts from "./FallingHearts";

export default function MainScreen({ onOpenEnvelope }: { onOpenEnvelope: () => void }) {
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

            {/* Envelope Group from Design Assets */}
            <motion.div
                className={styles.envelopeContainer}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                onClick={onOpenEnvelope}
                style={{ cursor: 'pointer' }}
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
        </div>
    );
}
