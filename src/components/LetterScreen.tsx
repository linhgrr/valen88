"use client";

import { memo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import styles from "./LetterScreen.module.css";
import { generateLoveTextPattern } from "../utils/patterns";

interface LetterScreenProps {
    name1: string;
    name2: string;
    images?: string[]; // Array of image URLs (uses index 0, 1, 2 for the 3 photos)
    message?: {
        greeting: string;
        content: string;
    };
}

// Hoist DropWrapper outside component to avoid recreation on every render (rendering-hoist-jsx)
interface DropWrapperProps {
    children: React.ReactNode;
    delay: number;
    className?: string;
    zIndex?: number;
}

const DropWrapper = memo(function DropWrapper({ children, delay, className, zIndex = 1 }: DropWrapperProps) {
    return (
        <motion.div
            initial={{ y: -200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
                duration: 0.6,
                delay,
                ease: [0.34, 1.56, 0.64, 1]
            }}
            className={className}
            style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, pointerEvents: 'none', zIndex }}
        >
            <div style={{ pointerEvents: 'auto' }}>
                {children}
            </div>
        </motion.div>
    );
});

export default function LetterScreen({ name1, name2, images, message }: LetterScreenProps) {
    const defaultMessage = {
        greeting: "Dear em iu ,",
        content: `Sau một thời gian tìm hiểu, bộ phận thẩm định tình cảm đã quyết định gia hạn hợp đồng yêu đương với bạn thêm... trọn đời. Dù bạn thi thoảng hay dỗi, hay ăn tranh phần của mình, nhưng vì bạn quá đáng yêu nên mình đành 'chịu đựng' vậy.`
    };

    // Use message if it has content, otherwise use default
    const displayMessage = {
        greeting: message?.greeting || defaultMessage.greeting,
        content: message?.content || defaultMessage.content
    };

    // Use letterImages if provided and has items, otherwise fallback to first 3 images from collage
    const displayImages = images && images.length > 0 ? images : [];

    return (
        <div className={styles.letterContainer}>
            {/* Background */}
            <div className={styles.letterBgOverlay}>
                <div className="love-text-pattern" style={{ opacity: 0.3 }}>
                    <div className="text-content">{generateLoveTextPattern()}</div>
                </div>
                <Image
                    src="/back-texture.png"
                    alt=""
                    fill
                    sizes="100vw"
                    style={{ objectFit: 'cover', opacity: 0.2, mixBlendMode: 'multiply' }}
                />
            </div>

            <div className={styles.letterContent}>
                {/* Photo Frame 1 - Top Left, rotated -14deg */}
                <DropWrapper delay={0.1} zIndex={2}>
                    <div className={`${styles.photoFrame} ${styles.photoFrameOne}`}>
                        <Image src="/stamp.png" alt="frame" width={0} height={0} sizes="100vw" className={styles.photoFrameImg} />
                        <div className={styles.photoPlaceholder}>
                            {displayImages[0] ? (
                                <Image src={displayImages[0]} alt="Photo 1" fill sizes="100vw" style={{ objectFit: 'cover' }} />
                            ) : (
                                'Photo'
                            )}
                        </div>
                    </div>
                </DropWrapper>

                {/* Photo Frame 2 - Top Right, rotated 20deg */}
                <DropWrapper delay={0.25} zIndex={3}>
                    <div className={`${styles.photoFrame} ${styles.photoFrameTwo}`}>
                        <Image src="/stamp.png" alt="frame" width={0} height={0} sizes="100vw" className={styles.photoFrameImg} />
                        <div className={styles.photoPlaceholder}>
                            {displayImages[1] ? (
                                <Image src={displayImages[1]} alt="Photo 2" fill sizes="100vw" style={{ objectFit: 'cover' }} />
                            ) : (
                                'Photo'
                            )}
                        </div>
                    </div>
                </DropWrapper>

                {/* Photo Frame 3 - Center, rotated 5deg */}
                <DropWrapper delay={0.4} zIndex={4}>
                    <div className={`${styles.photoFrame} ${styles.photoFrameThree}`}>
                        <Image src="/stamp.png" alt="frame" width={0} height={0} sizes="100vw" className={styles.photoFrameImg} />
                        <div className={styles.photoPlaceholder}>
                            {displayImages[2] ? (
                                <Image src={displayImages[2]} alt="Photo 3" fill sizes="100vw" style={{ objectFit: 'cover' }} />
                            ) : (
                                'Photo'
                            )}
                        </div>
                    </div>
                </DropWrapper>

                {/* Stickers */}
                {/* Star sticker - bottom left of photos */}
                <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 20 }}
                    transition={{ delay: 0.6, duration: 0.4, ease: "backOut" }}
                    className={styles.starSticker}
                >
                    <Image src="/flower_stiker.png" alt="Star sticker" width={103} height={103} />
                </motion.div>

                {/* Flower sticker - top between photos */}
                <motion.div
                    initial={{ scale: 0, rotate: 30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.7, duration: 0.4, ease: "backOut" }}
                    className={styles.flowerSticker}
                >
                    <Image src="/star_icon.png" alt="Flower sticker" width={70} height={70} />
                </motion.div>

                {/* Clam sticker - bottom right of photos */}
                <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 26 }}
                    transition={{ delay: 0.8, duration: 0.4, ease: "backOut" }}
                    className={styles.clamSticker}
                >
                    <Image src="/clam_sticker.png" alt="Clam sticker" width={93} height={93} />
                </motion.div>

                {/* Message Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                    className={styles.messageSection}
                >
                    <p className={styles.messageGreeting}>{displayMessage.greeting}</p>
                    <p className={styles.messageContent}>{displayMessage.content}</p>

                    {/* Sign sticker - inside message, aligned right */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.1, duration: 0.4, ease: "backOut" }}
                        className={styles.signSticker}
                    >
                        <Image src="/sign_sticker.png" alt="Made with love sticker" width={89} height={89} />
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
