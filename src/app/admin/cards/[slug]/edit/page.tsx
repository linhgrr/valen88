"use client";

import { useState, useRef, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiCamera, FiArrowLeft, FiLoader } from "react-icons/fi";
import { FaHeart, FaSave } from "react-icons/fa";
import styles from "./edit.module.css";
import { compressImage } from "../../../../../utils/imageCompression";

interface CardData {
    name1: string;
    name2: string;
    images: string[];
    letterImages: string[];
    letterMessage: {
        greeting: string;
        content: string;
    };
    slug: string;
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

export default function EditCardPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [name1, setName1] = useState("");
    const [name2, setName2] = useState("");
    // Store current image URLs (from server)
    const [imageUrls, setImageUrls] = useState<string[]>(Array(6).fill(""));
    // Store new files selected by user (null = keep existing)
    const [newImageFiles, setNewImageFiles] = useState<(File | null)[]>(Array(6).fill(null));
    // Preview URLs for new files
    const [imagePreviews, setImagePreviews] = useState<string[]>(Array(6).fill(""));

    const [letterImageUrls, setLetterImageUrls] = useState<string[]>([]);
    const [newLetterFiles, setNewLetterFiles] = useState<(File | null)[]>(Array(3).fill(null));
    const [letterPreviews, setLetterPreviews] = useState<string[]>(Array(3).fill(""));

    const [letterGreeting, setLetterGreeting] = useState("");
    const [letterContent, setLetterContent] = useState("");

    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const letterFileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Fetch existing card data
    useEffect(() => {
        const fetchCard = async () => {
            try {
                const response = await fetch(`/api/cards/${slug}`);
                const data = await response.json();

                if (data.success) {
                    const card: CardData = data.card;
                    setName1(card.name1);
                    setName2(card.name2);
                    setImageUrls(card.images);
                    setLetterImageUrls(card.letterImages || []);
                    setLetterGreeting(card.letterMessage?.greeting || "Dear em iu ,");
                    setLetterContent(card.letterMessage?.content || "");
                } else {
                    setError("Không tìm thấy thiệp");
                }
            } catch {
                setError("Có lỗi xảy ra khi tải thiệp");
            } finally {
                setLoading(false);
            }
        };

        fetchCard();
    }, [slug]);

    const handleImageSelect = (index: number, file: File) => {
        const preview = URL.createObjectURL(file);
        setNewImageFiles(prev => {
            const updated = [...prev];
            updated[index] = file;
            return updated;
        });
        setImagePreviews(prev => {
            const updated = [...prev];
            updated[index] = preview;
            return updated;
        });
    };

    const handleLetterImageSelect = (index: number, file: File) => {
        const preview = URL.createObjectURL(file);
        setNewLetterFiles(prev => {
            const updated = [...prev];
            updated[index] = file;
            return updated;
        });
        setLetterPreviews(prev => {
            const updated = [...prev];
            updated[index] = preview;
            return updated;
        });
    };

    const uploadImage = async (file: File): Promise<string> => {
        const compressed = await compressImage(file);
        const formData = new FormData();
        formData.append("image", compressed);

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

    const handleSave = async () => {
        setError("");
        setSuccess("");

        if (!name1.trim() || !name2.trim()) {
            setError("Vui lòng nhập tên cả hai người");
            return;
        }

        try {
            setSaving(true);

            // Upload any new collage images
            const finalImageUrls = [...imageUrls];
            const uploadPromises: Promise<void>[] = [];

            newImageFiles.forEach((file, i) => {
                if (file) {
                    uploadPromises.push(
                        uploadImage(file).then(url => {
                            finalImageUrls[i] = url;
                        })
                    );
                }
            });

            // Upload any new letter images
            const finalLetterUrls = [...letterImageUrls];
            // Ensure array has 3 slots
            while (finalLetterUrls.length < 3) finalLetterUrls.push("");

            newLetterFiles.forEach((file, i) => {
                if (file) {
                    uploadPromises.push(
                        uploadImage(file).then(url => {
                            finalLetterUrls[i] = url;
                        })
                    );
                }
            });

            await Promise.all(uploadPromises);

            // Filter empty letter URLs
            const filteredLetterUrls = finalLetterUrls.filter(url => url !== "");

            // Update card via PUT
            const response = await fetch(`/api/cards/${slug}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name1: name1.trim(),
                    name2: name2.trim(),
                    images: finalImageUrls,
                    letterImages: filteredLetterUrls,
                    letterMessage: { greeting: letterGreeting, content: letterContent },
                }),
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || "Failed to update card");
            }

            // Update local state with saved data
            setImageUrls(finalImageUrls);
            setLetterImageUrls(filteredLetterUrls);
            setNewImageFiles(Array(6).fill(null));
            setNewLetterFiles(Array(3).fill(null));
            setImagePreviews(Array(6).fill(""));
            setLetterPreviews(Array(3).fill(""));
            setSuccess("Đã lưu thay đổi thành công!");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingContainer}>
                    <FiLoader className={styles.spinIcon} />
                    <p className={styles.loadingText}>Đang tải thiệp...</p>
                </div>
            </div>
        );
    }

    if (error && !name1) {
        return (
            <div className={styles.container}>
                <div className={styles.formCard}>
                    <div className={styles.error}>{error}</div>
                    <Link href="/admin/cards" className={styles.backLink}>
                        <FiArrowLeft /> Quay lại
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.formCard}>
                <Link href="/admin/cards" className={styles.backLink}>
                    <FiArrowLeft /> Quay lại danh sách
                </Link>

                <h1 className={styles.title}>
                    <FaHeart /> Sửa Thiệp
                </h1>

                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}

                {/* Names Section */}
                <div className={styles.namesSection}>
                    <div className={styles.nameField}>
                        <label>Tên người 1</label>
                        <input
                            type="text"
                            value={name1}
                            onChange={(e) => setName1(e.target.value)}
                            placeholder="Nhập tên..."
                        />
                    </div>
                    <div className={styles.heartDivider}><FaHeart /></div>
                    <div className={styles.nameField}>
                        <label>Tên người 2</label>
                        <input
                            type="text"
                            value={name2}
                            onChange={(e) => setName2(e.target.value)}
                            placeholder="Nhập tên..."
                        />
                    </div>
                </div>

                {/* Collage Images */}
                <div className={styles.imagesSection}>
                    <h2>6 ảnh trang Collage</h2>
                    <div className={styles.imageGrid}>
                        {IMAGE_LABELS.map((label, index) => (
                            <div key={index} className={styles.imageItem}>
                                <span className={styles.imageLabel}>{label}</span>
                                <div
                                    className={styles.imageBox}
                                    onClick={() => fileInputRefs.current[index]?.click()}
                                >
                                    {(imagePreviews[index] || imageUrls[index]) ? (
                                        <Image
                                            src={imagePreviews[index] || imageUrls[index]}
                                            alt={`Ảnh ${index + 1}`}
                                            fill
                                            style={{ objectFit: "cover" }}
                                        />
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
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) handleImageSelect(index, e.target.files[0]);
                                    }}
                                    style={{ display: "none" }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Letter Images */}
                <div className={styles.imagesSection}>
                    <h2>3 ảnh trang Thư tình</h2>
                    <div className={styles.imageGrid}>
                        {LETTER_IMAGE_LABELS.map((label, index) => (
                            <div key={index} className={styles.imageItem}>
                                <span className={styles.imageLabel}>{label}</span>
                                <div
                                    className={styles.imageBox}
                                    onClick={() => letterFileInputRefs.current[index]?.click()}
                                >
                                    {(letterPreviews[index] || letterImageUrls[index]) ? (
                                        <Image
                                            src={letterPreviews[index] || letterImageUrls[index]}
                                            alt={`Ảnh thư ${index + 1}`}
                                            fill
                                            style={{ objectFit: "cover" }}
                                        />
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
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) handleLetterImageSelect(index, e.target.files[0]);
                                    }}
                                    style={{ display: "none" }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Letter Message */}
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
                            placeholder="Viết lời yêu thương..."
                            rows={5}
                        />
                    </div>
                </div>

                {/* Save Button */}
                <button
                    className={styles.saveBtn}
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <><FiLoader /> Đang lưu...</>
                    ) : (
                        <><FaSave /> Lưu thay đổi</>
                    )}
                </button>
            </div>
        </div>
    );
}
