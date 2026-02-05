"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiPlus, FiCopy, FiTrash2, FiCheck, FiClock, FiLink, FiExternalLink, FiArrowLeft } from "react-icons/fi";
import styles from "./links.module.css";

interface OneTimeLink {
    _id: string;
    token: string;
    used: boolean;
    usedAt?: string;
    createdAt: string;
}

export default function LinksPage() {
    const [links, setLinks] = useState<OneTimeLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchLinks();
    }, []);

    const fetchLinks = async () => {
        try {
            const response = await fetch("/api/links");
            const data = await response.json();
            if (data.success) {
                setLinks(data.links);
            } else {
                setError("Không thể tải danh sách link");
            }
        } catch (err) {
            setError("Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    const createLink = async () => {
        setCreating(true);
        try {
            const response = await fetch("/api/links", { method: "POST" });
            const data = await response.json();
            if (data.success) {
                setLinks([data.link, ...links]);
            } else {
                alert("Không thể tạo link mới");
            }
        } catch (err) {
            alert("Có lỗi xảy ra");
        } finally {
            setCreating(false);
        }
    };

    const deleteLink = async (token: string) => {
        if (!confirm("Bạn có chắc muốn xóa link này?")) return;

        try {
            const response = await fetch(`/api/links/${token}`, { method: "DELETE" });
            const data = await response.json();
            if (data.success) {
                setLinks(links.filter(l => l.token !== token));
            } else {
                alert("Không thể xóa link");
            }
        } catch (err) {
            alert("Có lỗi xảy ra");
        }
    };

    const copyLink = (token: string) => {
        const link = `${window.location.origin}/create/${token}`;
        navigator.clipboard.writeText(link);
        alert("Đã copy link!");
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <FiLink className={styles.loadingIcon} />
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
                    <h1 className={styles.title}>
                        <FiLink /> Link Tạo Thiệp 1 Lần
                    </h1>
                </div>
                <button
                    onClick={createLink}
                    className={styles.createBtn}
                    disabled={creating}
                >
                    <FiPlus /> {creating ? "Đang tạo..." : "Tạo Link Mới"}
                </button>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.info}>
                <p>Mỗi link chỉ có thể sử dụng <strong>1 lần</strong> để tạo thiệp. Chia sẻ link cho khách hàng để họ tự tạo thiệp.</p>
            </div>

            {links.length === 0 ? (
                <div className={styles.empty}>
                    <FiLink className={styles.emptyIcon} />
                    <p>Chưa có link nào</p>
                    <button onClick={createLink} className={styles.createBtnLarge}>
                        <FiPlus /> Tạo link đầu tiên
                    </button>
                </div>
            ) : (
                <div className={styles.list}>
                    {links.map((link) => (
                        <div key={link._id} className={`${styles.linkCard} ${link.used ? styles.used : ""}`}>
                            <div className={styles.linkStatus}>
                                {link.used ? (
                                    <span className={styles.statusUsed}>
                                        <FiCheck /> Đã sử dụng
                                    </span>
                                ) : (
                                    <span className={styles.statusActive}>
                                        <FiClock /> Chưa sử dụng
                                    </span>
                                )}
                            </div>

                            <div className={styles.linkUrl}>
                                <code>{`${typeof window !== 'undefined' ? window.location.origin : ''}/create/${link.token}`}</code>
                            </div>

                            <div className={styles.linkMeta}>
                                <span>Tạo: {formatDate(link.createdAt)}</span>
                                {link.usedAt && <span>Dùng: {formatDate(link.usedAt)}</span>}
                            </div>

                            <div className={styles.linkActions}>
                                {!link.used && (
                                    <>
                                        <button onClick={() => copyLink(link.token)} className={styles.copyBtn}>
                                            <FiCopy /> Copy
                                        </button>
                                        <a
                                            href={`/create/${link.token}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.openBtn}
                                        >
                                            <FiExternalLink /> Mở
                                        </a>
                                    </>
                                )}
                                <button onClick={() => deleteLink(link.token)} className={styles.deleteBtn}>
                                    <FiTrash2 /> Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
