import { formatVoteCount } from '../utils/helpers';
import './ResultsChart.css';

export default function ResultsChart({ proposals, quorum }) {
  if (!proposals || proposals.length === 0) return null;

  const totalVotes = proposals.reduce((sum, p) => sum + Number(p.voteCount), 0);

  const sorted = [...proposals]
    .map((p, i) => ({ ...p, originalIndex: i }))
    .sort((a, b) => Number(b.voteCount) - Number(a.voteCount));

  const maxVotes = sorted.length > 0 ? Number(sorted[0].voteCount) : 0;

  return (
    <section className="results-section" id="results-section">
      <h2 className="results-section-title">Results</h2>

      <div className="results-container">
        <div className="results-stats">
          <div>
            <div className="results-stat-value">{proposals.length}</div>
            <div className="results-stat-label">Proposals</div>
          </div>
          <div>
            <div className="results-stat-value">{formatVoteCount(totalVotes)}</div>
            <div className="results-stat-label">Total votes</div>
          </div>
          {quorum > 0 && (
            <div>
              <div className="results-stat-value">{quorum}</div>
              <div className="results-stat-label">Quorum</div>
            </div>
          )}
        </div>

        <div className="results-bars">
          {sorted.map((p, rank) => {
            const votes = Number(p.voteCount);
            const barWidth = maxVotes > 0
              ? Math.max((votes / maxVotes) * 100, votes > 0 ? 4 : 1)
              : 1;

            return (
              <div className="results-bar-item" key={p.originalIndex}>
                <div className={`results-bar-rank ${rank === 0 && maxVotes > 0 ? 'results-bar-rank-1' : ''}`}>
                  {rank + 1}
                </div>
                <div className="results-bar-info">
                  <div className="results-bar-name">{p.name}</div>
                  <div className="results-bar-track">
                    <div
                      className={`results-bar-fill ${rank > 0 ? 'results-bar-fill-secondary' : ''}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
                <div className="results-bar-count">
                  {formatVoteCount(votes)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
