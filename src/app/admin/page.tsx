"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { FiHeart, FiEye, FiCopy, FiPlus, FiList, FiLink, FiCamera, FiClock } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import styles from "./admin.module.css";

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
  "Ảnh khung 1 (trên trái)",
  "Ảnh khung 2 (trên phải)",
  "Ảnh trái tim trái",
  "Ảnh trái tim phải",
  "Ảnh khung 3 (dưới trái)",
  "Ảnh khung 4 (dưới phải)",
];

export default function AdminPage() {
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [images, setImages] = useState<UploadedImage[]>(
    Array(6).fill({ file: null, preview: "", url: "" })
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdCard, setCreatedCard] = useState<CreatedCard | null>(null);
  const [error, setError] = useState("");
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleImageSelect = (index: number, file: File) => {
    const newImages = [...images];
    newImages[index] = {
      file,
      preview: URL.createObjectURL(file),
      url: "",
    };
    setImages(newImages);
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

  const handleCreateCard = async () => {
    setError("");

    // Validate inputs
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

      // Upload all images that haven't been uploaded yet
      const uploadedUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        if (images[i].url) {
          uploadedUrls.push(images[i].url);
        } else if (images[i].file) {
          const url = await uploadImage(images[i].file!);
          uploadedUrls.push(url);

          // Update state with uploaded URL
          const newImages = [...images];
          newImages[i] = { ...newImages[i], url };
          setImages(newImages);
        }
      }

      setIsUploading(false);
      setIsCreating(true);

      // Create card
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name1: name1.trim(),
          name2: name2.trim(),
          images: uploadedUrls,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to create card");
      }

      // Generate QR code
      const cardLink = `${window.location.origin}/card/${data.card.slug}`;
      const qrCode = await QRCode.toDataURL(cardLink, {
        width: 300,
        margin: 2,
        color: {
          dark: "#891008",
          light: "#fff",
        },
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

  const handleReset = () => {
    setName1("");
    setName2("");
    setImages(Array(6).fill({ file: null, preview: "", url: "" }));
    setCreatedCard(null);
    setError("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Đã copy link!");
  };

  if (createdCard) {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <h1 className={styles.title}><FaHeart className={styles.successIcon} /> Thiệp đã được tạo!</h1>

          <div className={styles.cardInfo}>
            <p><strong>{createdCard.name1}</strong> <FaHeart className={styles.heartSmall} /> <strong>{createdCard.name2}</strong></p>
          </div>

          <div className={styles.qrSection}>
            <Image
              src={createdCard.qrCode}
              alt="QR Code"
              width={250}
              height={250}
              className={styles.qrCode}
            />
            <p className={styles.scanText}>Quét QR để xem thiệp</p>
          </div>

          <div className={styles.linkSection}>
            <input
              type="text"
              value={createdCard.link}
              readOnly
              className={styles.linkInput}
            />
            <button
              onClick={() => copyToClipboard(createdCard.link)}
              className={styles.copyBtn}
            >
              <FiCopy /> Copy
            </button>
          </div>

          <div className={styles.actions}>
            <a
              href={createdCard.link}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.previewBtn}
            >
              <FiEye /> Xem thiệp
            </a>
            <button onClick={handleReset} className={styles.newBtn}>
              <FiPlus /> Tạo thiệp mới
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}><FaHeart className={styles.titleIcon} /> Tạo Thiệp Valentine</h1>
          <div className={styles.headerLinks}>
            <Link href="/admin/cards" className={styles.viewAllBtn}>
              <FiList /> Xem thiệp
            </Link>
            <Link href="/admin/links" className={styles.linksBtn}>
              <FiLink /> Link 1 lần
            </Link>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.namesSection}>
          <div className={styles.nameInput}>
            <label>Tên người 1:</label>
            <input
              type="text"
              value={name1}
              onChange={(e) => setName1(e.target.value)}
              placeholder="Ví dụ: Tuấn"
            />
          </div>
          <div className={styles.heartIcon}><FaHeart /></div>
          <div className={styles.nameInput}>
            <label>Tên người 2:</label>
            <input
              type="text"
              value={name2}
              onChange={(e) => setName2(e.target.value)}
              placeholder="Ví dụ: Vy"
            />
          </div>
        </div>

        <div className={styles.imagesSection}>
          <h2>Upload 6 ảnh cho thiệp</h2>
          <div className={styles.imageGrid}>
            {IMAGE_LABELS.map((label, index) => (
              <div key={index} className={styles.imageUpload}>
                <label>{label}</label>
                <div
                  className={styles.imagePreview}
                  onClick={() => fileInputRefs.current[index]?.click()}
                >
                  {images[index].preview ? (
                    <Image
                      src={images[index].preview}
                      alt={`Preview ${index + 1}`}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div className={styles.placeholder}>
                      <FiCamera className={styles.cameraIcon} />
                      <span>Click để chọn ảnh</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={(el) => { fileInputRefs.current[index] = el; }}
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleImageSelect(index, e.target.files[0]);
                    }
                  }}
                  style={{ display: "none" }}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          className={styles.createBtn}
          onClick={handleCreateCard}
          disabled={isUploading || isCreating}
        >
          {isUploading ? (
            <><FiClock /> Đang upload ảnh...</>
          ) : isCreating ? (
            <><FiClock /> Đang tạo thiệp...</>
          ) : (
            <><FaHeart /> Tạo Thiệp</>
          )}
        </button>
      </div>
    </div>
  );
}
