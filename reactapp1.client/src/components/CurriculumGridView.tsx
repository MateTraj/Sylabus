import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchCurriculums } from '../api/api';
import type { Curriculum } from '../types/types';

export default function CurriculumGridView() {
  const [curriculums, setCurriculums] = React.useState<Curriculum[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [searchParams] = useSearchParams();

  React.useEffect(() => {
    setLoading(true);
    setError('');

    // Pobierz filtry z URL
    const year = searchParams.get('year');
    const level = searchParams.get('level');
    const mode = searchParams.get('mode');

    console.log('CurriculumGridView: Filtry:', { year, level, mode });

    fetchCurriculums()
      .then(data => {
        // Filtruj po stronie klienta
        let filtered = data;

        if (year) {
          const yearNum = parseInt(year);
          filtered = filtered.filter(c => c.academicYear === yearNum);
        }

        if (level) {
          filtered = filtered.filter(c => c.level === level);
        }

        if (mode) {
          filtered = filtered.filter(c => c.studyMode === mode);
        }

        setCurriculums(filtered);
        setLoading(false);
      })
      .catch(err => {
        setError(String(err));
        setLoading(false);
      });
  }, [searchParams]); // Reaguj na zmiany filtrów

  if (loading) return <div>Ładowanie siatek przedmiotów...</div>;
  if (error) return <div style={{ color: 'red' }}>Błąd: {error}</div>;

  const hasFilters = searchParams.toString().length > 0;

  return (
    <div className="tekst">
      <h2>Siatki przedmiotów</h2>

      {hasFilters && (
        <div style={{ 
          marginBottom: 16, 
          padding: 12, 
          background: '#e3f2fd', 
          borderRadius: 6,
          fontSize: '0.9em'
        }}>
          📊 Wyświetlono <strong>{curriculums.length}</strong> siatek spełniających kryteria
        </div>
      )}
      
      {curriculums.length === 0 ? (
        <div style={{ 
          padding: 20, 
          textAlign: 'center', 
          background: '#f8f9fa', 
          borderRadius: 8 
        }}>
          {hasFilters ? (
            <>
              <p>😕 Nie znaleziono siatek spełniających kryteria.</p>
              <button 
                onClick={() => window.location.href = '/grid'}
                style={{ padding: '8px 16px', cursor: 'pointer' }}
              >
                Wyczyść filtry
              </button>
            </>
          ) : (
            <p>Brak siatek przedmiotów.</p>
          )}
        </div>
      ) : (
        curriculums.map(curriculum => (
          <div 
            key={curriculum.id} 
            style={{ 
              marginBottom: 30, 
              padding: 16, 
              border: '1px solid #ddd', 
              borderRadius: 8,
              background: '#fff'
            }}
          >
            <h3 style={{ marginTop: 0 }}>{curriculum.name}</h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: 12,
              marginBottom: 16,
              fontSize: '0.9em'
            }}>
              <div>
                <strong>Kod:</strong> {curriculum.code}
              </div>
              <div>
                <strong>Rok akademicki:</strong> {curriculum.academicYear}/{curriculum.academicYear + 1}
              </div>
              <div>
                <strong>Poziom:</strong> {curriculum.level || '-'}
              </div>
              <div>
                <strong>Forma:</strong> {curriculum.studyMode || '-'}
              </div>
              {curriculum.center && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>Wydział:</strong> {curriculum.center.name}
                </div>
              )}
            </div>

            {curriculum.description && (
              <p style={{ 
                fontSize: '0.9em', 
                color: '#666', 
                fontStyle: 'italic',
                marginBottom: 16 
              }}>
                {curriculum.description}
              </p>
            )}
            
            {curriculum.subjects && curriculum.subjects.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ 
                  marginBottom: 12,
                  padding: '8px 12px',
                  background: '#f8f9fa',
                  borderRadius: 4
                }}>
                  Przedmioty ({curriculum.subjects.length})
                  <span style={{ 
                    marginLeft: 10, 
                    fontSize: '0.85em', 
                    fontWeight: 'normal',
                    color: '#666'
                  }}>
                    Suma ECTS: {curriculum.subjects.reduce((sum, s) => sum + s.ectsPoints, 0)}
                  </span>
                </h4>
                
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse', 
                  fontSize: '0.9em' 
                }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5' }}>
                      <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'left' }}>Kod</th>
                      <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'left' }}>Nazwa</th>
                      <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'center' }}>Sem.</th>
                      <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'center' }}>ECTS</th>
                      <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'left' }}>Typ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {curriculum.subjects
                      .sort((a, b) => a.semester - b.semester) // Sortuj po semestrze
                      .map(subject => (
                        <tr key={subject.id}>
                          <td style={{ padding: 8, border: '1px solid #ddd' }}>
                            {subject.code}
                          </td>
                          <td style={{ padding: 8, border: '1px solid #ddd' }}>
                            {subject.name}
                          </td>
                          <td style={{ 
                            padding: 8, 
                            border: '1px solid #ddd', 
                            textAlign: 'center',
                            fontWeight: 'bold'
                          }}>
                            {subject.semester}
                          </td>
                          <td style={{ 
                            padding: 8, 
                            border: '1px solid #ddd', 
                            textAlign: 'center' 
                          }}>
                            {subject.ectsPoints}
                          </td>
                          <td style={{ padding: 8, border: '1px solid #ddd' }}>
                            {subject.subjectType || '-'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                {/* Statystyki per semestr */}
                <div style={{ 
                  marginTop: 12, 
                  padding: 10, 
                  background: '#f8f9fa', 
                  borderRadius: 4,
                  fontSize: '0.85em'
                }}>
                  <strong>Rozkład ECTS po semestrach:</strong>
                  <div style={{ marginTop: 8, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {Array.from({ length: 8 }, (_, i) => i + 1).map(sem => {
                      const semSubjects = curriculum.subjects!.filter(s => s.semester === sem);
                      const semEcts = semSubjects.reduce((sum, s) => sum + s.ectsPoints, 0);
                      return semEcts > 0 ? (
                        <span key={sem}>
                          Sem. {sem}: <strong>{semEcts} ECTS</strong> ({semSubjects.length} przedmiotów)
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}