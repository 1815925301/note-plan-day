import { useState } from 'react';
import { login } from './auth';

export default function Login({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(password);
      onSuccess();
    } catch (err) {
      setError(err.message || '密码错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo-icon">📝</div>
        <h1>工作日志</h1>
        <p className="login-subtitle">请输入访问密码</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="访问密码"
            autoFocus
            required
          />
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? '验证中…' : '进入'}
          </button>
        </form>
      </div>
    </div>
  );
}
