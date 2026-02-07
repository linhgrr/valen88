"use client";

import { useState, useRef, useEffect, use, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FiCamera, FiCopy, FiEye, FiClock, FiLoader, FiX, FiAlertCircle } from "react-icons/fi";
import { FaHeart, FaHeartBroken } from "react-icons/fa";
import styles from "./create.module.css";
import collageStyles from "../../page.module.css";
import { generateLoveTextPattern } from "../../../utils/patterns";
import DesktopWarning from "../../../components/DesktopWarning";
import LetterScreen from "../../../components/LetterScreen";

interface UploadedImage {
    file: File | null;
    preview: string;
    url: string;
}

interface CreatedCard {
    slug: string;
    name1: string;
    name2: string;
    qrCode: string;
    link: string;
}

const IMAGE_LABELS = [
    "Ảnh khung 1",
    "Ảnh khung 2",
    "Ảnh tim trái",
    "Ảnh tim phải",
    "Ảnh khung 3",
    "Ảnh khung 4",
];

const LETTER_IMAGE_LABELS = [
    "Ảnh thư 1",
    "Ảnh thư 2",
    "Ảnh thư 3",
];

export default function CreatePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const [name1, setName1] = useState("");
    const [name2, setName2] = useState("");
    const [images, setImages] = useState<UploadedImage[]>(() => 
        Array.from({ length: 6 }, () => ({ file: null, preview: "", url: "" }))
    );
    const [letterImages, setLetterImages] = useState<UploadedImage[]>(() =>
        Array.from({ length: 3 }, () => ({ file: null, preview: "", url: "" }))
    );
    const [letterGreeting, setLetterGreeting] = useState("Dear em iu ,");
    const [letterContent, setLetterContent] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createdCard, setCreatedCard] = useState<CreatedCard | null>(null);
    const [error, setError] = useState("");
    const [isValidating, setIsValidating] = useState(true);
    const [isValid, setIsValid] = useState(false);
    const [linkError, setLinkError] = useState("");
    const [showPreview, setShowPreview] = useState(false);
    const [previewScreen, setPreviewScreen] = useState<'collage' | 'letter'>('collage');
    const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
    const [isMobile, setIsMobile] = useState(true);
    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const letterFileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const previewFileInputRef = useRef<HTMLInputElement | null>(null);
    const letterPreviewFileInputRef = useRef<HTMLInputElement | null>(null);
    const previewPopupRef = useRef<Window | null>(null);
    const [editingLetterImageIndex, setEditingLetterImageIndex] = useState<number | null>(null);

    // Mobile detection
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 500);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Open preview as popup on desktop
    const openPreviewPopup = () => {
        // Save data to localStorage for popup to read
        const previewData = {
            name1,
            name2,
            images: images.map(img => img.preview),
            letterImages: letterImages.map(img => img.preview),
            letterMessage: { greeting: letterGreeting, content: letterContent }
        };
        localStorage.setItem(`preview_${token}`, JSON.stringify(previewData));

        // Open popup with mobile size
        const popupWidth = 400;
        const popupHeight = 750;
        const left = (window.innerWidth - popupWidth) / 2;
        const top = (window.innerHeight - popupHeight) / 2;

        previewPopupRef.current = window.open(
            `/create/${token}/preview`,
            'preview',
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=no`
        );
    };

    const handlePreview = () => {
        if (!canPreview) return;

        if (isMobile) {
            setShowPreview(true);
        } else {
            openPreviewPopup();
        }
    };

    // Validate token on mount
    useEffect(() => {
        const validateToken = async () => {
            try {
                const response = await fetch(`/api/links/${token}`);
                const data = await response.json();

                if (data.valid) {
                    setIsValid(true);
                } else if (data.used) {
                    setLinkError("Link này đã được sử dụng rồi!");
                } else {
                    setLinkError("Link không hợp lệ hoặc đã hết hạn");
                }
            } catch (err) {
                setLinkError("Có lỗi xảy ra khi kiểm tra link");
            } finally {
                setIsValidating(false);
            }
        };

        validateToken();
    }, [token]);

    const handleImageSelect = useCallback((index: number, file: File) => {
        // Use functional setState to avoid stale closures (rerender-functional-setstate)
        setImages(prev => {
            const newImages = [...prev];
            newImages[index] = {
                file,
                preview: URL.createObjectURL(file),
                url: "",
            };
            return newImages;
        });
    }, []);

    const handleLetterImageSelect = useCallback((index: number, file: File) => {
        // Use functional setState to avoid stale closures (rerender-functional-setstate)
        setLetterImages(prev => {
            const newImages = [...prev];
            newImages[index] = {
                file,
                preview: URL.createObjectURL(file),
                url: "",
            };
            return newImages;
        });
    }, []);

    const handlePreviewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0] && editingImageIndex !== null) {
            handleImageSelect(editingImageIndex, e.target.files[0]);
            setEditingImageIndex(null);
        }
    };

    const handleLetterPreviewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0] && editingLetterImageIndex !== null) {
            handleLetterImageSelect(editingLetterImageIndex, e.target.files[0]);
            setEditingLetterImageIndex(null);
        }
    };

    const uploadImage = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || "Upload failed");
        }

        return data.url;
    };

    const uploadedCount = images.filter(img => img.preview).length;
    const canPreview = uploadedCount === 6 && name1.trim() && name2.trim();
    const hasAnyImage = uploadedCount > 0;

    const handleCreateCard = async () => {
        setError("");

        if (!name1.trim() || !name2.trim()) {
            setError("Vui lòng nhập tên cả hai người");
            return;
        }

        const missingImages = images.filter((img) => !img.file && !img.url);
        if (missingImages.length > 0) {
            setError("Vui lòng upload đủ 6 ảnh");
            return;
        }

        try {
            setIsUploading(true);

            // Upload all images in parallel (async-parallel) - 80% faster than sequential
            const imageUploadPromises = images.map(async (img, i) => {
                if (img.url) return img.url;
                if (img.file) return uploadImage(img.file);
                return "";
            });

            const letterImageUploadPromises = letterImages.map(async (img) => {
                if (img.url) return img.url;
                if (img.file) return uploadImage(img.file);
                return "";
            });

            // Wait for all uploads to complete in parallel
            const [uploadedUrls, uploadedLetterUrls] = await Promise.all([
                Promise.all(imageUploadPromises),
                Promise.all(letterImageUploadPromises)
            ]);

            // Filter out empty strings from letter images
            const filteredLetterUrls = uploadedLetterUrls.filter(url => url !== "");

            setIsUploading(false);
            setIsCreating(true);

            console.log('Submitting card data:', {
                letterImages: filteredLetterUrls,
                letterMessage: { greeting: letterGreeting, content: letterContent }
            });

            const response = await fetch("/api/cards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name1: name1.trim(),
                    name2: name2.trim(),
                    images: uploadedUrls,
                    letterImages: filteredLetterUrls,
                    letterMessage: { greeting: letterGreeting, content: letterContent },
                }),
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || "Failed to create card");
            }

            await fetch(`/api/links/${token}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cardId: data.card.id }),
            });

            const cardLink = `${window.location.origin}/card/${data.card.slug}`;

            // Dynamic import QRCode only when needed (bundle-dynamic-imports)
            const QRCode = await import('qrcode');
            const qrCode = await QRCode.toDataURL(cardLink, {
                width: 300,
                margin: 2,
                color: { dark: "#891008", light: "#fff" },
            });

            setCreatedCard({
                slug: data.card.slug,
                name1: data.card.name1,
                name2: data.card.name2,
                qrCode,
                link: cardLink,
            });
        } catch (err: any) {
            setError(err.message || "Có lỗi xảy ra");
        } finally {
            setIsUploading(false);
            setIsCreating(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Đã copy link!");
    };

    // Loading state
    if (isValidating) {
        return (
            <div className={styles.container}>
                <div className={styles.statusCard}>
                    <FiLoader className={styles.spinIcon} />
                    <h1 className={styles.statusTitle}>Đang kiểm tra...</h1>
                    <p className={styles.statusText}>Vui lòng đợi trong giây lát</p>
                </div>
            </div>
        );
    }

    // Invalid or expired link
    if (!isValid) {
        return (
            <div className={styles.container}>
                <div className={styles.statusCard}>
                    <FaHeartBroken className={styles.errorIcon} />
                    <h1 className={styles.statusTitle}>Không thể tạo thiệp</h1>
                    <p className={styles.errorText}>{linkError}</p>
                    <p className={styles.statusText}>Vui lòng liên hệ để nhận link mới</p>
                </div>
            </div>
        );
    }

    // Success state
    if (createdCard) {
        return (
            <div className={styles.container}>
                <div className={styles.successCard}>
                    <FaHeart className={styles.successIcon} />
                    <h1 className={styles.successTitle}>Thiệp đã được tạo!</h1>
                    <div className={styles.namesDisplay}>
                        <span>{createdCard.name1}</span>
                        <FaHeart className={styles.heartSmall} />
                        <span>{createdCard.name2}</span>
                    </div>
                    <div className={styles.qrSection}>
                        <Image
                            src={createdCard.qrCode}
                            alt="QR Code"
                            width={200}
                            height={200}
                            className={styles.qrCode}
                        />
                        <p className={styles.qrHint}>Quét QR để xem thiệp</p>
                    </div>
                    <div className={styles.linkBox}>
                        <input type="text" value={createdCard.link} readOnly className={styles.linkInput} />
                        <button onClick={() => copyToClipboard(createdCard.link)} className={styles.copyBtn}>
                            <FiCopy /> Copy
                        </button>
                    </div>
                    <a href={createdCard.link} target="_blank" rel="noopener noreferrer" className={styles.viewBtn}>
                        <FiEye /> Xem thiệp
                    </a>
                </div>
            </div>
        );
    }

    // Full-screen Preview
    if (showPreview) {
        // Show desktop warning if not on mobile
        if (!isMobile) {
            return (
                <div style={{ position: 'relative' }}>
                    <button
                        className={styles.previewCloseBtn}
                        onClick={() => setShowPreview(false)}
                        style={{ position: 'fixed', top: 16, right: 16, zIndex: 1001 }}
                    >
                        <FiX /> Đóng
                    </button>
                    <DesktopWarning />
                </div>
            );
        }

        return (
            <div className={styles.previewFullscreen}>
                <input
                    type="file"
                    accept="image/*"
                    ref={previewFileInputRef}
                    onChange={handlePreviewImageChange}
                    style={{ display: "none" }}
                />
                <input
                    type="file"
                    accept="image/*"
                    ref={letterPreviewFileInputRef}
                    onChange={handleLetterPreviewImageChange}
                    style={{ display: "none" }}
                />
                <button className={styles.previewCloseBtn} onClick={() => setShowPreview(false)}>
                    <FiX /> Đóng
                </button>
                <div className={styles.previewHint}>Nhấn vào ảnh để thay đổi</div>

                {/* Screen Toggle */}
                <div style={{
                    position: 'fixed',
                    bottom: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1001,
                    display: 'flex',
                    gap: 8,
                    background: 'rgba(255,255,255,0.9)',
                    padding: 8,
                    borderRadius: 24,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                    <button
                        onClick={() => setPreviewScreen('collage')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: 16,
                            border: 'none',
                            background: previewScreen === 'collage' ? '#891008' : 'transparent',
                            color: previewScreen === 'collage' ? 'white' : '#891008',
                            fontFamily: 'Dancing Script, cursive',
                            fontSize: 14,
                            cursor: 'pointer'
                        }}
                    >
                        Collage
                    </button>
                    <button
                        onClick={() => setPreviewScreen('letter')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: 16,
                            border: 'none',
                            background: previewScreen === 'letter' ? '#891008' : 'transparent',
                            color: previewScreen === 'letter' ? 'white' : '#891008',
                            fontFamily: 'Dancing Script, cursive',
                            fontSize: 14,
                            cursor: 'pointer'
                        }}
                    >
                        Thư tình
                    </button>
                </div>

                {previewScreen === 'letter' ? (
                    <LetterScreen
                        name1={name1}
                        name2={name2}
                        images={letterImages.some(img => img.preview) ? letterImages.map(img => img.preview) : images.slice(0, 3).map(img => img.preview)}
                        message={{ greeting: letterGreeting, content: letterContent }}
                    />
                ) : (
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
                            <div className={`${collageStyles.nameTag} ${collageStyles.nameTagLeft}`}>{name1.toUpperCase() || "TÊN 1"}</div>
                            <Image src="/heart_paper.png" alt="Heart" width={70} height={70} className={collageStyles.heartPaperTopBetweenNames} />
                            <div className={`${collageStyles.nameTag} ${collageStyles.nameTagRight}`}>{name2.toUpperCase() || "TÊN 2"}</div>
                            <Image src="/cherry.png" alt="Cherry" width={110} height={110} className={collageStyles.cherryByNameRight} />
                        </div>

                        {/* Frame 1 */}
                        <motion.div initial={{ y: -200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }} style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, pointerEvents: 'none' }}>
                            <div style={{ pointerEvents: 'auto' }}>
                                <div className={`${collageStyles.photoFrame} ${collageStyles.photoFrameOne}`} onClick={() => { setEditingImageIndex(0); previewFileInputRef.current?.click(); }}>
                                    <Image src="/khung_1.png" alt="frame" width={0} height={0} sizes="100vw" className={collageStyles.photoFrameImg} />
                                    <div className={collageStyles.photoPlaceholder}>
                                        {images[0]?.preview ? <Image src={images[0].preview} alt="Photo 1" fill style={{ objectFit: 'cover' }} /> : <FiCamera />}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        <Image src="/heart_paper.png" alt="Heart" width={70} height={70} className={collageStyles.heartPaperFrameOneTopLeft} />

                        {/* Frame 2 */}
                        <motion.div initial={{ y: -200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.25, ease: [0.34, 1.56, 0.64, 1] }} style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, pointerEvents: 'none' }}>
                            <div style={{ pointerEvents: 'auto' }}>
                                <div className={`${collageStyles.photoFrame} ${collageStyles.photoFrameTwo}`} onClick={() => { setEditingImageIndex(1); previewFileInputRef.current?.click(); }}>
                                    <Image src="/stamp.png" alt="frame" width={0} height={0} sizes="100vw" className={collageStyles.photoFrameImg} />
                                    <div className={collageStyles.photoPlaceholder}>
                                        {images[1]?.preview ? <Image src={images[1].preview} alt="Photo 2" fill style={{ objectFit: 'cover' }} /> : <FiCamera />}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Heart pendant */}
                        <motion.div initial={{ y: -200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.4, ease: [0.34, 1.56, 0.64, 1] }} style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, pointerEvents: 'none' }}>
                            <div style={{ pointerEvents: 'auto' }}>
                                <div className={collageStyles.heartPendantContainer}>
                                    <Image src="/heart_shape_pic.png" alt="Heart" fill sizes="100vw" className={collageStyles.heartPendantImg} />
                                    <div className={`${collageStyles.heartPendantSlot} ${collageStyles.heartPendantSlotLeft}`} onClick={() => { setEditingImageIndex(2); previewFileInputRef.current?.click(); }}>
                                        {images[2]?.preview ? <Image src={images[2].preview} alt="Photo 3" fill style={{ objectFit: 'cover' }} /> : <FiCamera />}
                                    </div>
                                    <div className={`${collageStyles.heartPendantSlot} ${collageStyles.heartPendantSlotRight}`} onClick={() => { setEditingImageIndex(3); previewFileInputRef.current?.click(); }}>
                                        {images[3]?.preview ? <Image src={images[3].preview} alt="Photo 4" fill style={{ objectFit: 'cover' }} /> : <FiCamera />}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Frame 3 */}
                        <motion.div initial={{ y: -200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.7, ease: [0.34, 1.56, 0.64, 1] }} style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, pointerEvents: 'none', zIndex: 2 }}>
                            <div style={{ pointerEvents: 'auto' }}>
                                <div className={`${collageStyles.photoFrame} ${collageStyles.photoFrameThree}`} onClick={() => { setEditingImageIndex(4); previewFileInputRef.current?.click(); }}>
                                    <Image src="/stamp.png" alt="frame" width={0} height={0} sizes="100vw" className={collageStyles.photoFrameImg} />
                                    <div className={collageStyles.photoPlaceholder}>
                                        {images[4]?.preview ? <Image src={images[4].preview} alt="Photo 5" fill style={{ objectFit: 'cover' }} /> : <FiCamera />}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Frame 4 */}
                        <motion.div initial={{ y: -200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.55, ease: [0.34, 1.56, 0.64, 1] }} style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }}>
                            <div style={{ pointerEvents: 'auto' }}>
                                <div className={`${collageStyles.photoFrame} ${collageStyles.photoFrameFour}`} onClick={() => { setEditingImageIndex(5); previewFileInputRef.current?.click(); }}>
                                    <Image src="/khung_2.png" alt="frame" width={0} height={0} sizes="100vw" className={collageStyles.photoFrameImg} />
                                    <div className={collageStyles.photoPlaceholder}>
                                        {images[5]?.preview ? <Image src={images[5].preview} alt="Photo 6" fill style={{ objectFit: 'cover' }} /> : <FiCamera />}
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
                </div>
                )}
            </div>
        );
    }

    // Create form
    return (
        <div className={styles.container}>
            <div className={styles.formCard}>
                <h1 className={styles.title}>
                    <FaHeart className={styles.titleIcon} /> Tạo Thiệp Valentine
                </h1>

                {error && <div className={styles.error}>{error}</div>}

                {/* Names Section */}
                <div className={styles.namesSection}>
                    <div className={styles.nameField}>
                        <label>Tên người 1</label>
                        <input type="text" value={name1} onChange={(e) => setName1(e.target.value)} placeholder="Nhập tên..." />
                    </div>
                    <div className={styles.heartDivider}><FaHeart /></div>
                    <div className={styles.nameField}>
                        <label>Tên người 2</label>
                        <input type="text" value={name2} onChange={(e) => setName2(e.target.value)} placeholder="Nhập tên..." />
                    </div>
                </div>

                {/* Images Section */}
                <div className={styles.imagesSection}>
                    <h2>Upload 6 ảnh cho trang Collage</h2>
                    <div className={styles.imageGrid}>
                        {IMAGE_LABELS.map((label, index) => (
                            <div key={index} className={styles.imageItem}>
                                <span className={styles.imageLabel}>{label}</span>
                                <div className={styles.imageBox} onClick={() => fileInputRefs.current[index]?.click()}>
                                    {images[index].preview ? (
                                        <Image src={images[index].preview} alt={`Preview ${index + 1}`} fill style={{ objectFit: "cover" }} />
                                    ) : (
                                        <div className={styles.imagePlaceholder}>
                                            <FiCamera />
                                            <span>Chọn ảnh</span>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={(el) => { fileInputRefs.current[index] = el; }}
                                    onChange={(e) => { if (e.target.files?.[0]) handleImageSelect(index, e.target.files[0]); }}
                                    style={{ display: "none" }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Letter Images Section */}
                <div className={styles.imagesSection}>
                    <h2>Upload 3 ảnh cho trang Thư tình</h2>
                    <div className={styles.imageGrid}>
                        {LETTER_IMAGE_LABELS.map((label, index) => (
                            <div key={index} className={styles.imageItem}>
                                <span className={styles.imageLabel}>{label}</span>
                                <div className={styles.imageBox} onClick={() => letterFileInputRefs.current[index]?.click()}>
                                    {letterImages[index].preview ? (
                                        <Image src={letterImages[index].preview} alt={`Letter Preview ${index + 1}`} fill style={{ objectFit: "cover" }} />
                                    ) : (
                                        <div className={styles.imagePlaceholder}>
                                            <FiCamera />
                                            <span>Chọn ảnh</span>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={(el) => { letterFileInputRefs.current[index] = el; }}
                                    onChange={(e) => { if (e.target.files?.[0]) handleLetterImageSelect(index, e.target.files[0]); }}
                                    style={{ display: "none" }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Letter Message Section */}
                <div className={styles.messageSection}>
                    <h2>Nội dung thư tình</h2>
                    <div className={styles.messageField}>
                        <label>Lời chào</label>
                        <input
                            type="text"
                            value={letterGreeting}
                            onChange={(e) => setLetterGreeting(e.target.value)}
                            placeholder="Dear em iu ,"
                        />
                    </div>
                    <div className={styles.messageField}>
                        <label>Nội dung</label>
                        <textarea
                            value={letterContent}
                            onChange={(e) => setLetterContent(e.target.value)}
                            placeholder="Viết lời yêu thương của bạn ở đây..."
                            rows={5}
                        />
                    </div>
                </div>

                {/* Preview Button - Always visible */}
                <div className={styles.previewSection}>
                    <button
                        className={`${styles.previewToggle} ${!canPreview ? styles.previewDisabled : ''}`}
                        onClick={handlePreview}
                        disabled={!canPreview}
                    >
                        <FiEye /> Xem trước kết quả
                    </button>
                    {!canPreview && (
                        <p className={styles.previewWarning}>
                            <FiAlertCircle />
                            {!name1.trim() || !name2.trim()
                                ? "Vui lòng nhập tên cả 2 người"
                                : `Còn thiếu ${6 - uploadedCount} ảnh`}
                        </p>
                    )}
                </div>

                {/* Create Button */}
                <button className={styles.createBtn} onClick={handleCreateCard} disabled={isUploading || isCreating}>
                    {isUploading ? <><FiClock /> Đang upload ảnh...</> : isCreating ? <><FiClock /> Đang tạo thiệp...</> : <><FaHeart /> Tạo Thiệp</>}
                </button>
            </div>
        </div>
    );
}
