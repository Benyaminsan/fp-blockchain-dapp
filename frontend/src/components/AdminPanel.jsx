import { useState } from 'react';
import { truncateAddress } from '../utils/helpers';
import './AdminPanel.css';

export default function AdminPanel({
  onCreateProposal,
  onSetDeadline,
  onSetQuorum,
  deadline,
  quorum,
  ownerAddress,
}) {
  const [proposalName, setProposalName] = useState('');
  const [submittingProposal, setSubmittingProposal] = useState(false);

  const [deadlineInput, setDeadlineInput] = useState('');
  const [submittingDeadline, setSubmittingDeadline] = useState(false);

  const [quorumInput, setQuorumInput] = useState('');
  const [submittingQuorum, setSubmittingQuorum] = useState(false);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const trimmed = proposalName.trim();
    if (!trimmed || trimmed.length > 100 || submittingProposal) return;
    setSubmittingProposal(true);
    try {
      await onCreateProposal(trimmed);
      setProposalName('');
    } finally {
      setSubmittingProposal(false);
    }
  };

  const handleDeadlineSubmit = async (e) => {
    e.preventDefault();
    if (!deadlineInput || submittingDeadline) return;
    setSubmittingDeadline(true);
    try {
      // Input is datetime-local, convert to unix timestamp
      const date = new Date(deadlineInput);
      const timestamp = Math.floor(date.getTime() / 1000);
      await onSetDeadline(timestamp);
      setDeadlineInput('');
    } finally {
      setSubmittingDeadline(false);
    }
  };

  const handleQuorumSubmit = async (e) => {
    e.preventDefault();
    const q = Number(quorumInput);
    if (isNaN(q) || q < 0 || submittingQuorum) return;
    setSubmittingQuorum(true);
    try {
      await onSetQuorum(q);
      setQuorumInput('');
    } finally {
      setSubmittingQuorum(false);
    }
  };

  const deadlineDisplay =
    deadline && Number(deadline) > 0
      ? new Date(Number(deadline) * 1000).toLocaleString()
      : 'Not set';

  const quorumDisplay =
    quorum && Number(quorum) > 0 ? `${Number(quorum)} votes` : 'Not set';

  return (
    <section className="admin-section" id="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Admin</h2>
        <span className="admin-badge">Owner only</span>
      </div>

      <div className="admin-container">
        {/* Create Proposal */}
        <form className="admin-form" onSubmit={handleCreateSubmit}>
          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="proposal-name-input">
              Proposal name
            </label>
            <input
              id="proposal-name-input"
              type="text"
              value={proposalName}
              onChange={(e) => setProposalName(e.target.value)}
              placeholder="e.g., Alice, Bob, Option A"
              maxLength={100}
              disabled={submittingProposal}
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            className="admin-submit-btn"
            disabled={!proposalName.trim() || submittingProposal}
            id="create-proposal-btn"
          >
            {submittingProposal ? 'Creating...' : 'Create Proposal'}
          </button>
        </form>

        <hr className="divider" style={{ margin: '1.5rem 0' }} />

        <div className="admin-forms-row">
          {/* Set Deadline */}
          <form className="admin-form admin-form-half" onSubmit={handleDeadlineSubmit}>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="deadline-input">
                Set deadline
              </label>
              <input
                id="deadline-input"
                type="datetime-local"
                value={deadlineInput}
                onChange={(e) => setDeadlineInput(e.target.value)}
                disabled={submittingDeadline}
              />
            </div>
            <button
              type="submit"
              className="admin-submit-btn"
              disabled={!deadlineInput || submittingDeadline}
            >
              {submittingDeadline ? 'Saving...' : 'Set Deadline'}
            </button>
          </form>

          {/* Set Quorum */}
          <form className="admin-form admin-form-half" onSubmit={handleQuorumSubmit}>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="quorum-input">
                Set quorum
              </label>
              <input
                id="quorum-input"
                type="number"
                min="0"
                value={quorumInput}
                onChange={(e) => setQuorumInput(e.target.value)}
                placeholder="e.g., 5"
                disabled={submittingQuorum}
              />
            </div>
            <button
              type="submit"
              className="admin-submit-btn"
              disabled={!quorumInput || submittingQuorum}
            >
              {submittingQuorum ? 'Saving...' : 'Set Quorum'}
            </button>
          </form>
        </div>

        <div className="admin-info-row">
          <div>
            <div className="admin-info-label">Owner</div>
            <div className="admin-info-value">{truncateAddress(ownerAddress)}</div>
          </div>
          <div>
            <div className="admin-info-label">Current Deadline</div>
            <div className="admin-info-value">{deadlineDisplay}</div>
          </div>
          <div>
            <div className="admin-info-label">Current Quorum</div>
            <div className="admin-info-value">{quorumDisplay}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
