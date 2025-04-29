import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './QuoteWidget.module.css';
import quotes from '../data/quotes.json';

const QuoteWidget = () => {
  const { showQuotes } = useSelector(state => state.settings);
  const chains = useSelector(state => state.chains);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  const downloadedCount = chains.filter(chain => 
    chain.status !== 'not_downloaded' && 
    chain.status !== 'downloading' && 
    chain.status !== 'extracting' && 
    chain.released !== "no"
  ).length;
  const totalAvailable = chains.filter(chain => chain.released !== "no").length;
  const goToNextQuote = () => {
    setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
  };

  const goToPreviousQuote = () => {
    setCurrentQuoteIndex((prevIndex) => (prevIndex - 1 + quotes.length) % quotes.length);
  };

  if (!showQuotes) return null;

  const currentQuote = quotes[currentQuoteIndex];

  return (
    <div className={styles.widget}>
      <div className={styles.statsSection}>
        <div className={styles.statsCount}>
          {downloadedCount}/{totalAvailable}
        </div>
        <div className={styles.statsLabel}>
          chains
        </div>
      </div>
      <div className={styles.divider} />
      <div className={styles.quoteContainer}>
        <button className={styles.navButton} onClick={goToPreviousQuote} title="Previous quote">
          <ChevronLeft size={16} />
        </button>
        <div className={styles.quoteContent}>
          <blockquote className={styles.quote}>
            "{currentQuote.quote}"
          </blockquote>
          <div className={styles.author}>
            — {currentQuote.author}
          </div>
        </div>
        <button className={styles.navButton} onClick={goToNextQuote} title="Next quote">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default QuoteWidget;
