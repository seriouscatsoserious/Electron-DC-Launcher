import React, { useEffect } from 'react';
import styles from './SuccessPopup.module.css';
import { CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const SuccessPopup = ({ message }) => {
  useEffect(() => {
    const duration = 1500; // Increased duration for more celebration
    const end = Date.now() + duration;
    const colors = ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'];

    const frame = () => {
      confetti({
        particleCount: 3, // More particles
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
        zIndex: 1100
      });
      
      confetti({
        particleCount: 3, // More particles
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

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContent}>
        <CheckCircle className={styles.successIcon} />
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
};

export default SuccessPopup;
