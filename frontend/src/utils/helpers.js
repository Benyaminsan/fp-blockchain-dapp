/**
 * Truncate an Ethereum address for display.
 * Example: 0x1234567890abcdef... → 0x1234...cdef
 */
export function truncateAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format a vote count number for display.
 */
export function formatVoteCount(count) {
  const num = Number(count);
  if (isNaN(num)) return '0';
  return num.toLocaleString();
}

/**
 * Extract a user-friendly error message from MetaMask / ethers errors.
 * Avoids showing raw technical details to end users.
 */
export function getErrorMessage(error) {
  if (!error) return 'An unknown error occurred.';

  const msg = error?.reason || error?.message || String(error);

  // MetaMask user rejection
  if (msg.includes('user rejected') || msg.includes('ACTION_REJECTED')) {
    return 'Transaction was rejected by the user.';
  }
  // Contract revert reasons
  if (msg.includes('Already voted')) {
    return 'You have already cast your vote in this election.';
  }
  if (msg.includes('Voting closed')) {
    return 'The voting period has ended. No more votes can be cast.';
  }
  if (msg.includes('Invalid proposal')) {
    return 'The selected proposal does not exist.';
  }
  if (msg.includes('Only owner')) {
    return 'Only the contract owner can perform this action.';
  }
  // Network errors
  if (msg.includes('network') || msg.includes('NETWORK_ERROR')) {
    return 'Network error. Please check your connection and try again.';
  }
  if (msg.includes('insufficient funds')) {
    return 'Insufficient funds to complete this transaction.';
  }
  // Generic fallback — do not expose raw technical details
  return 'Transaction failed. Please try again.';
}

/**
 * Check whether the connected network chain ID matches Hardhat local (31337).
 */
export function isValidNetwork(chainId) {
  // Hardhat local node chain ID
  const HARDHAT_CHAIN_ID = 31337;
  return Number(chainId) === HARDHAT_CHAIN_ID;
}

/**
 * Get a human-readable network name from a chain ID.
 */
export function getNetworkName(chainId) {
  const id = Number(chainId);
  const networks = {
    1: 'Ethereum Mainnet',
    5: 'Goerli Testnet',
    11155111: 'Sepolia Testnet',
    137: 'Polygon',
    31337: 'Localhost (Hardhat)',
    1337: 'Localhost (Ganache)',
  };
  return networks[id] || `Unknown (${id})`;
}
