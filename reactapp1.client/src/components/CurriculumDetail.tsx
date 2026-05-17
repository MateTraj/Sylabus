import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Curriculum } from '../types/types';
import { fetchCurriculum, deleteCurriculum, canEdit, hasRole } from '../api/api';

export default function CurriculumDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [curriculum, setCurriculum] = React.useState<Curriculum | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [deleting, setDeleting] = React.useState(false);
  
  const isEditor = canEdit();
  const isAdmin = hasRole('Admin');

  React.useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    fetchCurriculum(id)
      .then(data => {
        setCurriculum(data);
        setLoading(false);
      })
      .catch(err => {
        setError(String(err));
        setLoading(false);
      });
  }, [id]);

  // Obsługa usuwania
  async function handleDelete() {
    if (!id || !curriculum) return;

    const subjectsCount = curriculum.subjects?.length || 0;
    
    if (subjectsCount > 0) {
      alert(`❌ Nie można usunąć sylabusa zawierającego ${subjectsCount} przedmiotów.\n\nNajpierw usuń wszystkie przedmioty z tego sylabusa.`);
      return;
    }

    const confirmed = confirm(
      `⚠️ Czy na pewno chcesz usunąć sylabus "${curriculum.name}"?\n\n` +
      `Tej operacji nie można cofnąć!`
    );

    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteCurriculum(id);
      console.log('✅ Usunięto sylabus');
      navigate('/');
    } catch (err) {
      alert(`❌ Błąd usuwania: ${err}`);
      console.error('Błąd usuwania sylabusa:', err);
      setDeleting(false);
    }
  }

  if (loading) return <div>Ładowanie sylabusa...</div>;
  if (error) return <div style={{ color: 'red' }}>Błąd: {error}</div>;
  if (!curriculum) return <div>Nie znaleziono sylabusa</div>;

  // Pogrupuj przedmioty po semestrach
  const subjectsBySemester = new Map<number, typeof curriculum.subjects>();
  curriculum.subjects?.forEach(subject => {
    const semester = subject.semester;
    if (!subjectsBySemester.has(semester)) {
      subjectsBySemester.set(semester, []);
    }
    subjectsBySemester.get(semester)!.push(subject);
  });

  // Posortuj semestry
  const sortedSemesters = Array.from(subjectsBySemester.keys()).sort((a, b) => a - b);

  return (
    <div>
      {/* Nagłówek z nawigacją i akcjami */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 20,
        gap: 12
      }}>
        <button 
          onClick={() => navigate('/')} 
          style={{ 
            padding: '8px 16px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          ← Powrót do listy
        </button>

        <div style={{ display: 'flex', gap: 12 }}>
          {/* Przycisk edycji - dla Editorów */}
          {isEditor && (
            <button
              onClick={() => navigate(`/curriculum/edit/${curriculum.id}`)}
              style={{
                padding: '10px 20px',
                background: '#0066cc',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ✏️ Edytuj sylabus
            </button>
          )}

          {/* Przycisk dodawania przedmiotu */}
          {isEditor && (
            <button
              onClick={() => navigate(`/subject/create?curriculumId=${curriculum.id}`)}
              style={{
                padding: '10px 20px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ➕ Dodaj przedmiot
            </button>
          )}

          {/* Przycisk usuwania - tylko dla Adminów */}
          {isAdmin && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                padding: '10px 20px',
                background: deleting ? '#ccc' : '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: deleting ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {deleting ? '⏳ Usuwanie...' : '🗑️ Usuń sylabus'}
            </button>
          )}
        </div>
      </div>

      {/* Informacje o sylabusie */}
      <div style={{ 
        padding: 24,
        background: '#f8f9fa',
        borderRadius: 8,
        marginBottom: 30
      }}>
        <h2 style={{ marginTop: 0, color: '#0066cc' }}>{curriculum.name}</h2>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 16
        }}>
          <div>
            <strong>Kod sylabusa:</strong> {curriculum.code}
          </div>
          <div>
            <strong>Rok akademicki:</strong> {curriculum.academicYear}/{curriculum.academicYear + 1}
          </div>
          <div>
            <strong>Poziom:</strong> {curriculum.level || '-'}
          </div>
          <div>
            <strong>Tryb:</strong> {curriculum.studyMode || '-'}
          </div>
          {curriculum.center && (
            <div>
              <strong>Wydział:</strong> {curriculum.center.name}
            </div>
          )}
        </div>

        {curriculum.description && (
          <div style={{ paddingTop: 16, borderTop: '1px solid #ddd' }}>
            <strong>Opis:</strong>
            <p style={{ marginTop: 8 }}>{curriculum.description}</p>
          </div>
        )}

        {/* Podsumowanie */}
        <div style={{ 
          marginTop: 16,
          padding: 16,
          background: '#e3f2fd',
          borderRadius: 6,
          display: 'flex',
          gap: 24
        }}>
          <div>
            📚 <strong>{curriculum.subjects?.length || 0}</strong> przedmiotów
          </div>
          <div>
            ⭐ <strong>{curriculum.subjects?.reduce((sum, s) => sum + s.ectsPoints, 0) || 0}</strong> ECTS łącznie
          </div>
          <div>
            🗓️ <strong>{sortedSemesters.length}</strong> semestrów
          </div>
        </div>
      </div>

      {/* Siatka przedmiotów po semestrach */}
      <h3 style={{ marginBottom: 20 }}>Siatka przedmiotów</h3>

      {sortedSemesters.length === 0 ? (
        <div style={{ 
          padding: 40, 
          textAlign: 'center', 
          background: '#f8f9fa', 
          borderRadius: 8 
        }}>
          <p style={{ fontSize: '1.1em', marginBottom: 16 }}>
            Ten sylabus nie zawiera jeszcze przedmiotów.
          </p>
          {isEditor && (
            <button
              onClick={() => navigate(`/subject/create?curriculumId=${curriculum.id}`)}
              style={{
                padding: '10px 20px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              Dodaj pierwszy przedmiot
            </button>
          )}
        </div>
      ) : (
        sortedSemesters.map(semester => {
          const subjects = subjectsBySemester.get(semester)!;
          const semesterEcts = subjects.reduce((sum, s) => sum + s.ectsPoints, 0);

          return (
            <div 
              key={semester}
              style={{ 
                marginBottom: 30,
                border: '1px solid #ddd',
                borderRadius: 8,
                overflow: 'hidden'
              }}
            >
              {/* Nagłówek semestru */}
              <div style={{ 
                padding: 16,
                background: '#0066cc',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h4 style={{ margin: 0 }}>Semestr {semester}</h4>
                <div style={{ fontSize: '0.9em' }}>
                  {subjects.length} przedmiotów | {semesterEcts} ECTS
                </div>
              </div>

              {/* Tabela przedmiotów */}
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>Kod</th>
                    <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>Nazwa przedmiotu</th>
                    <th style={{ padding: 12, textAlign: 'center', border: '1px solid #ddd' }}>ECTS</th>
                    <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>Typ</th>
                    <th style={{ padding: 12, textAlign: 'center', border: '1px solid #ddd' }}>Wersje</th>
                    <th style={{ padding: 12, textAlign: 'center', border: '1px solid #ddd' }}>Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(subject => (
                      <tr key={subject.id} style={{ borderBottom: '1px solid #ddd' }}>
                        <td style={{ padding: 12 }}>{subject.code}</td>
                        <td style={{ padding: 12, fontWeight: 500 }}>{subject.name}</td>
                        <td style={{ padding: 12, textAlign: 'center', fontWeight: 'bold' }}>
                          {subject.ectsPoints}
                        </td>
                        <td style={{ padding: 12 }}>
                          {subject.subjectType || '-'}
                        </td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          {subject.versions?.length || 0}
                        </td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <button 
                            onClick={() => navigate(`/subject/${subject.id}`)} 
                            style={{ 
                              padding: '6px 12px',
                              background: '#0066cc',
                              color: 'white',
                              border: 'none',
                              borderRadius: 4,
                              cursor: 'pointer',
                              fontSize: '0.9em'
                            }}
                          >
                            Szczegóły
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          );
        })
      )}
    </div>
  );
}