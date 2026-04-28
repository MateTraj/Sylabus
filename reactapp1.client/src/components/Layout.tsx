import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAuthUser, logout, canEdit } from '../api/api';

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Pobierz dane zalogowanego użytkownika
  const user = getAuthUser();
  const isEditor = canEdit();

  // Stan wyszukiwania
  const [searchText, setSearchText] = React.useState(searchParams.get('search') || '');

  /**
   * Aktualizuje parametry URL (filtry).
   * Zachowuje istniejące parametry i nadpisuje nowe.
   */
  function applyFilter(query: Record<string, string>) {
    const params = new URLSearchParams(searchParams);
    
    Object.keys(query).forEach(k => {
      if (query[k]) {
        params.set(k, query[k]);
      } else {
        params.delete(k);
      }
    });
    
    setSearchParams(params);
  }

  /**
   * Obsługa wyszukiwania - wywołana po kliknięciu "Szukaj" lub Enter
   */
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    applyFilter({ search: searchText });
  }

  /**
   * Wyczyść wszystkie filtry
   */
  function clearFilters() {
    setSearchText('');
    setSearchParams(new URLSearchParams());
  }

  function handleLogout() {
    if (confirm('Czy na pewno chcesz się wylogować?')) {
      logout();
      navigate('/login');
      window.location.reload();
    }
  }

  // Sprawdź czy są aktywne filtry
  const hasActiveFilters = searchParams.toString().length > 0;

  return (
    <>
      <div className="top">
        <div className="banner">
          <h1>System Zarządzania Sylabusami</h1>
        </div>
        
        <div className="userlogon">
          {user ? (
            <div className="tekst" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ textAlign: 'right', fontSize: '0.9em' }}>
                <div style={{ fontWeight: 'bold' }}>{user.fullName || user.email}</div>
                <div style={{ fontSize: '0.85em', color: '#666' }}>
                  {user.roles.join(', ')}
                  {isEditor && ' 🔓'}
                </div>
              </div>
              <button className="logout" onClick={handleLogout}>
                Wyloguj
              </button>
            </div>
          ) : (
            <button 
              className="logout" 
              onClick={() => navigate('/login')}
              style={{ background: '#28a745' }}
            >
              Zaloguj się
            </button>
          )}
        </div>
      </div>

      <div className="left">
        {/* === WYSZUKIWANIE === */}
        <div style={{ marginBottom: 20 }}>
          <h2>🔍 Wyszukiwanie</h2>
          <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Nazwa lub kod przedmiotu..."
              style={{
                padding: '8px 12px',
                fontSize: '0.95em',
                border: '1px solid #ccc',
                borderRadius: 4,
                width: '100%'
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  fontSize: '0.9em',
                  background: '#0066cc',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                Szukaj
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.9em',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}
                >
                  Wyczyść
                </button>
              )}
            </div>
          </form>
        </div>

        <h2>Rozpoczęcie studiów</h2>
        <ul>
          <li 
            onClick={() => applyFilter({ year: '2026' })}
            style={{ 
              background: searchParams.get('year') === '2026' ? '#e3f2fd' : 'transparent',
              cursor: 'pointer'
            }}
          >
            2026/2027 {searchParams.get('year') === '2026' && '✓'}
          </li>
          <li 
            onClick={() => applyFilter({ year: '2025' })}
            style={{ 
              background: searchParams.get('year') === '2025' ? '#e3f2fd' : 'transparent',
              cursor: 'pointer'
            }}
          >
            2025/2026 {searchParams.get('year') === '2025' && '✓'}
          </li>
          <li 
            onClick={() => applyFilter({ year: '' })}
            style={{ 
              background: !searchParams.get('year') ? '#e3f2fd' : 'transparent',
              cursor: 'pointer'
            }}
          >
            Wszystkie {!searchParams.get('year') && '✓'}
          </li>
        </ul>

        <h2>Poziom kształcenia</h2>
        <ul>
          <li 
            onClick={() => applyFilter({ level: 'I stopień' })}
            style={{ 
              background: searchParams.get('level') === 'I stopień' ? '#e3f2fd' : 'transparent',
              cursor: 'pointer'
            }}
          >
            I stopień {searchParams.get('level') === 'I stopień' && '✓'}
          </li>
          <li 
            onClick={() => applyFilter({ level: 'II stopień' })}
            style={{ 
              background: searchParams.get('level') === 'II stopień' ? '#e3f2fd' : 'transparent',
              cursor: 'pointer'
            }}
          >
            II stopień {searchParams.get('level') === 'II stopień' && '✓'}
          </li>
          <li 
            onClick={() => applyFilter({ level: '' })}
            style={{ 
              background: !searchParams.get('level') ? '#e3f2fd' : 'transparent',
              cursor: 'pointer'
            }}
          >
            Wszystkie {!searchParams.get('level') && '✓'}
          </li>
        </ul>

        <h2>Forma studiów</h2>
        <ul>
          <li 
            onClick={() => applyFilter({ mode: 'Stacjonarne' })}
            style={{ 
              background: searchParams.get('mode') === 'Stacjonarne' ? '#e3f2fd' : 'transparent',
              cursor: 'pointer'
            }}
          >
            Stacjonarne {searchParams.get('mode') === 'Stacjonarne' && '✓'}
          </li>
          <li 
            onClick={() => applyFilter({ mode: 'Niestacjonarne' })}
            style={{ 
              background: searchParams.get('mode') === 'Niestacjonarne' ? '#e3f2fd' : 'transparent',
              cursor: 'pointer'
            }}
          >
            Niestacjonarne {searchParams.get('mode') === 'Niestacjonarne' && '✓'}
          </li>
          <li 
            onClick={() => applyFilter({ mode: '' })}
            style={{ 
              background: !searchParams.get('mode') ? '#e3f2fd' : 'transparent',
              cursor: 'pointer'
            }}
          >
            Wszystkie {!searchParams.get('mode') && '✓'}
          </li>
        </ul>

        <h2>Nawigacja</h2>
        <ul>
          <li onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            Lista sylabusów
          </li>
          
          {isEditor && (
            <li onClick={() => navigate('/create')} style={{ cursor: 'pointer' }}>
              Nowy sylabus
            </li>
          )}
          
          <li onClick={() => navigate('/grid')} style={{ cursor: 'pointer' }}>
            Siatka przedmiotów
          </li>
        </ul>

        {user && !isEditor && (
          <div style={{ 
            marginTop: 20, 
            padding: 10, 
            background: '#fff3cd', 
            borderRadius: 4,
            fontSize: '0.85em'
          }}>
            ℹ️ Masz uprawnienia tylko do odczytu
          </div>
        )}

        {/* Podsumowanie aktywnych filtrów */}
        {hasActiveFilters && (
          <div style={{ 
            marginTop: 20, 
            padding: 10, 
            background: '#e3f2fd', 
            borderRadius: 4,
            fontSize: '0.85em'
          }}>
            <strong>Aktywne filtry:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
              {searchParams.get('search') && <li>Szukaj: "{searchParams.get('search')}"</li>}
              {searchParams.get('year') && <li>Rok: {searchParams.get('year')}</li>}
              {searchParams.get('level') && <li>Poziom: {searchParams.get('level')}</li>}
              {searchParams.get('mode') && <li>Tryb: {searchParams.get('mode')}</li>}
            </ul>
          </div>
        )}
      </div>

      <div className="right">
        {children}
      </div>

      <div className="footer">
        <p style={{ textAlign: 'center', lineHeight: '100px', margin: 0 }}>
          © Uczelnia — System Zarządzania Sylabusami
        </p>
      </div>
    </>
  );
}