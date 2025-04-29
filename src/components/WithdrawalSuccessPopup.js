import React, { useEffect, useState } from 'react';
import styles from './WithdrawalSuccessPopup.module.css';
import { CheckCircle, X } from 'lucide-react';
import confetti from 'canvas-confetti';

const WithdrawalSuccessPopup = ({ transactionId, onClose, onStartNew }) => {
  const [copiedState, setCopiedState] = useState(false);

  useEffect(() => {
    const duration = 1000;
    const end = Date.now() + duration;
    const colors = ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'];

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
        zIndex: 1100
      });
      
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
        zIndex: 1100
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transactionId);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleOverlayClick = e => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.popupOverlay} onClick={handleOverlayClick}>
      <div className={styles.popupContent}>
        <div className={styles.popupHeader}>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeButton}
          >
            <X size={20} />
          </button>
        </div>
        <CheckCircle size={48} className={styles.successIcon} />
        <h2 className={styles.title}>Payment Success!</h2>
        <div className={styles.transactionSection}>
          <label className={styles.transactionLabel}>L1 payout transaction:</label>
          <span 
            onClick={handleCopy} 
            title="Click to copy"
            className={`${styles.copyableText} ${copiedState ? styles.copied : ''}`}
          >
            {transactionId}
            {copiedState && <div className={styles.copyTooltip}>Copied!</div>}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalSuccessPopup;
