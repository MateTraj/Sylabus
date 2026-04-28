import React from 'react';
import { useNavigate } from 'react-router-dom';
import { login, saveAuthUser } from '../api/api';

/**
 * Strona logowania - formularz z emailem i hasłem.
 */
export default function LoginPage() {
  const navigate = useNavigate();

  // === STAN KOMPONENTU ===
  // "useState" to sposób React na przechowywanie danych, które mogą się zmieniać
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  // === OBSŁUGA LOGOWANIA ===
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();  // Zatrzymaj domyślne odświeżenie strony

    setError('');
    setLoading(true);

    try {
      // 1. Wyślij dane do backendu
      const response = await login({ email, password });

      // 2. Zapisz token i dane użytkownika w localStorage
      saveAuthUser(response);

      // 3. Przekieruj na stronę główną
      console.log('✅ Zalogowano jako:', response.email, 'Role:', response.roles);
      navigate('/');

      // 4. Przeładuj stronę aby zaktualizować Layout (pokaże dane użytkownika)
      window.location.reload();

    } catch (err) {
      // Pokaż błąd użytkownikowi
      setError(err instanceof Error ? err.message : 'Błąd logowania');
      console.error('Błąd logowania:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2>Logowanie</h2>

      {/* Komunikat o błędzie */}
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

      {/* Formularz */}
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Email:
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="np. editor@uczelnia.pl"
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
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: 12, 
            fontSize: '1em', 
            fontWeight: 'bold',
            background: loading ? '#ccc' : '#0066cc', 
            color: 'white', 
            border: 'none', 
            borderRadius: 4, 
            cursor: loading ? 'not-allowed' : 'pointer' 
          }}
        >
          {loading ? 'Logowanie...' : 'Zaloguj się'}
        </button>
      </form>

      {/* Link do rejestracji */}
      <div style={{ marginTop: 20, textAlign: 'center', color: '#666' }}>
        <p>Nie masz konta?</p>{' '}
        <button 
          onClick={() => navigate('/register')}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#0066cc', 
            cursor: 'pointer', 
            textDecoration: 'underline' 
          }}
        >
          Zarejestruj się
        </button>
      </div>

      {/* Podpowiedzi dla użytkowników testowych */}
      <div style={{ 
        marginTop: 30, 
        padding: 12, 
        background: '#f0f8ff', 
        borderRadius: 6, 
        fontSize: '0.9em' 
      }}>
        <strong><p>💡 Konta testowe:</p></strong>
        <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
          <li><code>editor@uczelnia.pl</code> / <code>Editor123!</code> (może edytować)</li>
          <li><code>reader@uczelnia.pl</code> / <code>Reader123!</code> (tylko czytanie)</li>
        </ul>
      </div>
    </div>
  );
}