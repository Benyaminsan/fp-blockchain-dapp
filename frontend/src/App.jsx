import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './utils/contract';
import { getErrorMessage, isValidNetwork } from './utils/helpers';
import Header from './components/Header';
import ConnectWallet from './components/ConnectWallet';
import CountdownTimer from './components/CountdownTimer';
import ProposalList from './components/ProposalList';
import ResultsChart from './components/ResultsChart';
import AdminPanel from './components/AdminPanel';
import { useToast } from './components/Toast';
import './App.css';

/**
 * App — root component for the eVoting dApp.
 * Manages wallet connection, contract state, event listeners, and theme.
 */
export default function App() {
  // --- Theme ---
  const [darkMode, setDarkMode] = useState(true);

  // --- Wallet ---
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);

  // --- Contract data ---
  const [proposals, setProposals] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [deadline, setDeadline] = useState(0);
  const [quorum, setQuorum] = useState(0);
  const [ownerAddress, setOwnerAddress] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  // --- Loading ---
  const [loading, setLoading] = useState(false);

  // --- Toast ---
  const { toast, ToastContainer } = useToast();

  // ===================
  // Theme handling
  // ===================
  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      darkMode ? 'dark' : 'light'
    );
  }, [darkMode]);

  // ===================
  // Get read-only contract
  // ===================
  const getReadContract = useCallback(() => {
    if (!window.ethereum) return null;
    const provider = new ethers.BrowserProvider(window.ethereum);
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  }, []);

  // ===================
  // Get signer contract (for writes)
  // ===================
  const getSignerContract = useCallback(async () => {
    if (!window.ethereum) return null;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }, []);

  // ===================
  // Load all contract data
  // ===================
  const loadContractData = useCallback(async (userAccount) => {
    const contract = getReadContract();
    if (!contract) return;

    setLoading(true);
    try {
      // Read proposal count
      const count = Number(await contract.proposalCount());

      // Read all proposals
      const proposalPromises = [];
      for (let i = 0; i < count; i++) {
        proposalPromises.push(contract.getProposal(i));
      }
      const proposalResults = await Promise.all(proposalPromises);

      // Read quorum status for each
      const quorumPromises = [];
      for (let i = 0; i < count; i++) {
        quorumPromises.push(contract.meetsQuorum(i));
      }
      const quorumResults = await Promise.all(quorumPromises);

      const loadedProposals = proposalResults.map(([name, voteCount], i) => ({
        name,
        voteCount: Number(voteCount),
        meetsQuorum: quorumResults[i],
      }));
      setProposals(loadedProposals);

      // Read deadline, quorum, owner, hasVoted
      const [dl, qr, owner, voted] = await Promise.all([
        contract.deadline(),
        contract.quorum(),
        contract.owner(),
        userAccount ? contract.hasVoted(userAccount) : Promise.resolve(false),
      ]);

      setDeadline(Number(dl));
      setQuorum(Number(qr));
      setOwnerAddress(owner);
      setHasVoted(voted);

      if (userAccount) {
        setIsOwner(owner.toLowerCase() === userAccount.toLowerCase());
      }
    } catch (err) {
      toast.error('Failed to load data', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [getReadContract, toast]);

  // ===================
  // Connect wallet
  // ===================
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      const acct = accounts[0];
      setAccount(acct);

      const cid = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(Number(cid));

      await loadContractData(acct);
      toast.success('Wallet Connected', 'Successfully connected to MetaMask.');
    } catch (err) {
      toast.error('Connection Failed', getErrorMessage(err));
    }
  }, [loadContractData, toast]);

  // ===================
  // MetaMask event listeners
  // ===================
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
        setProposals([]);
        setHasVoted(false);
        setIsOwner(false);
        toast.info('Wallet Disconnected', 'Your wallet has been disconnected.');
      } else {
        const newAccount = accounts[0];
        setAccount(newAccount);
        loadContractData(newAccount);
        toast.info('Account Changed', 'Switched to a different account.');
      }
    };

    const handleChainChanged = (newChainId) => {
      setChainId(Number(newChainId));
      if (account) {
        loadContractData(account);
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [account, loadContractData, toast]);

  // ===================
  // Contract event listeners (live updates)
  // ===================
  useEffect(() => {
    if (!account) return;
    const contract = getReadContract();
    if (!contract) return;

    const onVoted = () => {
      loadContractData(account);
    };

    const onProposalCreated = () => {
      loadContractData(account);
    };

    contract.on('Voted', onVoted);
    contract.on('ProposalCreated', onProposalCreated);

    return () => {
      contract.off('Voted', onVoted);
      contract.off('ProposalCreated', onProposalCreated);
    };
  }, [account, getReadContract, loadContractData]);

  // ===================
  // Vote handler
  // ===================
  const handleVote = useCallback(async (proposalId) => {
    try {
      const contract = await getSignerContract();
      if (!contract) throw new Error('No signer available');

      toast.info('Transaction Sent', 'Please confirm in MetaMask...');
      const tx = await contract.vote(proposalId);

      toast.info('Confirming', 'Waiting for blockchain confirmation...');
      await tx.wait();

      toast.success('Vote Successful', 'Your vote has been recorded on-chain!');
      setHasVoted(true);
      await loadContractData(account);
    } catch (err) {
      toast.error('Vote Failed', getErrorMessage(err));
      throw err; // re-throw so ProposalCard resets its state
    }
  }, [account, getSignerContract, loadContractData, toast]);

  // ===================
  // Create proposal handler (admin)
  // ===================
  const handleCreateProposal = useCallback(async (name) => {
    try {
      const contract = await getSignerContract();
      if (!contract) throw new Error('No signer available');

      toast.info('Transaction Sent', 'Creating proposal...');
      const tx = await contract.createProposal(name);

      toast.info('Confirming', 'Waiting for blockchain confirmation...');
      await tx.wait();

      toast.success('Proposal Created', `"${name}" has been added to the ballot.`);
      await loadContractData(account);
    } catch (err) {
      toast.error('Creation Failed', getErrorMessage(err));
      throw err;
    }
  }, [account, getSignerContract, loadContractData, toast]);

  // ===================
  // Set Deadline & Quorum handlers (admin)
  // ===================
  const handleSetDeadline = useCallback(async (timestamp) => {
    try {
      const contract = await getSignerContract();
      if (!contract) throw new Error('No signer available');

      toast.info('Transaction Sent', 'Setting deadline...');
      const tx = await contract.setDeadline(timestamp);

      toast.info('Confirming', 'Waiting for blockchain confirmation...');
      await tx.wait();

      toast.success('Deadline Set', 'The voting deadline has been updated.');
      await loadContractData(account);
    } catch (err) {
      toast.error('Failed', getErrorMessage(err));
      throw err;
    }
  }, [account, getSignerContract, loadContractData, toast]);

  const handleSetQuorum = useCallback(async (q) => {
    try {
      const contract = await getSignerContract();
      if (!contract) throw new Error('No signer available');

      toast.info('Transaction Sent', 'Setting quorum...');
      const tx = await contract.setQuorum(q);

      toast.info('Confirming', 'Waiting for blockchain confirmation...');
      await tx.wait();

      toast.success('Quorum Set', 'The quorum requirement has been updated.');
      await loadContractData(account);
    } catch (err) {
      toast.error('Failed', getErrorMessage(err));
      throw err;
    }
  }, [account, getSignerContract, loadContractData, toast]);

  // ===================
  // Computed state
  // ===================
  const votingClosed = deadline > 0 && Date.now() > deadline * 1000;
  const wrongNetwork = account && chainId && !isValidNetwork(chainId);

  return (
    <div className="app">
      <ToastContainer />

      <Header
        account={account}
        chainId={chainId}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(prev => !prev)}
      />

      <main className="app-main">
        {/* Not connected: show hero + connect */}
        {!account && (
          <ConnectWallet onConnect={connectWallet} />
        )}

        {/* Connected */}
        {account && (
          <>
            {/* Wrong network warning */}
            {wrongNetwork && (
              <div className="network-warning" role="alert" id="network-warning">
                <strong>Wrong Network.</strong> Switch MetaMask to <strong>Localhost 8545</strong> (Chain ID: 31337) to interact with the contract.
              </div>
            )}

            {/* Countdown timer */}
            <CountdownTimer deadline={deadline} />

            {/* Proposal cards */}
            <ProposalList
              proposals={proposals}
              loading={loading}
              hasVoted={hasVoted}
              quorum={quorum}
              votingClosed={votingClosed}
              onVote={handleVote}
            />

            {/* Results chart */}
            {proposals.length > 0 && (
              <>
                <hr className="divider" />
                <ResultsChart proposals={proposals} quorum={quorum} />
              </>
            )}

            {/* Admin panel (owner only) */}
            {isOwner && (
              <>
                <hr className="divider" />
                <AdminPanel
                  onCreateProposal={handleCreateProposal}
                  onSetDeadline={handleSetDeadline}
                  onSetQuorum={handleSetQuorum}
                  deadline={deadline}
                  quorum={quorum}
                  ownerAddress={ownerAddress}
                />
              </>
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>eVoting dApp - React, Solidity, ethers.js</p>
      </footer>
    </div>
  );
}
