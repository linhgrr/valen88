"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import styles from "./cards.module.css";

interface Card {
  _id: string;
  slug: string;
  name1: string;
  name2: string;
  images: string[];
  letterImages: string[];
  letterMessage: {
    greeting: string;
    content: string;
  };
  createdAt: string;
}

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await fetch("/api/cards");
      const data = await response.json();
      if (data.success) {
        setCards(data.cards);
      } else {
        setError("Không thể tải danh sách thiệp");
      }
    } catch (err) {
      setError("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const showQRCode = async (card: Card) => {
    setSelectedCard(card);
    const cardLink = `${window.location.origin}/card/${card.slug}`;
    const qr = await QRCode.toDataURL(cardLink, {
      width: 300,
      margin: 2,
      color: {
        dark: "#891008",
        light: "#fff",
      },
    });
    setQrCode(qr);
  };

  const closeModal = () => {
    setSelectedCard(null);
    setQrCode("");
  };

  const copyLink = (slug: string) => {
    const link = `${window.location.origin}/card/${slug}`;
    navigator.clipboard.writeText(link);
    alert("Đã copy link!");
  };

  const downloadQR = (card: Card) => {
    if (!qrCode) return;

    const link = document.createElement('a');
    link.download = `QR_${card.name1}_${card.name2}.png`;
    link.href = qrCode;
    link.click();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <span className={styles.loadingIcon}>💕</span>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>💕 Danh Sách Thiệp</h1>
        <Link href="/admin" className={styles.createBtn}>
          ✨ Tạo Thiệp Mới
        </Link>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {cards.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>📭</span>
          <p>Chưa có thiệp nào được tạo</p>
          <Link href="/admin" className={styles.createBtnLarge}>
            Tạo thiệp đầu tiên
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {cards.map((card) => (
            <div key={card._id} className={styles.card}>
              <div className={styles.cardImages}>
                {card.images.slice(0, 4).map((img, idx) => (
                  <div key={idx} className={styles.cardImageThumb}>
                    <Image
                      src={img}
                      alt={`Image ${idx + 1}`}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                ))}
              </div>

              <div className={styles.cardInfo}>
                <h3 className={styles.cardNames}>
                  {card.name1} ❤️ {card.name2}
                </h3>
                <p className={styles.cardDate}>{formatDate(card.createdAt)}</p>
              </div>

              <div className={styles.cardActions}>
                <button
                  onClick={() => showQRCode(card)}
                  className={styles.qrBtn}
                >
                  📱 QR
                </button>
                <button
                  onClick={() => copyLink(card.slug)}
                  className={styles.copyBtn}
                >
                  📋 Copy
                </button>
                <a
                  href={`/card/${card.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.viewBtn}
                >
                  👁️ Xem
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {selectedCard && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeModal}>
              ✕
            </button>
            <h2 className={styles.modalTitle}>
              {selectedCard.name1} ❤️ {selectedCard.name2}
            </h2>
            {qrCode && (
              <Image
                src={qrCode}
                alt="QR Code"
                width={250}
                height={250}
                className={styles.modalQR}
              />
            )}
            <button
              onClick={() => downloadQR(selectedCard)}
              className={styles.downloadBtn}
              disabled={!qrCode}
            >
              ⬇️ Tải xuống QR
            </button>
            <p className={styles.modalHint}>Quét để xem thiệp</p>
            <div className={styles.modalLink}>
              <input
                type="text"
                value={`${window.location.origin}/card/${selectedCard.slug}`}
                readOnly
              />
              <button onClick={() => copyLink(selectedCard.slug)}>📋 Copy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
