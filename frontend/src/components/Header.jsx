import { truncateAddress, getNetworkName, isValidNetwork } from '../utils/helpers';
import './Header.css';

export default function Header({ account, chainId, darkMode, onToggleTheme }) {
  const networkOk = isValidNetwork(chainId);
  const networkName = getNetworkName(chainId);

  return (
    <header className="header" id="header">
      <div className="header-brand">
        <h1 className="header-title">
          <span>eVoting</span> dApp
        </h1>
      </div>

      <div className="header-actions">
        {account && chainId && (
          <div
            className="network-badge"
            id="network-badge"
            title={networkOk ? 'Correct network' : 'Wrong network - switch to Localhost:8545'}
          >
            <span className={`network-dot ${networkOk ? 'network-dot-ok' : 'network-dot-wrong'}`} />
            <span>{networkName}</span>
          </div>
        )}

        {account && (
          <div className="header-account" id="account-display" title={account}>
            {truncateAddress(account)}
          </div>
        )}

        <button
          className="theme-toggle"
          onClick={onToggleTheme}
          id="theme-toggle"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
