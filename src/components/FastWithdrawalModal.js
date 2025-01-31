/**
 * FastWithdrawalModal handles the process of withdrawing L2 coins to L1 bitcoin address.
 * 
 * The modal has three main stages:
 * 
 * 1. Initial Withdrawal Request:
 *    - User enters withdrawal amount
 *    - User enters withdrawal address
 *    - User selects fast withdrawal server
 *    - User selects L2 chain (Thunder/BitNames)
 *    - "Request Withdrawal" button initiates the process
 * 
 * 2. Payment Stage (after request):
 *    - Shows withdrawal hash
 *    - Displays amount to send with copy button
 *    - Shows L2 address to send to with copy button
 *    - User enters payment transaction ID
 *    - "Complete Withdrawal" button confirms payment
 * 
 * 3. Success Stage:
 *    - Shows success message
 *    - Displays L1 payout transaction with copy button
 *    - "Start new withdrawal" button resets the form
 * 
 * The modal can be closed at any time:
 * - If closed after completion, state is reset
 * - If closed before completion, state is preserved
 */

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hideFastWithdrawalModal } from '../store/fastWithdrawalModalSlice';
import { X, Clipboard } from 'lucide-react';
import styles from './FastWithdrawalModal.module.css';

const FastWithdrawalModal = () => {
  const dispatch = useDispatch();
  const isVisible = useSelector((state) => state.fastWithdrawalModal.isVisible);
  
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [selectedServer, setSelectedServer] = useState('localhost');
  const [layer2Chain, setLayer2Chain] = useState('Thunder');
  const [withdrawalHash, setWithdrawalHash] = useState(null);
  const [paymentTxid, setPaymentTxid] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  const resetState = () => {
    setAmount('');
    setAddress('');
    setSelectedServer('localhost');
    setLayer2Chain('Thunder');
    setWithdrawalHash(null);
    setPaymentTxid('');
    setPaymentMessage('');
    setSuccessMessage('');
    setErrorMessage('');
    setIsCompleted(false);
  };

  const handleClose = () => {
    if (isCompleted) {
      resetState();
    }
    dispatch(hideFastWithdrawalModal());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear any previous errors
    try {
      if (parseFloat(amount) <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      if (!address.trim()) {
        throw new Error('Please enter a valid withdrawal address');
      }

      const result = await window.electronAPI.requestWithdrawal(address, parseFloat(amount), layer2Chain);
      if (!result.server_l2_address?.info) {
        throw new Error('Invalid server response: Missing L2 address');
      }

      const totalAmount = (parseFloat(amount) + result.server_fee_sats/100000000).toString();
      setPaymentMessage({
        amount: totalAmount,
        address: result.server_l2_address.info
      });
      setWithdrawalHash(result.hash);
    } catch (error) {
      setErrorMessage(error.message || 'Withdrawal request failed. Please try again.');
      console.error('Withdrawal request failed:', error);
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handlePaste = async (setter) => {
    try {
      const text = await navigator.clipboard.readText();
      setter(text);
    } catch (error) {
      console.error('Failed to paste:', error);
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear any previous errors
    try {
      if (!paymentTxid.trim()) {
        throw new Error('Please enter your L2 payment transaction ID');
      }

      const result = await window.electronAPI.notifyPaymentComplete(withdrawalHash, paymentTxid);
      setSuccessMessage(result.message.info);
      setIsCompleted(true);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to complete withdrawal. Please try again.');
      console.error('Payment completion failed:', error);
    }
  };

  if (!isVisible) return null;

  const handleOverlayClick = e => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Fast Withdrawal</h2>
          <button
            type="button"
            onClick={handleClose}
            className={styles.closeButton}
          >
            <X size={20} />
          </button>
        </div>
        <div className={styles.modalDescription}>
          Quickly withdraw L2 coins to your L1 bitcoin address
        </div>
        <div className={styles.form}>
          {errorMessage && (
            <div className={styles.errorMessage}>
              {errorMessage}
            </div>
          )}
          {!withdrawalHash ? (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <div className={styles.inputWithPaste}>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter withdrawal amount"
                    className={styles.input}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handlePaste(setAmount)}
                    className={styles.pasteButton}
                    title="Paste from clipboard"
                  >
                    <Clipboard size={18} />
                  </button>
                </div>
              </div>
              <div className={styles.inputGroup}>
                <div className={styles.inputWithPaste}>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter withdrawal address"
                    className={styles.input}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handlePaste(setAddress)}
                    className={styles.pasteButton}
                    title="Paste from clipboard"
                  >
                    <Clipboard size={18} />
                  </button>
                </div>
              </div>
              <div className={styles.formGroup}>
                <div className={styles.horizontalInputs}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>
                      Select fast withdrawal server
                    </label>
                    <select
                      value={selectedServer}
                      onChange={(e) => setSelectedServer(e.target.value)}
                      className={styles.input}
                    >
                      <option value="localhost">Localhost</option>
                      <option value="192.168.1.100">192.168.1.100</option>
                      <option value="192.168.1.101">192.168.1.101</option>
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>
                      Select L2 to withdraw from
                    </label>
                    <select
                      value={layer2Chain}
                      onChange={(e) => setLayer2Chain(e.target.value)}
                      className={styles.input}
                    >
                      <option value="Thunder">Thunder</option>
                      <option value="BitNames">BitNames</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.submitButton}>
                  Request Withdrawal
                </button>
              </div>
            </form>
          ) : null}
          {withdrawalHash && (
            <div className={styles.paymentSection}>
              <div className={styles.hashDisplay}>
                <label>Withdrawal Hash:</label>
                <span>{withdrawalHash}</span>
              </div>
              {paymentMessage && (
                <div className={styles.messageDisplay}>
                  <div className={styles.messageRow}>
                    Please send <span>{paymentMessage.amount}</span> BTC
                    <button
                      type="button"
                      onClick={() => handleCopy(paymentMessage.amount)}
                      className={styles.copyButton}
                    >
                      Copy
                    </button>
                  </div>
                  <div className={styles.messageRow}>
                    to {layer2Chain} L2 address: <span>{paymentMessage.address}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(paymentMessage.address)}
                      className={styles.copyButton}
                    >
                      Copy
                    </button>
                  </div>
                  <div className={styles.messageRow}>
                    Once you have sent payment copy and paste the L2 txid below
                  </div>
                </div>
              )}
              {!isCompleted && (
                <form onSubmit={handleComplete}>
                  <div className={styles.formGroup}>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>
                        Payment Transaction ID
                      </label>
                      <div className={styles.inputWithPaste}>
                        <input
                          type="text"
                          value={paymentTxid}
                          onChange={(e) => setPaymentTxid(e.target.value)}
                          placeholder="Enter payment transaction ID"
                          className={styles.input}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handlePaste(setPaymentTxid)}
                          className={styles.pasteButton}
                          title="Paste from clipboard"
                        >
                          <Clipboard size={18} />
                        </button>
                      </div>
                    </div>
                    <div className={styles.buttonGroup}>
                      <button
                        type="submit"
                        className={styles.submitButton}
                      >
                        Complete Withdrawal
                      </button>
                    </div>
                  </div>
                </form>
              )}
              {successMessage && (
                <>
                  <div className={styles.successMessage}>
                    <div>Success! L1 payout transaction:</div>
                    <div className={styles.hashWithCopy}>
                      <span>{successMessage}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(successMessage)}
                        className={styles.copyButton}
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={resetState}
                    className={styles.submitButton}
                  >
                    Start new withdrawal
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FastWithdrawalModal;
