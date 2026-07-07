'use strict';
const crypto = require('crypto');

const SALT = process.env.HASH_SALT || 'agsp_default_salt_change_this';

/**
 * Hash รหัสนักศึกษาด้วย HMAC-SHA256
 * ทำให้ไม่สามารถ reverse กลับเป็นรหัสจริงได้
 */
function hashStudentId(studentId) {
  return crypto
    .createHmac('sha256', SALT)
    .update(studentId.trim())
    .digest('hex');
}

/**
 * Validate รูปแบบรหัสนักศึกษา (ตัวเลข 8 หลัก)
 * ปรับ regex ได้ถ้ามหิดลใช้รูปแบบอื่น
 */
function isValidStudentId(input) {
  return /^\d{8}$/.test(input.trim());
}

module.exports = { hashStudentId, isValidStudentId };
