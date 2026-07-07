/**
 * session.ts — Session management ด้วย Vercel KV (Redis)
 *
 * State machine:
 *   idle → pdpa_pending → id_input → assessing → completing → idle
 *   idle → pdpa_pending → id_input → returning (เคยทำแล้ว)
 *
 * Key pattern: session:<lineUserId>
 * TTL: 48 ชั่วโมง (นักศึกษาสามารถ resume ได้ภายใน 2 วัน)
 */
import { kv } from '@vercel/kv';

export type SessionState =
  | 'idle'
  | 'pdpa_pending'
  | 'id_input'
  | 'assessing'
  | 'returning'
  | 'completing';

export interface Session {
  lineUserId: string;
  state: SessionState;
  studentIdHash: string | null;
  pdpaConsent: boolean;
  consentTimestamp: string | null;
  currentQuestion: number;    // 0-based index
  answers: Record<string, number>; // { Q1: 1-4, Q2: 1-4, ... }
  updatedAt: string;
}

const SESSION_TTL = 60 * 60 * 48; // 48 ชั่วโมง (วินาที)

function sessionKey(lineUserId: string): string {
  return `session:${lineUserId}`;
}

export async function getSession(lineUserId: string): Promise<Session | null> {
  try {
    return await kv.get<Session>(sessionKey(lineUserId));
  } catch (err) {
    console.error('[session] getSession error:', err);
    return null;
  }
}

export async function upsertSession(session: Omit<Session, 'updatedAt'>): Promise<void> {
  try {
    const full: Session = { ...session, updatedAt: new Date().toISOString() };
    await kv.set(sessionKey(session.lineUserId), full, { ex: SESSION_TTL });
  } catch (err) {
    console.error('[session] upsertSession error:', err);
  }
}

export async function resetSession(lineUserId: string, keepStudentId = true): Promise<void> {
  const existing = await getSession(lineUserId);
  await upsertSession({
    lineUserId,
    state: 'idle',
    studentIdHash: keepStudentId ? (existing?.studentIdHash ?? null) : null,
    pdpaConsent: existing?.pdpaConsent ?? false,
    consentTimestamp: existing?.consentTimestamp ?? null,
    currentQuestion: 0,
    answers: {},
  });
}

export function defaultSession(lineUserId: string): Session {
  return {
    lineUserId,
    state: 'idle',
    studentIdHash: null,
    pdpaConsent: false,
    consentTimestamp: null,
    currentQuestion: 0,
    answers: {},
    updatedAt: new Date().toISOString(),
  };
}
