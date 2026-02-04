"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import styles from "./DesktopWarning.module.css";

export default function DesktopWarning() {
  return (
    <div className={styles.container}>
      <div className={styles.loveTextPattern}>
        <div className={styles.textContent}>
          {Array(50).fill("Love ♡ Yêu ♡ Valentine ♡ ").join("")}
        </div>
      </div>
      
      <motion.div 
        className={styles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className={styles.phoneIcon}
          animate={{ 
            rotate: [0, -10, 10, -10, 10, 0],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            repeatDelay: 1 
          }}
        >
          📱
        </motion.div>
        
        <motion.div
          className={styles.heartIcon}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          💕
        </motion.div>
        
        <h1 className={styles.title}>Vui lòng xem trên điện thoại</h1>
        <p className={styles.subtitle}>
          Trang web này được thiết kế đặc biệt cho trải nghiệm trên thiết bị di động
        </p>
        
        <div className={styles.instructions}>
          <p>📲 Mở trên điện thoại của bạn</p>
          <p>hoặc</p>
          <p>🖥️ Thu nhỏ cửa sổ trình duyệt</p>
        </div>
      </motion.div>
    </div>
  );
}
