"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import styles from "../app/page.module.css";
import { generateLoveTextPattern } from "../utils/patterns";

interface CollageScreenProps {
    name1: string;
    name2: string;
    images?: string[]; // Optional array of 6 image URLs
}

export default function CollageScreen({ name1, name2, images }: CollageScreenProps) {
    // Drop animation wrapper - animates the wrapper, not the positioned element
    const DropWrapper = ({ children, delay, className, zIndex = 1 }: { children: React.ReactNode; delay: number; className?: string; zIndex?: number }) => (
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

    return (
        <div className={styles.collageContainer}>
            <div className={styles.collageBgOverlay}>
                <div className="love-text-pattern" style={{ opacity: 0.3 }}>
                    <div className="text-content">{generateLoveTextPattern()}</div>
                </div>
                <Image
                    src="/back-texture.png"
                    alt=""
                    fill
                    style={{ objectFit: 'cover', opacity: 0.2, mixBlendMode: 'multiply' }}
                />
            </div>
            <div className={styles.collageContent}>
                {/* Names + top stickers cluster */}
                <div className={styles.nameCluster}>
                    <Image src="/cherry.png" alt="Cherry" width={110} height={110} className={styles.cherryByNameLeft} />
                    <div className={`${styles.nameTag} ${styles.nameTagLeft}`}>{name1.toUpperCase()}</div>
                    <Image src="/heart_paper.png" alt="Heart paper" width={70} height={70} className={styles.heartPaperTopBetweenNames} />
                    <div className={`${styles.nameTag} ${styles.nameTagRight}`}>{name2.toUpperCase()}</div>
                    <Image src="/cherry.png" alt="Cherry" width={110} height={110} className={styles.cherryByNameRight} />
                </div>

                {/* Photo frame 1 - drops first */}
                <DropWrapper delay={0.1}>
                    <div className={`${styles.photoFrame} ${styles.photoFrameOne}`}>
                        <Image src="/khung_1.png" alt="frame" width={0} height={0} sizes="100vw" className={styles.photoFrameImg} />
                        <div className={styles.photoPlaceholder}>
                            {images?.[0] ? (
                                <Image src={images[0]} alt="Photo 1" fill style={{ objectFit: 'cover' }} />
                            ) : (
                                'Photo'
                            )}
                        </div>
                    </div>
                </DropWrapper>
                <Image src="/heart_paper.png" alt="Heart paper" width={70} height={70} className={styles.heartPaperFrameOneTopLeft} />

                {/* Photo frame 2 - drops second */}
                <DropWrapper delay={0.25}>
                    <div className={`${styles.photoFrame} ${styles.photoFrameTwo}`}>
                        <Image src="/stamp.png" alt="frame" width={0} height={0} sizes="100vw" className={styles.photoFrameImg} />
                        <div className={styles.photoPlaceholder}>
                            {images?.[1] ? (
                                <Image src={images[1]} alt="Photo 2" fill style={{ objectFit: 'cover' }} />
                            ) : (
                                'Photo'
                            )}
                        </div>
                    </div>
                </DropWrapper>

                {/* Heart pendant - drops third */}
                <DropWrapper delay={0.4}>
                    <div className={styles.heartPendantContainer}>
                        <Image
                            src="/heart_shape_pic.png"
                            alt="Heart pendant"
                            fill
                            sizes="100vw"
                            className={styles.heartPendantImg}
                        />
                        <div className={`${styles.heartPendantSlot} ${styles.heartPendantSlotLeft}`}>
                            {images?.[2] ? (
                                <Image src={images[2]} alt="Photo 3" fill style={{ objectFit: 'cover' }} />
                            ) : (
                                <span>Photo</span>
                            )}
                        </div>
                        <div className={`${styles.heartPendantSlot} ${styles.heartPendantSlotRight}`}>
                            {images?.[3] ? (
                                <Image src={images[3]} alt="Photo 4" fill style={{ objectFit: 'cover' }} />
                            ) : (
                                <span>Photo</span>
                            )}
                        </div>
                    </div>
                </DropWrapper>

                {/* Photo frame 3 - drops fourth */}
                <DropWrapper delay={0.7} zIndex={2}>
                    <div className={`${styles.photoFrame} ${styles.photoFrameThree}`}>
                        <Image src="/stamp.png" alt="frame" width={0} height={0} sizes="100vw" className={styles.photoFrameImg} />
                        <div className={styles.photoPlaceholder}>
                            {images?.[4] ? (
                                <Image src={images[4]} alt="Photo 5" fill style={{ objectFit: 'cover' }} />
                            ) : (
                                'Photo'
                            )}
                        </div>
                    </div>
                </DropWrapper>

                {/* Photo frame 4 - drops fifth */}
                <DropWrapper delay={0.55} zIndex={1}>
                    <div className={`${styles.photoFrame} ${styles.photoFrameFour}`}>
                        <Image src="/khung_2.png" alt="frame" width={0} height={0} sizes="100vw" className={styles.photoFrameImg} />
                        <div className={styles.photoPlaceholder}>
                            {images?.[5] ? (
                                <Image src={images[5]} alt="Photo 6" fill style={{ objectFit: 'cover' }} />
                            ) : (
                                'Photo'
                            )}
                        </div>
                    </div>
                </DropWrapper>

                {/* Heart paper stickers around pendant */}
                <Image src="/heart_paper.png" alt="Heart paper" width={70} height={70} className={styles.heartPaperPendantTop} />
                <Image src="/heart_paper.png" alt="Heart paper" width={70} height={70} className={styles.heartPaperPendantLeft} />
                <Image src="/heart_paper.png" alt="Heart paper" width={70} height={70} className={styles.heartPaperPendantRight} />

                {/* Heart paper on bottom-right of frame four */}
                <Image src="/heart_paper.png" alt="Heart paper" width={70} height={70} className={styles.heartPaperFrameFour} />

            </div>
        </div>
    );
}
