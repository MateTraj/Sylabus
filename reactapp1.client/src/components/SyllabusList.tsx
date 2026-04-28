import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Subject } from '../types/types';
import { fetchSubjects, canEdit } from '../api/api';

export default function SyllabusList() {
  const [list, setList] = React.useState<Subject[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditor = canEdit();

  /**
   * Ładuje przedmioty z uwzględnieniem filtrów z URL.
   */
  async function load() {
    console.log('SyllabusList: ładowanie danych...');
    setLoading(true);
    setError('');
    
    try {
      // Pobierz parametry filtrów z URL
      const search = searchParams.get('search') || undefined;
      const year = searchParams.get('year') || undefined;
      const level = searchParams.get('level') || undefined;
      const mode = searchParams.get('mode') || undefined;

      console.log('🔍 Aktywne filtry:', { search, year, level, mode });

      // Pobierz wszystkie dane z API
      const allData = await fetchSubjects();
      console.log(`📦 Pobrano ${allData.length} przedmiotów z API`);

      // === FILTROWANIE PO STRONIE KLIENTA ===
      let filtered = allData;

      // Filtr po wyszukiwaniu (nazwa lub kod)
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(s => 
          s.name.toLowerCase().includes(searchLower) || 
          s.code.toLowerCase().includes(searchLower)
        );
        console.log(`🔎 Po wyszukiwaniu "${search}": ${filtered.length} przedmiotów`);
      }

      // Filtr po roku akademickim
      if (year) {
        const yearNum = parseInt(year);
        filtered = filtered.filter(s => s.curriculum?.academicYear === yearNum);
        console.log(`📅 Po roku ${year}: ${filtered.length} przedmiotów`);
      }

      // Filtr po poziomie kształcenia
      if (level) {
        filtered = filtered.filter(s => s.curriculum?.level === level);
        console.log(`🎓 Po poziomie "${level}": ${filtered.length} przedmiotów`);
      }

      // Filtr po trybie studiów
      if (mode) {
        filtered = filtered.filter(s => s.curriculum?.studyMode === mode);
        console.log(`📚 Po trybie "${mode}": ${filtered.length} przedmiotów`);
      }

      setList(filtered);
      console.log(`✅ Wyświetlono ${filtered.length} z ${allData.length} przedmiotów`);
      
    } catch (err) {
      console.error('❌ SyllabusList: błąd pobierania:', err);
      setError(`Błąd: ${err}`);
    } finally {
      setLoading(false);
    }
  }

  // Przeładuj dane gdy zmienią się parametry URL
  React.useEffect(() => {
    load();
  }, [searchParams]); // 🔄 Reaguj na zmiany w URL

  if (loading) {
    return (
      <div>
        <h2>Lista przedmiotów</h2>
        <p>Ładowanie...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2>Lista przedmiotów</h2>
        <div style={{ background: '#fee', color: '#c00', padding: 12, borderRadius: 6 }}>
          {error}
        </div>
        <button onClick={load} style={{ marginTop: 10 }}>Spróbuj ponownie</button>
      </div>
    );
  }

  const hasFilters = searchParams.toString().length > 0;

  return (
    <div>
      <h2>Lista przedmiotów</h2>
      
      {/* Informacja o filtrach */}
      {hasFilters && (
        <div style={{ marginBottom: 16, padding: 12, background: '#e3f2fd', borderRadius: 6, fontSize: '0.9em' }}>
          📊 Wyświetlono <strong>{list.length}</strong> przedmiotów spełniających kryteria
        </div>
      )}

      {isEditor && (
        <div style={{ marginBottom: 16 }}>
          <button 
            onClick={() => navigate('/create')} 
            style={{ 
              padding: '10px 16px', 
              cursor: 'pointer',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontWeight: 'bold'
            }}
          >
            + Dodaj nowy przedmiot
          </button>
        </div>
      )}

      {list.length === 0 ? (
        <div style={{ padding: 20, textAlign: 'center', background: '#f8f9fa', borderRadius: 8 }}>
          {hasFilters ? (
            <>
              <p>😕 Nie znaleziono przedmiotów spełniających kryteria.</p>
              <button 
                onClick={() => window.location.href = '/'}
                style={{ padding: '8px 16px', cursor: 'pointer' }}
              >
                Wyczyść filtry
              </button>
            </>
          ) : (
            <p>Brak przedmiotów w bazie danych.</p>
          )}
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
              <th style={{ padding: 10, border: '1px solid #ddd' }}>Kod</th>
              <th style={{ padding: 10, border: '1px solid #ddd' }}>Nazwa</th>
              <th style={{ padding: 10, border: '1px solid #ddd' }}>Siatka</th>
              <th style={{ padding: 10, border: '1px solid #ddd' }}>Semestr</th>
              <th style={{ padding: 10, border: '1px solid #ddd' }}>ECTS</th>
              <th style={{ padding: 10, border: '1px solid #ddd' }}>Typ</th>
              <th style={{ padding: 10, border: '1px solid #ddd' }}>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {list.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: 10 }}>{s.code}</td>
                <td style={{ padding: 10 }}>{s.name}</td>
                <td style={{ padding: 10, fontSize: '0.85em', color: '#666' }}>
                  {s.curriculum?.name || '-'}
                </td>
                <td style={{ padding: 10, textAlign: 'center' }}>{s.semester}</td>
                <td style={{ padding: 10, textAlign: 'center' }}>{s.ectsPoints}</td>
                <td style={{ padding: 10 }}>{s.subjectType || '-'}</td>
                <td style={{ padding: 10 }}>
                  <button 
                    onClick={() => navigate(`/syllabus/${s.id}`)} 
                    style={{ 
                      cursor: 'pointer',
                      padding: '6px 12px',
                      background: '#0066cc',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4
                    }}
                  >
                    Szczegóły
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}