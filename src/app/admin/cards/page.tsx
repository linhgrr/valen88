"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { FiPlus, FiCopy, FiTrash2, FiEdit2, FiEye, FiX, FiSmartphone, FiArrowLeft } from "react-icons/fi";
import { FaHeart, FaHeartBroken } from "react-icons/fa";
import styles from "./cards.module.css";

interface Card {
  _id: string;
  slug: string;
  name1: string;
  name2: string;
  images: string[];
  createdAt: string;
}

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [qrCode, setQrCode] = useState("");

  // Edit modal state
  const [editCard, setEditCard] = useState<Card | null>(null);
  const [editName1, setEditName1] = useState("");
  const [editName2, setEditName2] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [deleteCard, setDeleteCard] = useState<Card | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Edit handlers
  const openEditModal = (card: Card) => {
    setEditCard(card);
    setEditName1(card.name1);
    setEditName2(card.name2);
  };

  const closeEditModal = () => {
    setEditCard(null);
    setEditName1("");
    setEditName2("");
  };

  const handleSaveEdit = async () => {
    if (!editCard || !editName1.trim() || !editName2.trim()) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/cards/${editCard.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name1: editName1.trim(), name2: editName2.trim() }),
      });

      const data = await response.json();
      if (data.success) {
        setCards(cards.map(c =>
          c._id === editCard._id
            ? { ...c, name1: editName1.trim(), name2: editName2.trim() }
            : c
        ));
        closeEditModal();
      } else {
        alert("Lỗi: " + (data.error || "Không thể cập nhật"));
      }
    } catch (err) {
      alert("Có lỗi xảy ra khi cập nhật");
    } finally {
      setSaving(false);
    }
  };

  // Delete handlers
  const openDeleteModal = (card: Card) => {
    setDeleteCard(card);
  };

  const closeDeleteModal = () => {
    setDeleteCard(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteCard) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/cards/${deleteCard.slug}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        setCards(cards.filter(c => c._id !== deleteCard._id));
        closeDeleteModal();
      } else {
        alert("Lỗi: " + (data.error || "Không thể xóa"));
      }
    } catch (err) {
      alert("Có lỗi xảy ra khi xóa");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <FaHeart className={styles.loadingIcon} />
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/admin" className={styles.backBtn}>
            <FiArrowLeft /> Quay lại
          </Link>
          <h1 className={styles.title}><FaHeart /> Danh Sách Thiệp</h1>
        </div>
        <Link href="/admin" className={styles.createBtn}>
          <FiPlus /> Tạo Thiệp Mới
        </Link>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {cards.length === 0 ? (
        <div className={styles.empty}>
          <FaHeartBroken className={styles.emptyIcon} />
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
                  {card.name1} <FaHeart className={styles.heartIcon} /> {card.name2}
                </h3>
                <p className={styles.cardDate}>{formatDate(card.createdAt)}</p>
              </div>

              <div className={styles.cardActions}>
                <button
                  onClick={() => showQRCode(card)}
                  className={styles.qrBtn}
                >
                  <FiSmartphone /> QR
                </button>
                <button
                  onClick={() => copyLink(card.slug)}
                  className={styles.copyBtn}
                >
                  <FiCopy /> Copy
                </button>
                <a
                  href={`/card/${card.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.viewBtn}
                >
                  <FiEye /> Xem
                </a>
              </div>

              <div className={styles.cardActions}>
                <button
                  onClick={() => openEditModal(card)}
                  className={styles.editBtn}
                >
                  <FiEdit2 /> Sửa
                </button>
                <button
                  onClick={() => openDeleteModal(card)}
                  className={styles.deleteBtn}
                >
                  <FiTrash2 /> Xóa
                </button>
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
              <FiX />
            </button>
            <h2 className={styles.modalTitle}>
              {selectedCard.name1} <FaHeart /> {selectedCard.name2}
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
            <p className={styles.modalHint}>Quét để xem thiệp</p>
            <div className={styles.modalLink}>
              <input
                type="text"
                value={`${window.location.origin}/card/${selectedCard.slug}`}
                readOnly
              />
              <button onClick={() => copyLink(selectedCard.slug)}><FiCopy /> Copy</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editCard && (
        <div className={styles.modal} onClick={closeEditModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeEditModal}>
              <FiX />
            </button>
            <h2 className={styles.modalTitle}><FiEdit2 /> Sửa Thiệp</h2>
            <div className={styles.editForm}>
              <div className={styles.formGroup}>
                <label>Tên người 1</label>
                <input
                  type="text"
                  value={editName1}
                  onChange={(e) => setEditName1(e.target.value)}
                  placeholder="Nhập tên..."
                />
              </div>
              <div className={styles.formGroup}>
                <label>Tên người 2</label>
                <input
                  type="text"
                  value={editName2}
                  onChange={(e) => setEditName2(e.target.value)}
                  placeholder="Nhập tên..."
                />
              </div>
              <div className={styles.formActions}>
                <button
                  onClick={closeEditModal}
                  className={styles.cancelBtn}
                  disabled={saving}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveEdit}
                  className={styles.saveBtn}
                  disabled={saving || !editName1.trim() || !editName2.trim()}
                >
                  {saving ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCard && (
        <div className={styles.modal} onClick={closeDeleteModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeDeleteModal}>
              <FiX />
            </button>
            <h2 className={styles.modalTitle}><FiTrash2 /> Xác Nhận Xóa</h2>
            <p className={styles.deleteWarning}>
              Bạn có chắc muốn xóa thiệp của <strong>{deleteCard.name1}</strong> và <strong>{deleteCard.name2}</strong>?
            </p>
            <p className={styles.deleteHint}>Hành động này không thể hoàn tác!</p>
            <div className={styles.formActions}>
              <button
                onClick={closeDeleteModal}
                className={styles.cancelBtn}
                disabled={deleting}
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                className={styles.confirmDeleteBtn}
                disabled={deleting}
              >
                {deleting ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
