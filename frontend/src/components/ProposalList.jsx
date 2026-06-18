import ProposalCard from './ProposalCard';
import { SkeletonCard } from './Skeleton';
import './ProposalList.css';

export default function ProposalList({
  proposals,
  loading,
  hasVoted,
  quorum,
  votingClosed,
  onVote,
}) {
  const totalVotes = proposals.reduce((sum, p) => sum + Number(p.voteCount), 0);

  if (loading) {
    return (
      <section className="proposals-section" id="proposals-section">
        <div className="proposals-section-header">
          <h2 className="proposals-section-title">Proposals</h2>
        </div>
        <div className="proposals-skeleton-grid">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </section>
    );
  }

  if (proposals.length === 0) {
    return (
      <section className="proposals-section" id="proposals-section">
        <div className="proposals-section-header">
          <h2 className="proposals-section-title">Proposals</h2>
        </div>
        <div className="proposals-empty">
          <div className="proposals-empty-title">No proposals yet</div>
          <div className="proposals-empty-desc">
            The contract owner needs to create proposals before voting can begin.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="proposals-section" id="proposals-section">
      <div className="proposals-section-header">
        <h2 className="proposals-section-title">Proposals</h2>
        <span className="proposals-count">
          {proposals.length} proposals, {totalVotes} votes
        </span>
      </div>

      <div className="proposals-grid">
        {proposals.map((p, i) => (
          <ProposalCard
            key={i}
            id={i}
            name={p.name}
            voteCount={p.voteCount}
            totalVotes={totalVotes}
            hasVoted={hasVoted}
            quorum={Number(quorum)}
            meetsQuorum={p.meetsQuorum}
            votingClosed={votingClosed}
            onVote={onVote}
            style={{ animationDelay: `${i * 0.08}s` }}
          />
        ))}
      </div>
    </section>
  );
}
