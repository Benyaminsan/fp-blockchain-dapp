import { useState } from 'react';
import { formatVoteCount } from '../utils/helpers';
import './ProposalCard.css';

export default function ProposalCard({
  id,
  name,
  voteCount,
  totalVotes,
  hasVoted,
  quorum,
  meetsQuorum,
  votingClosed,
  onVote,
  style,
}) {
  const [txState, setTxState] = useState('idle');

  const percentage = totalVotes > 0
    ? Math.round((Number(voteCount) / totalVotes) * 100)
    : 0;

  const canVote = !hasVoted && !votingClosed && txState === 'idle';

  const handleVote = async () => {
    if (!canVote) return;
    setTxState('pending');
    try {
      await onVote(id);
      setTxState('success');
    } catch {
      setTxState('idle');
    }
  };

  return (
    <div
      className={`proposal-card ${votingClosed ? 'proposal-card-closed' : ''}`}
      style={style}
      id={`proposal-card-${id}`}
    >
      <div className="proposal-card-header">
        <div>
          <span className="proposal-card-id">#{id + 1}</span>
          <div className="proposal-card-name">{name}</div>
        </div>
        <div className="proposal-card-votes">
          {formatVoteCount(voteCount)}
          <span className="proposal-card-votes-label">votes</span>
        </div>
      </div>

      <div className="progress-wrap">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${percentage}%` }} />
        </div>
        <div className="progress-labels">
          <span>{percentage}%</span>
          {quorum > 0 && (
            <span className={`quorum-tag ${meetsQuorum ? 'quorum-met' : 'quorum-unmet'}`}>
              {meetsQuorum ? 'Quorum met' : `Need ${quorum}`}
            </span>
          )}
        </div>
      </div>

      {txState === 'pending' ? (
        <div className="pending-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          Confirming...
        </div>
      ) : hasVoted || txState === 'success' ? (
        <div className="voted-badge">Voted</div>
      ) : (
        <button
          className="vote-btn"
          onClick={handleVote}
          disabled={!canVote}
          id={`vote-btn-${id}`}
        >
          Cast Vote
        </button>
      )}
    </div>
  );
}
