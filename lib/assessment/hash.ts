/**
 * hash.ts — HMAC-SHA256 hash สำหรับ student ID
 * ใช้ Node.js crypto (Edge runtime ไม่รองรับ — ต้องใช้ nodejs runtime ใน route)
 */
import { createHmac } from 'crypto';

const HASH_SALT = process.env.HASH_SALT ?? '';

/**
 * hash รหัสนักศึกษา — ไม่เคยเก็บ raw ID
 */
export function hashStudentId(studentId: string): string {
  if (!HASH_SALT) {
    console.error('[hash] HASH_SALT ไม่ถูกตั้งค่า — ใช้ fallback (ไม่ปลอดภัยสำหรับ production)');
  }
  return createHmac('sha256', HASH_SALT || 'dev-fallback-salt')
    .update(studentId)
    .digest('hex');
}

/**
 * validate รูปแบบรหัสนักศึกษา: ตัวเลข 8 หลัก
 */
export function isValidStudentId(input: string): boolean {
  return /^\d{8}$/.test(input.trim());
}
