"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FiCamera } from "react-icons/fi";
import collageStyles from "../../../page.module.css";
import LetterScreen from "../../../../components/LetterScreen";
import { generateLoveTextPattern } from "../../../../utils/patterns";

export default function PreviewPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const [name1, setName1] = useState("");
    const [name2, setName2] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [letterImages, setLetterImages] = useState<string[]>([]);
    const [letterMessage, setLetterMessage] = useState({ greeting: "Dear em iu ,", content: "" });
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentScreen, setCurrentScreen] = useState<'collage' | 'letter'>('collage');

    useEffect(() => {
        // Get data from localStorage (set by parent window)
        const previewData = localStorage.getItem(`preview_${token}`);
        if (previewData) {
            const data = JSON.parse(previewData);
            setName1(data.name1 || "");
            setName2(data.name2 || "");
            setImages(data.images || []);
            setLetterImages(data.letterImages || []);
            setLetterMessage(data.letterMessage || { greeting: "Dear em iu ,", content: "" });
        }
        setIsLoaded(true);

        // Listen for updates from parent
        const handleMessage = (e: MessageEvent) => {
            if (e.data.type === 'preview_update') {
                setName1(e.data.name1);
                setName2(e.data.name2);
                setImages(e.data.images);
                setLetterImages(e.data.letterImages || []);
                setLetterMessage(e.data.letterMessage || { greeting: "Dear em iu ,", content: "" });
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [token]);

    if (!isLoaded) {
        return <div style={{ background: '#ffe3e6', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Dancing Script, cursive', color: '#891008', fontSize: 24 }}>Đang tải...</div>;
    }

    // Screen toggle button
    const ScreenToggle = () => (
        <div style={{
            position: 'fixed',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            display: 'flex',
            gap: 8,
            background: 'rgba(255,255,255,0.9)',
            padding: 8,
            borderRadius: 24,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
            <button
                onClick={() => setCurrentScreen('collage')}
                style={{
                    padding: '8px 16px',
                    borderRadius: 16,
                    border: 'none',
                    background: currentScreen === 'collage' ? '#891008' : 'transparent',
                    color: currentScreen === 'collage' ? 'white' : '#891008',
                    fontFamily: 'Dancing Script, cursive',
                    fontSize: 14,
                    cursor: 'pointer'
                }}
            >
                Collage
            </button>
            <button
                onClick={() => setCurrentScreen('letter')}
                style={{
                    padding: '8px 16px',
                    borderRadius: 16,
                    border: 'none',
                    background: currentScreen === 'letter' ? '#891008' : 'transparent',
                    color: currentScreen === 'letter' ? 'white' : '#891008',
                    fontFamily: 'Dancing Script, cursive',
                    fontSize: 14,
                    cursor: 'pointer'
                }}
            >
                Thư tình
            </button>
        </div>
    );

    if (currentScreen === 'letter') {
        return (
            <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
                <LetterScreen
                    name1={name1}
                    name2={name2}
                    images={letterImages && letterImages.length > 0 && letterImages.some(img => img) ? letterImages : images.slice(0, 3)}
                    message={letterMessage}
                />
                <ScreenToggle />
            </div>
        );
    }

    return (
        <div className={collageStyles.collageContainer}>
            <div className={collageStyles.collageBgOverlay}>
                <div className="love-text-pattern" style={{ opacity: 0.3 }}>
                    <div className="text-content">{generateLoveTextPattern()}</div>
                </div>
                <Image src="/back-texture.png" alt="" fill style={{ objectFit: 'cover', opacity: 0.2, mixBlendMode: 'multiply' }} />
            </div>
            <div className={collageStyles.collageContent}>
                {/* Names */}
                <div className={collageStyles.nameCluster}>
                    <Image src="/cherry.png" alt="Cherry" width={110} height={110} className={collageStyles.cherryByNameLeft} />
                    <div className={`${collageStyles.nameTag} ${collageStyles.nameTagLeft}`}>{(name1 || "TÊN 1").toUpperCase()}</div>
                    <Image src="/heart_paper.png" alt="Heart" width={70} height={70} className={collageStyles.heartPaperTopBetweenNames} />
                    <div className={`${collageStyles.nameTag} ${collageStyles.nameTagRight}`}>{(name2 || "TÊN 2").toUpperCase()}</div>
                    <Image src="/cherry.png" alt="Cherry" width={110} height={110} className={collageStyles.cherryByNameRight} />
                </div>

                {/* Frame 1 */}
                <motion.div initial={{ y: -200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }} style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, pointerEvents: 'none' }}>
                    <div style={{ pointerEvents: 'auto' }}>
                        <div className={`${collageStyles.photoFrame} ${collageStyles.photoFrameOne}`}>
                            <Image src="/khung_1.png" alt="frame" width={0} height={0} sizes="100vw" className={collageStyles.photoFrameImg} />
                            <div className={collageStyles.photoPlaceholder}>
                                {images[0] ? <Image src={images[0]} alt="Photo 1" fill style={{ objectFit: 'cover' }} /> : <FiCamera />}
                            </div>
                        </div>
                    </div>
                </motion.div>
                <Image src="/heart_paper.png" alt="Heart" width={70} height={70} className={collageStyles.heartPaperFrameOneTopLeft} />

                {/* Frame 2 */}
                <motion.div initial={{ y: -200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.25, ease: [0.34, 1.56, 0.64, 1] }} style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, pointerEvents: 'none' }}>
                    <div style={{ pointerEvents: 'auto' }}>
                        <div className={`${collageStyles.photoFrame} ${collageStyles.photoFrameTwo}`}>
                            <Image src="/stamp.png" alt="frame" width={0} height={0} sizes="100vw" className={collageStyles.photoFrameImg} />
                            <div className={collageStyles.photoPlaceholder}>
                                {images[1] ? <Image src={images[1]} alt="Photo 2" fill style={{ objectFit: 'cover' }} /> : <FiCamera />}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Heart pendant */}
                <motion.div initial={{ y: -200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.4, ease: [0.34, 1.56, 0.64, 1] }} style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, pointerEvents: 'none' }}>
                    <div style={{ pointerEvents: 'auto' }}>
                        <div className={collageStyles.heartPendantContainer}>
                            <Image src="/heart_shape_pic.png" alt="Heart" fill sizes="100vw" className={collageStyles.heartPendantImg} />
                            <div className={`${collageStyles.heartPendantSlot} ${collageStyles.heartPendantSlotLeft}`}>
                                {images[2] ? <Image src={images[2]} alt="Photo 3" fill style={{ objectFit: 'cover' }} /> : <FiCamera />}
                            </div>
                            <div className={`${collageStyles.heartPendantSlot} ${collageStyles.heartPendantSlotRight}`}>
                                {images[3] ? <Image src={images[3]} alt="Photo 4" fill style={{ objectFit: 'cover' }} /> : <FiCamera />}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Frame 3 */}
                <motion.div initial={{ y: -200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.7, ease: [0.34, 1.56, 0.64, 1] }} style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, pointerEvents: 'none', zIndex: 2 }}>
                    <div style={{ pointerEvents: 'auto' }}>
                        <div className={`${collageStyles.photoFrame} ${collageStyles.photoFrameThree}`}>
                            <Image src="/stamp.png" alt="frame" width={0} height={0} sizes="100vw" className={collageStyles.photoFrameImg} />
                            <div className={collageStyles.photoPlaceholder}>
                                {images[4] ? <Image src={images[4]} alt="Photo 5" fill style={{ objectFit: 'cover' }} /> : <FiCamera />}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Frame 4 */}
                <motion.div initial={{ y: -200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.55, ease: [0.34, 1.56, 0.64, 1] }} style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }}>
                    <div style={{ pointerEvents: 'auto' }}>
                        <div className={`${collageStyles.photoFrame} ${collageStyles.photoFrameFour}`}>
                            <Image src="/khung_2.png" alt="frame" width={0} height={0} sizes="100vw" className={collageStyles.photoFrameImg} />
                            <div className={collageStyles.photoPlaceholder}>
                                {images[5] ? <Image src={images[5]} alt="Photo 6" fill style={{ objectFit: 'cover' }} /> : <FiCamera />}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Decorations */}
                <Image src="/heart_paper.png" alt="Heart" width={70} height={70} className={collageStyles.heartPaperPendantTop} />
                <Image src="/heart_paper.png" alt="Heart" width={70} height={70} className={collageStyles.heartPaperPendantLeft} />
                <Image src="/heart_paper.png" alt="Heart" width={70} height={70} className={collageStyles.heartPaperPendantRight} />
                <Image src="/heart_paper.png" alt="Heart" width={70} height={70} className={collageStyles.heartPaperFrameFour} />
            </div>
            <ScreenToggle />
        </div>
    );
}
