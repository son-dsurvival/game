# Use Git-backed atomic turn transactions

Each successfully persisted turn will be applied by one deterministic Recorder from a clean working tree and captured as one local Git commit, while each Day-End Checkpoint will atomically commit all canon promotion and cleanup before pushing the accumulated history. This favors auditable rollback and single-writer safety over partial or optimistic updates; remote synchronization failure preserves local commits but blocks the next day, and automatic force-push is prohibited after the one-time repository bootstrap.
