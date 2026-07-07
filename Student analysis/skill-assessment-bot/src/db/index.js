'use strict';
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './data/agsp.db';
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Schema ───────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    line_user_id       TEXT PRIMARY KEY,
    state              TEXT    NOT NULL DEFAULT 'idle',
    student_id_hash    TEXT,
    pdpa_consent       INTEGER NOT NULL DEFAULT 0,
    consent_timestamp  TEXT,
    current_question   INTEGER NOT NULL DEFAULT 0,
    answers            TEXT    NOT NULL DEFAULT '{}',
    created_at         TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at         TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS assessments (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id_hash     TEXT    NOT NULL,
    taken_at            TEXT    NOT NULL DEFAULT (datetime('now')),
    answers             TEXT    NOT NULL DEFAULT '{}',
    hard_skill_scores   TEXT    NOT NULL DEFAULT '{}',
    soft_skill_scores   TEXT    NOT NULL DEFAULT '{}',
    overall_score       REAL,
    recommendations     TEXT    NOT NULL DEFAULT '[]'
  );

  CREATE INDEX IF NOT EXISTS idx_assessments_student
    ON assessments(student_id_hash);
`);

// ─── Session helpers ───────────────────────────────────────────────────────────

const getSession = db.prepare(
  'SELECT * FROM sessions WHERE line_user_id = ?'
);

const upsertSession = db.prepare(`
  INSERT INTO sessions (line_user_id, state, student_id_hash, pdpa_consent,
    consent_timestamp, current_question, answers, updated_at)
  VALUES (@line_user_id, @state, @student_id_hash, @pdpa_consent,
    @consent_timestamp, @current_question, @answers, datetime('now'))
  ON CONFLICT(line_user_id) DO UPDATE SET
    state             = excluded.state,
    student_id_hash   = excluded.student_id_hash,
    pdpa_consent      = excluded.pdpa_consent,
    consent_timestamp = excluded.consent_timestamp,
    current_question  = excluded.current_question,
    answers           = excluded.answers,
    updated_at        = excluded.updated_at
`);

const resetSession = db.prepare(`
  UPDATE sessions SET
    state            = 'idle',
    current_question = 0,
    answers          = '{}',
    updated_at       = datetime('now')
  WHERE line_user_id = ?
`);

// ─── Assessment helpers ────────────────────────────────────────────────────────

const saveAssessment = db.prepare(`
  INSERT INTO assessments
    (student_id_hash, answers, hard_skill_scores, soft_skill_scores, overall_score, recommendations)
  VALUES
    (@student_id_hash, @answers, @hard_skill_scores, @soft_skill_scores, @overall_score, @recommendations)
`);

const getLastAssessment = db.prepare(`
  SELECT * FROM assessments
  WHERE student_id_hash = ?
  ORDER BY taken_at DESC
  LIMIT 1
`);

const countAssessments = db.prepare(
  'SELECT COUNT(*) as cnt FROM assessments WHERE student_id_hash = ?'
);

module.exports = {
  db,
  getSession: (lineUserId) => getSession.get(lineUserId),
  upsertSession: (data) => upsertSession.run(data),
  resetSession: (lineUserId) => resetSession.run(lineUserId),
  saveAssessment: (data) => saveAssessment.run(data),
  getLastAssessment: (hash) => getLastAssessment.get(hash),
  countAssessments: (hash) => countAssessments.get(hash).cnt,
};
