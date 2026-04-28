import React from 'react';
import { useNavigate } from 'react-router-dom';
import { register, saveAuthUser } from '../api/api';

/**
 * Strona rejestracji - formularz tworzenia nowego konta.
 */
export default function RegisterPage() {
  const navigate = useNavigate();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    setError('');

    // === WALIDACJA ===
    if (password !== confirmPassword) {
      setError('Hasła nie są takie same');
      return;
    }

    if (password.length < 6) {
      setError('Hasło musi mieć minimum 6 znaków');
      return;
    }

    setLoading(true);

    try {
      // 1. Wyślij dane rejestracji
      const response = await register({ email, password, fullName });

      // 2. Zapisz token (rejestracja automatycznie loguje)
      saveAuthUser(response);

      // 3. Przekieruj na stronę główną
      console.log('✅ Zarejestrowano i zalogowano jako:', response.email);
      navigate('/');
      window.location.reload();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd rejestracji');
      console.error('Błąd rejestracji:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2>Rejestracja</h2>

      {error && (
        <div style={{ 
          background: '#fee', 
          color: '#c00', 
          padding: 12, 
          borderRadius: 6, 
          marginBottom: 16 
        }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Email:
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="twoj@email.pl"
            style={{ 
              width: '100%', 
              padding: 8, 
              fontSize: '1em', 
              border: '1px solid #ccc', 
              borderRadius: 4 
            }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Pełne imię (opcjonalne):
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jan Kowalski"
            style={{ 
              width: '100%', 
              padding: 8, 
              fontSize: '1em', 
              border: '1px solid #ccc', 
              borderRadius: 4 
            }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Hasło:
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Minimum 6 znaków"
            style={{ 
              width: '100%', 
              padding: 8, 
              fontSize: '1em', 
              border: '1px solid #ccc', 
              borderRadius: 4 
            }}
          />
          <small style={{ color: '#666' }}>
            Hasło musi zawierać wielką literę, małą literę i cyfrę
          </small>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Powtórz hasło:
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Wpisz ponownie hasło"
            style={{ 
              width: '100%', 
              padding: 8, 
              fontSize: '1em', 
              border: '1px solid #ccc', 
              borderRadius: 4 
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: 12, 
            fontSize: '1em', 
            fontWeight: 'bold',
            background: loading ? '#ccc' : '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: 4, 
            cursor: loading ? 'not-allowed' : 'pointer' 
          }}
        >
          {loading ? 'Rejestracja...' : 'Zarejestruj się'}
        </button>
      </form>

      <div style={{ marginTop: 20, textAlign: 'center', color: '#666' }}>
        <p>Masz już konto?</p>{' '}
        <button 
          onClick={() => navigate('/login')}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#0066cc', 
            cursor: 'pointer', 
            textDecoration: 'underline' 
          }}
        >
          Zaloguj się
        </button>
      </div>

      <div style={{ 
        marginTop: 20, 
        padding: 12, 
        background: '#fffbf0', 
        borderRadius: 6, 
        fontSize: '0.9em' 
      }}>
      <strong><p>ℹ️ Informacja:</p></strong>
        <p style={{ margin: '8px 0 0 0' }}>
          Nowo zarejestrowani użytkownicy otrzymują domyślnie rolę <strong>Reader</strong> (tylko odczyt).
          Administrator może zmienić rolę na <strong>Editor</strong> w bazie danych.
        </p>
      </div>
    </div>
  );
}