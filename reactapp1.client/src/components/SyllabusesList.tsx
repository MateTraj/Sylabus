import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Curriculum } from '../types/types';
import { fetchCurriculums, canEdit } from '../api/api';

/**
 * Lista sylabusów (siatek przedmiotów) - NOWA STRONA GŁÓWNA
 */
export default function SyllabusesList() {
  const [list, setList] = React.useState<Curriculum[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditor = canEdit();

  /**
   * Ładuje sylabusy z uwzględnieniem filtrów z URL
   */
  async function load() {
    console.log('SyllabusesList: ładowanie sylabusów...');
    setLoading(true);
    setError('');

    try {
      const year = searchParams.get('year') || undefined;
      const level = searchParams.get('level') || undefined;
      const mode = searchParams.get('mode') || undefined;
      const search = searchParams.get('search') || undefined;

      console.log('Aktywne filtry:', { year, level, mode, search });

      // Pobierz wszystkie siatki
      const allData = await fetchCurriculums();
      console.log(`Pobrano ${allData.length} sylabusów z API`);

      // Filtrowanie po stronie klienta
      let filtered = allData;

      if (year) {
        const yearNum = parseInt(year);
        filtered = filtered.filter(c => c.academicYear === yearNum);
        console.log(`Po roku ${year}: ${filtered.length} sylabusów`);
      }

      if (level) {
        filtered = filtered.filter(c => c.level === level);
        console.log(`Po poziomie "${level}": ${filtered.length} sylabusów`);
      }

      if (mode) {
        filtered = filtered.filter(c => c.studyMode === mode);
        console.log(`Po trybie "${mode}": ${filtered.length} sylabusów`);
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(c => 
          c.name.toLowerCase().includes(searchLower) || 
          c.code.toLowerCase().includes(searchLower) ||
          c.description?.toLowerCase().includes(searchLower)
        );
        console.log(`Po wyszukiwaniu "${search}": ${filtered.length} sylabusów`);
      }

      setList(filtered);
      console.log(`Wyświetlono ${filtered.length} z ${allData.length} sylabusów`);

    } catch (err) {
      console.error('Błąd pobierania sylabusów:', err);
      setError(`Błąd: ${err}`);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, [searchParams]);

  if (loading) {
    return (
      <div>
        <h2>Sylabusy kierunków studiów</h2>
        <p>Ładowanie...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2>Sylabusy kierunków studiów</h2>
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
      <h2>Sylabusy kierunków studiów</h2>
      <p style={{ color: '#666', marginBottom: 20 }}>
        Wybierz sylabus aby zobaczyć pełną siatkę przedmiotów
      </p>

      {hasFilters && (
        <div style={{ marginBottom: 16, padding: 12, background: '#e3f2fd', borderRadius: 6, fontSize: '0.9em' }}>
          📊 Wyświetlono <strong>{list.length}</strong> sylabusów spełniających kryteria
        </div>
      )}

      {isEditor && (
        <div style={{ marginBottom: 20 }}>
          <button 
            onClick={() => navigate('/curriculum/create')} 
            style={{ 
              padding: '12px 24px', 
              cursor: 'pointer',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontWeight: 'bold',
              fontSize: '1em'
            }}
          >
            ➕ Utwórz nowy sylabus
          </button>
        </div>
      )}

      {list.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', background: '#f8f9fa', borderRadius: 8 }}>
          {hasFilters ? (
            <>
              <p style={{ fontSize: '1.2em' }}>Nie znaleziono sylabusów spełniających kryteria.</p>
              <button 
                onClick={() => window.location.href = '/'}
                style={{ padding: '10px 20px', cursor: 'pointer', marginTop: 10 }}
              >
                Wyczyść filtry
              </button>
            </>
          ) : (
            <p style={{ fontSize: '1.2em' }}>Brak sylabusów w bazie danych.</p>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          {list.map(curriculum => {
            const subjectsCount = curriculum.subjects?.length || 0;
            const totalEcts = curriculum.subjects?.reduce((sum, s) => sum + s.ectsPoints, 0) || 0;

            return (
              <div 
                key={curriculum.id}
                onClick={() => navigate(`/curriculum/${curriculum.id}`)}
                style={{
                  padding: 24,
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  background: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  e.currentTarget.style.borderColor = '#0066cc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                  e.currentTarget.style.borderColor = '#ddd';
                }}
              >
                {/* Nagłówek */}
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ 
                    margin: '0 0 8px 0', 
                    color: '#0066cc',
                    fontSize: '1.3em'
                  }}>
                    {curriculum.name}
                  </h3>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>
                    Kod: <strong>{curriculum.code}</strong>
                  </div>
                </div>

                {/* Informacje podstawowe */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: 12,
                  marginBottom: 16,
                  padding: 16,
                  background: '#f8f9fa',
                  borderRadius: 6
                }}>
                  <div>
                    <div style={{ fontSize: '0.8em', color: '#666' }}>Rok akademicki</div>
                    <div style={{ fontWeight: 'bold' }}>
                      {curriculum.academicYear}/{curriculum.academicYear + 1}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8em', color: '#666' }}>Poziom</div>
                    <div style={{ fontWeight: 'bold' }}>{curriculum.level || '-'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8em', color: '#666' }}>Tryb</div>
                    <div style={{ fontWeight: 'bold' }}>{curriculum.studyMode || '-'}</div>
                  </div>
                  {curriculum.center && (
                    <div>
                      <div style={{ fontSize: '0.8em', color: '#666' }}>Wydział</div>
                      <div style={{ fontWeight: 'bold' }}>{curriculum.center.name}</div>
                    </div>
                  )}
                </div>

                {/* Opis */}
                {curriculum.description && (
                  <p style={{ 
                    margin: '0 0 16px 0', 
                    color: '#666',
                    fontSize: '0.95em',
                    lineHeight: 1.5
                  }}>
                    {curriculum.description}
                  </p>
                )}

                {/* Statystyki */}
                <div style={{ 
                  display: 'flex', 
                  gap: 24,
                  paddingTop: 16,
                  borderTop: '1px solid #eee',
                  fontSize: '0.9em'
                }}>
                  <div>
                    📚 <strong>{subjectsCount}</strong> przedmiotów
                  </div>
                  <div>
                    ⭐ <strong>{totalEcts}</strong> ECTS łącznie
                  </div>
                  {curriculum.createdAt && (
                    <div style={{ marginLeft: 'auto', color: '#999' }}>
                      Utworzono: {new Date(curriculum.createdAt).toLocaleDateString('pl-PL')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}