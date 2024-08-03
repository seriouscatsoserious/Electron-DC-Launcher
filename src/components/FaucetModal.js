import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hideFaucetModal, setClaimStatus } from '../store/faucetSlice';
import styles from './FaucetModal.module.css';
import { X } from 'lucide-react';

const FaucetModal = () => {
  const dispatch = useDispatch();
  const { isVisible, isLoading, error, success } = useSelector(
    state => state.faucet
  );
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    if (isVisible) {
      fetchClaims();
    }
  }, [isVisible]);

  const fetchClaims = async () => {
    try {
      const result = await window.electronAPI.listClaims();
      if (result.success) {
        // Sort claims by time (most recent first) and take the last 10
        const sortedClaims = result.data
          .sort((a, b) => b.time - a.time)
          .slice(0, 10);
        setClaims(sortedClaims);
      } else {
        console.error('Failed to fetch claims:', result.error);
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    dispatch(setClaimStatus({ isLoading: true, error: null, success: null }));
    try {
      const result = await window.electronAPI.submitClaim(address, amount);
      if (result.success) {
        dispatch(
          setClaimStatus({
            isLoading: false,
            success: `Claim submitted successfully. Transaction ID: ${result.data.txid}`,
          })
        );
        fetchClaims(); // Refresh the claims list
        setAmount('');
        setAddress('');
      } else {
        dispatch(setClaimStatus({ isLoading: false, error: result.error }));
      }
    } catch (error) {
      dispatch(setClaimStatus({ isLoading: false, error: error.message }));
    }
  };

  const handleClose = () => {
    dispatch(hideFaucetModal());
  };

  const handleOverlayClick = e => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Request from Faucet</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="amount">Amount (BTC):</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0"
              max="1"
              step="0.00000001"
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="address">BTC Address:</label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Requesting...' : 'Request BTC'}
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
        <div className={styles.claimsList}>
          <h3>Recent Claims</h3>
          <ul>
            {claims.map((claim, index) => (
              <li key={index}>
                {claim.amount} BTC to {claim.address.slice(0, 10)}...
                {claim.address.slice(-5)} (
                {new Date(claim.time * 1000).toLocaleString()})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FaucetModal;
