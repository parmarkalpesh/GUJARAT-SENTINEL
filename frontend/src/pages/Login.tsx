import { useState } from 'react';
import { Shield, Lock, User, AlertCircle, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../App';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('admin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoUser = (user: string, pass: string, roleKey: string) => {
    setUsername(user);
    setPassword(pass);
    setSelectedRole(roleKey);
    setError('');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative"
      style={{
        backgroundColor: '#f1f5f9',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Background Subtle Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Main Login Card */}
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl z-10 shadow-2xl"
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #cbd5e1',
          padding: '36px 32px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
        }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              marginBottom: '14px',
              background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
              boxShadow: '0 8px 16px rgba(37, 99, 235, 0.25)',
            }}
          >
            <Shield style={{ width: '32px', height: '32px', color: '#ffffff' }} />
          </div>

          <h1
            style={{
              fontSize: '26px',
              fontWeight: '900',
              letterSpacing: '-0.5px',
              color: '#0f172a',
              margin: '0 0 6px 0',
              lineHeight: '1.2',
            }}
          >
            GUJARAT <span style={{ color: '#2563eb' }}>SENTINEL</span>
          </h1>

          <p
            style={{
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#64748b',
              margin: '0 0 10px 0',
            }}
          >
            State Crime Records Bureau • Gujarat Police
          </p>

          <span
            style={{
              display: 'inline-block',
              padding: '4px 14px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: '800',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
            }}
          >
            ★ STATEWIDE SURVEILLANCE GRID • PROD-C2
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              marginBottom: '20px',
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.75px',
                color: '#334155',
                marginBottom: '8px',
              }}
            >
              Officer / Operator Badge ID
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none',
                  color: '#64748b',
                  zIndex: 2,
                }}
              >
                <User style={{ width: '18px', height: '18px' }} />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter officer username"
                style={{
                  width: '100%',
                  height: '46px',
                  paddingLeft: '44px',
                  paddingRight: '14px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.75px',
                color: '#334155',
                marginBottom: '8px',
              }}
            >
              Secure Passkey / Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none',
                  color: '#64748b',
                  zIndex: 2,
                }}
              >
                <Lock style={{ width: '18px', height: '18px' }} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                style={{
                  width: '100%',
                  height: '46px',
                  paddingLeft: '44px',
                  paddingRight: '44px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: 0,
                  zIndex: 2,
                }}
              >
                {showPassword ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: '10px',
              backgroundColor: '#1d4ed8',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(29, 78, 216, 0.3)',
              marginTop: '4px',
            }}
          >
            <span>{loading ? 'Authenticating...' : 'Access Command Center'}</span>
            <ArrowRight style={{ width: '16px', height: '16px' }} />
          </button>
        </form>

        {/* Quick-fill Roles for Evaluators */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
          <p
            style={{
              fontSize: '10px',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              textAlign: 'center',
              color: '#64748b',
              marginBottom: '14px',
            }}
          >
            Select Authorized Role Profile
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { id: 'admin', label: 'Super Admin', user: 'admin', pass: 'admin123', desc: 'Full System Access' },
              { id: 'sp', label: 'SP Ahmedabad', user: 'sp_ahmedabad', pass: 'admin123', desc: 'District Police Admin' },
              { id: 'op', label: 'Operator 1', user: 'operator1', pass: 'operator123', desc: 'Surveillance Desk' },
              { id: 'inv', label: 'Investigator', user: 'investigator1', pass: 'operator123', desc: 'Vehicle Tracking' },
            ].map((role) => {
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setDemoUser(role.user, role.pass, role.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    backgroundColor: isSelected ? '#eff6ff' : '#f8fafc',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', width: '100%' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: '800',
                        color: isSelected ? '#1d4ed8' : '#0f172a',
                        lineHeight: '1.3',
                        display: 'block',
                      }}
                    >
                      {role.label}
                    </span>
                    {isSelected && (
                      <CheckCircle2 style={{ width: '14px', height: '14px', color: '#2563eb', marginLeft: 'auto' }} />
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      color: '#64748b',
                      lineHeight: '1.2',
                      display: 'block',
                    }}
                  >
                    {role.user}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Security Badge */}
        <div style={{ marginTop: '22px', textAlign: 'center', fontSize: '10px', fontWeight: '600', color: '#94a3b8' }}>
          Protected by AES-256 GCM • Authorized Gujarat Police Personnel Only
        </div>
      </div>
    </div>
  );
}
