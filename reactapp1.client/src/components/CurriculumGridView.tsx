import React from 'react';
import { fetchCurriculums } from '../api/api';
import type { Curriculum } from '../types/types';

export default function CurriculumGridView() {
  const [curriculums, setCurriculums] = React.useState<Curriculum[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setLoading(true);
    fetchCurriculums()
      .then(data => {
        setCurriculums(data);
        setLoading(false);
      })
      .catch(err => {
        setError(String(err));
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Ładowanie siatek przedmiotów...</div>;
  if (error) return <div style={{ color: 'red' }}>Błąd: {error}</div>;

  return (
    <div>
      <h2>Siatki przedmiotów</h2>
      
      {curriculums.length === 0 ? (
        <p>Brak siatek przedmiotów.</p>
      ) : (
        curriculums.map(curriculum => (
          <div key={curriculum.id} style={{ marginBottom: 30, padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
            <h3>{curriculum.name}</h3>
            <p><strong>Kod:</strong> {curriculum.code}</p>
            <p><strong>Rok akademicki:</strong> {curriculum.academicYear}/{curriculum.academicYear + 1}</p>
            <p><strong>Poziom:</strong> {curriculum.level || '-'}</p>
            <p><strong>Forma:</strong> {curriculum.studyMode || '-'}</p>
            {curriculum.description && <p>{curriculum.description}</p>}
            
            {curriculum.subjects && curriculum.subjects.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4>Przedmioty ({curriculum.subjects.length})</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5' }}>
                      <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'left' }}>Kod</th>
                      <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'left' }}>Nazwa</th>
                      <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'center' }}>Semestr</th>
                      <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'center' }}>ECTS</th>
                      <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'left' }}>Typ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {curriculum.subjects
                      .sort((a, b) => a.semester - b.semester)
                      .map(subject => (
                        <tr key={subject.id}>
                          <td style={{ padding: 8, border: '1px solid #ddd' }}>{subject.code}</td>
                          <td style={{ padding: 8, border: '1px solid #ddd' }}>{subject.name}</td>
                          <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'center' }}>{subject.semester}</td>
                          <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'center' }}>{subject.ectsPoints}</td>
                          <td style={{ padding: 8, border: '1px solid #ddd' }}>{subject.subjectType || '-'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}