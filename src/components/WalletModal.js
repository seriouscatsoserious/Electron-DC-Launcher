import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './WalletModal.module.css';
import { Eye, EyeOff } from 'lucide-react';

const WalletModal = () => {
  const { isLoading, error } = useSelector(state => state.walletModal);
  const [copiedStates, setCopiedStates] = useState({});
  const [revealedMnemonics, setRevealedMnemonics] = useState({
    master: false,
    layer1: false,
    layer2_thunder: false,
    layer2_bitnames: false,
    layer2_zside: false
  });

  const handleCopy = async (text, type, event) => {
    try {
      await navigator.clipboard.writeText(text);
      const rect = event.target.getBoundingClientRect();
      const tooltipX = rect.left + (rect.width / 2);
      const tooltipY = rect.top;
      setCopiedStates(prev => ({ 
        ...prev, 
        [type]: { 
          copied: true,
          x: tooltipX,
          y: tooltipY
        }
      }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [type]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleWheel = (event) => {
    // Get the parent mnemonicCol div
    const mnemonicCol = event.target.closest(`.${styles.mnemonicCol}`);
    if (mnemonicCol) {
      // Prevent the default vertical scroll
      event.preventDefault();
      // Scroll horizontally instead
      mnemonicCol.scrollLeft += event.deltaY;
    }
  };
  const [mnemonics, setMnemonics] = useState({
    master: '••••••••••••',
    layer1: '••••••••••••',
    layer2_thunder: '••••••••••••',
    layer2_bitnames: '••••••••••••',
    layer2_zside: '••••••••••••'
  });

  const toggleMnemonic = async (key) => {
    // If we're hiding the current one, just hide it
    if (revealedMnemonics[key]) {
      setRevealedMnemonics(prev => ({
        master: false,
        layer1: false,
        layer2_thunder: false,
        layer2_bitnames: false,
        layer2_zside: false
      }));
      return;
    }

    // If we're revealing a new one, hide all others first
    if (!revealedMnemonics[key] && mnemonics[key] === '••••••••••••') {
      try {
        let type;
        switch (key) {
          case 'master':
            type = 'master';
            break;
          case 'layer1':
            type = 'layer1';
            break;
          case 'layer2_thunder':
            type = 'thunder';
            break;
          case 'layer2_bitnames':
            type = 'bitnames';
            break;
          case 'layer2_zside':
            type = 'zside';
            break;
        }
        const result = await window.electronAPI.getWalletStarter(type);
        if (result.success) {
          setMnemonics(prev => ({
            ...prev,
            [key]: result.data
          }));
        }
      } catch (error) {
        console.error('Error fetching mnemonic:', error);
      }
    }
    
    // Set only the current one to visible
    setRevealedMnemonics({
      master: false,
      layer1: false,
      layer2_thunder: false,
      layer2_bitnames: false,
      layer2_zside: false,
      [key]: true
    });
  };
  return (
    <div className={styles.pageContainer}>
      <div className={styles.content}>
        {error && <div className={styles.error}>{error}</div>}
        {isLoading && <div className={styles.loading}>Loading...</div>}

        <div className={styles.starterTable} style={{ marginTop: '20px' }}>
          {/* Starter section */}
          <div className={styles.sectionHeader}>
            <div className={styles.typeCol}></div>
            <div className={styles.starterCol}>Starter</div>
            <div className={styles.mnemonicCol}>Mnemonic</div>
            <div className={styles.actionsCol}></div>
          </div>
          <div className={styles.tableRow}>
            <div className={styles.typeCol}>
              <div className={`${styles.chainTypeBadge} ${styles.l1Badge}`}>L1</div>
            </div>
            <div className={styles.starterCol}>Master</div>
            <div className={styles.mnemonicCol}>
              <span 
                className={`${revealedMnemonics.master ? styles.copyableText : ''} ${copiedStates.master?.copied ? styles.copied : ''}`}
                onClick={(e) => revealedMnemonics.master && handleCopy(mnemonics.master, 'master', e)}
                onWheel={handleWheel}
              >
                {revealedMnemonics.master ? mnemonics.master : '••••••••••••'}
                {copiedStates.master?.copied && (
                  <div 
                    className={styles.copyTooltip} 
                    style={{
                      left: copiedStates.master.x + 'px',
                      top: copiedStates.master.y + 'px'
                    }}
                  >
                    Copied!
                  </div>
                )}
              </span>
            </div>
            <div className={styles.actionsCol}>
              <button 
                className={styles.iconButton} 
                title={revealedMnemonics.master ? "Hide" : "Reveal"}
                onClick={() => toggleMnemonic('master')}
              >
                {revealedMnemonics.master ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {/* Delete functionality not yet implemented
              <button className={styles.deleteIconButton} title="Delete Starter">
                <Trash2 size={18} />
              </button>
              */}
            </div>
          </div>

          <div className={styles.tableRow}>
            <div className={styles.typeCol}>
              <div className={`${styles.chainTypeBadge} ${styles.l1Badge}`}>L1</div>
            </div>
            <div className={styles.starterCol}>Bitcoin Core</div>
            <div className={styles.mnemonicCol}>
              <span 
                className={`${revealedMnemonics.layer1 ? styles.copyableText : ''} ${copiedStates.layer1?.copied ? styles.copied : ''}`}
                onClick={(e) => revealedMnemonics.layer1 && handleCopy(mnemonics.layer1, 'layer1', e)}
                onWheel={handleWheel}
              >
                {revealedMnemonics.layer1 ? mnemonics.layer1 : '••••••••••••'}
                {copiedStates.layer1?.copied && (
                  <div 
                    className={styles.copyTooltip} 
                    style={{
                      left: copiedStates.layer1.x + 'px',
                      top: copiedStates.layer1.y + 'px'
                    }}
                  >
                    Copied!
                  </div>
                )}
              </span>
            </div>
            <div className={styles.actionsCol}>
              <button 
                className={styles.iconButton} 
                title={revealedMnemonics.layer1 ? "Hide" : "Reveal"}
                onClick={() => toggleMnemonic('layer1')}
              >
                {revealedMnemonics.layer1 ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {/* Delete functionality not yet implemented
              <button className={styles.deleteIconButton} title="Delete Starter">
                <Trash2 size={18} />
              </button>
              */}
            </div>
          </div>

          <div className={styles.tableRow}>
            <div className={styles.typeCol}>
              <div className={`${styles.chainTypeBadge} ${styles.l2Badge}`}>L2</div>
            </div>
            <div className={styles.starterCol}>Thunder</div>
            <div className={styles.mnemonicCol}>
              <span 
                className={`${revealedMnemonics.layer2_thunder ? styles.copyableText : ''} ${copiedStates.layer2_thunder?.copied ? styles.copied : ''}`}
                onClick={(e) => revealedMnemonics.layer2_thunder && handleCopy(mnemonics.layer2_thunder, 'layer2_thunder', e)}
                onWheel={handleWheel}
              >
                {revealedMnemonics.layer2_thunder ? mnemonics.layer2_thunder : '••••••••••••'}
                {copiedStates.layer2_thunder?.copied && (
                  <div 
                    className={styles.copyTooltip} 
                    style={{
                      left: copiedStates.layer2_thunder.x + 'px',
                      top: copiedStates.layer2_thunder.y + 'px'
                    }}
                  >
                    Copied!
                  </div>
                )}
              </span>
            </div>
            <div className={styles.actionsCol}>
              <button 
                className={styles.iconButton} 
                title={revealedMnemonics.layer2_thunder ? "Hide" : "Reveal"}
                onClick={() => toggleMnemonic('layer2_thunder')}
              >
                {revealedMnemonics.layer2_thunder ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {/* Delete functionality not yet implemented
              <button className={styles.deleteIconButton} title="Delete Starter">
                <Trash2 size={18} />
              </button>
              */}
            </div>
          </div>

          <div className={styles.tableRow}>
            <div className={styles.typeCol}>
              <div className={`${styles.chainTypeBadge} ${styles.l2Badge}`}>L2</div>
            </div>
            <div className={styles.starterCol}>Bitnames</div>
            <div className={styles.mnemonicCol}>
              <span 
                className={`${revealedMnemonics.layer2_bitnames ? styles.copyableText : ''} ${copiedStates.layer2_bitnames?.copied ? styles.copied : ''}`}
                onClick={(e) => revealedMnemonics.layer2_bitnames && handleCopy(mnemonics.layer2_bitnames, 'layer2_bitnames', e)}
                onWheel={handleWheel}
              >
                {revealedMnemonics.layer2_bitnames ? mnemonics.layer2_bitnames : '••••••••••••'}
                {copiedStates.layer2_bitnames?.copied && (
                  <div 
                    className={styles.copyTooltip} 
                    style={{
                      left: copiedStates.layer2_bitnames.x + 'px',
                      top: copiedStates.layer2_bitnames.y + 'px'
                    }}
                  >
                    Copied!
                  </div>
                )}
              </span>
            </div>
            <div className={styles.actionsCol}>
              <button 
                className={styles.iconButton} 
                title={revealedMnemonics.layer2_bitnames ? "Hide" : "Reveal"}
                onClick={() => toggleMnemonic('layer2_bitnames')}
              >
                {revealedMnemonics.layer2_bitnames ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {/* Delete functionality not yet implemented
              <button className={styles.deleteIconButton} title="Delete Starter">
                <Trash2 size={18} />
              </button>
              */}
            </div>
          </div>

          <div className={styles.tableRow}>
            <div className={styles.typeCol}>
              <div className={`${styles.chainTypeBadge} ${styles.l2Badge}`}>L2</div>
            </div>
            <div className={styles.starterCol}>zSide</div>
            <div className={styles.mnemonicCol}>
              <span 
                className={`${revealedMnemonics.layer2_zside ? styles.copyableText : ''} ${copiedStates.layer2_zside?.copied ? styles.copied : ''}`}
                onClick={(e) => revealedMnemonics.layer2_zside && handleCopy(mnemonics.layer2_zside, 'layer2_zside', e)}
                onWheel={handleWheel}
              >
                {revealedMnemonics.layer2_zside ? mnemonics.layer2_zside : '••••••••••••'}
                {copiedStates.layer2_zside?.copied && (
                  <div 
                    className={styles.copyTooltip} 
                    style={{
                      left: copiedStates.layer2_zside.x + 'px',
                      top: copiedStates.layer2_zside.y + 'px'
                    }}
                  >
                    Copied!
                  </div>
                )}
              </span>
            </div>
            <div className={styles.actionsCol}>
              <button 
                className={styles.iconButton} 
                title={revealedMnemonics.layer2_zside ? "Hide" : "Reveal"}
                onClick={() => toggleMnemonic('layer2_zside')}
              >
                {revealedMnemonics.layer2_zside ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {/* Delete functionality not yet implemented
              <button className={styles.deleteIconButton} title="Delete Starter">
                <Trash2 size={18} />
              </button>
              */}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WalletModal;
