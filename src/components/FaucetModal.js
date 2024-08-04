import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hideFaucetModal, setClaimStatus } from '../store/faucetSlice';
import styles from './FaucetModal.module.css';
import { X, AlertTriangle } from 'lucide-react';

const FaucetModal = () => {
  const dispatch = useDispatch();
  const { isVisible, isLoading, error, success } = useSelector(
    state => state.faucet
  );

  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [amountError, setAmountError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [amountTouched, setAmountTouched] = useState(false);
  const [addressTouched, setAddressTouched] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      resetState();
    }
  }, [isVisible]);

  const resetState = () => {
    setAmount('');
    setAddress('');
    setAmountError('');
    setAddressError('');
    setAmountTouched(false);
    setAddressTouched(false);
  };

  const validateAmount = value => {
    if (value === '' || isNaN(value)) return 'Please enter a valid number.';
    const numValue = parseFloat(value);
    if (numValue <= 0 || Object.is(numValue, -0))
      return 'Amount must be greater than 0.';
    if (numValue > 1) return 'Amount must be less than or equal to 1.';
    return '';
  };

  const validateBitcoinAddress = address => {
    const bitcoinRegex =
      /^([13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[ac-hj-np-zAC-HJ-NP-Z02-9]{11,71})$/;
    return bitcoinRegex.test(address);
  };

  const validateAddress = value => {
    if (!value.trim()) return 'Please enter a BTC address.';
    if (!validateBitcoinAddress(value.trim()))
      return 'Please enter a valid BTC address.';
    return '';
  };

  const handleAmountChange = e => {
    const value = e.target.value;
    setAmount(value);
    if (amountTouched) {
      setAmountError(validateAmount(value));
    }
  };

  const handleAddressChange = e => {
    const value = e.target.value;
    setAddress(value);
    if (addressTouched) {
      setAddressError(validateAddress(value));
    }
  };

  const handleAmountBlur = () => {
    setAmountTouched(true);
    setAmountError(validateAmount(amount));
  };

  const handleAddressBlur = () => {
    setAddressTouched(true);
    setAddressError(validateAddress(address));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setAmountTouched(true);
    setAddressTouched(true);

    const amountValidationError = validateAmount(amount);
    const addressValidationError = validateAddress(address);

    if (amountValidationError || addressValidationError) {
      setAmountError(amountValidationError);
      setAddressError(addressValidationError);
      return;
    }

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
        resetState();
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
              onChange={handleAmountChange}
              onBlur={handleAmountBlur}
              className={amountTouched && amountError ? styles.inputError : ''}
            />
            <div className={styles.errorContainer}>
              {amountTouched && amountError && (
                <div className={styles.errorMessage}>
                  <AlertTriangle size={16} />
                  <span>{amountError}</span>
                </div>
              )}
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="address">BTC Address:</label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={handleAddressChange}
              onBlur={handleAddressBlur}
              className={
                addressTouched && addressError ? styles.inputError : ''
              }
            />
            <div className={styles.errorContainer}>
              {addressTouched && addressError && (
                <div className={styles.errorMessage}>
                  <AlertTriangle size={16} />
                  <span>{addressError}</span>
                </div>
              )}
            </div>
          </div>
          <div className={styles.buttonContainer}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={
                isLoading ||
                !!amountError ||
                !!addressError ||
                !amount ||
                !address
              }
            >
              {isLoading ? 'Requesting...' : 'Request BTC'}
            </button>
          </div>
        </form>
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
      </div>
    </div>
  );
};

export default FaucetModal;
