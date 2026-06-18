import { useState } from 'react';
import './ConnectWallet.css';

export default function ConnectWallet({ onConnect }) {
  const [connecting, setConnecting] = useState(false);
  const hasMetaMask = typeof window !== 'undefined' && Boolean(window.ethereum);

  const handleConnect = async () => {
    if (!hasMetaMask || connecting) return;
    setConnecting(true);
    try {
      await onConnect();
    } finally {
      setConnecting(false);
    }
  };

  return (
    <section className="connect-section" id="connect-wallet-section">
      <div className="connect-section-inner">
        <h2 className="connect-title">
          Decentralized voting, on-chain
        </h2>
        <p className="connect-subtitle">
          Cast your vote on the blockchain. Transparent, tamper-proof, and verifiable by anyone.
        </p>

        {hasMetaMask ? (
          <button
            className="connect-btn"
            onClick={handleConnect}
            disabled={connecting}
            id="connect-wallet-btn"
          >
            {connecting ? (
              <>
                <svg className="connect-btn-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Connecting...
              </>
            ) : (
              'Connect Wallet'
            )}
          </button>
        ) : (
          <div className="no-metamask" role="alert">
            MetaMask not detected. Install the browser extension to continue.
          </div>
        )}

        <div className="connect-features">
          <div className="connect-feature">
            <div className="connect-feature-title">Immutable</div>
            <div className="connect-feature-desc">Votes recorded permanently on-chain</div>
          </div>
          <div className="connect-feature">
            <div className="connect-feature-title">Transparent</div>
            <div className="connect-feature-desc">Results verifiable by anyone</div>
          </div>
          <div className="connect-feature">
            <div className="connect-feature-title">One vote</div>
            <div className="connect-feature-desc">Smart contract enforces single vote per address</div>
          </div>
        </div>
      </div>
    </section>
  );
}
