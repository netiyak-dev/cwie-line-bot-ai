/**
 * /admin/login — หน้า login ของ Admin Dashboard
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F5F5F5',
      fontFamily: 'sans-serif',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: '40px 48px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
        width: 360,
      }}>
        {/* Logo / Title */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-block',
            background: '#003F88',
            color: '#C9A227',
            fontWeight: 700,
            fontSize: 24,
            borderRadius: 8,
            padding: '8px 20px',
            marginBottom: 12,
          }}>AGSP</div>
          <div style={{ color: '#1A1A1A', fontWeight: 600, fontSize: 16 }}>Admin Dashboard</div>
          <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>มหาวิทยาลัยมหิดล</div>
        </div>

        {error && (
          <div style={{
            background: '#FFF3CD',
            border: '1px solid #E07B39',
            borderRadius: 6,
            padding: '10px 14px',
            color: '#c0540a',
            fontSize: 14,
            marginBottom: 20,
          }}>
            รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่
          </div>
        )}

        <form action="/api/admin/login" method="POST">
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, color: '#555', marginBottom: 6 }}>
              รหัสผ่าน
            </label>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: 6,
                fontSize: 15,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              background: '#003F88',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '11px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  );
}
