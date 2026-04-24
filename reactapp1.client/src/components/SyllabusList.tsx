import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Subject } from '../types/types';
import { fetchSubjects } from '../api/api';

export default function SyllabusList() {
  const [list, setList] = React.useState<Subject[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const navigate = useNavigate();

  async function load() {
    console.log('SyllabusList: ładowanie danych...');
    setLoading(true);
    setError('');
    try {
      const data = await fetchSubjects();
      console.log('SyllabusList: pobrano dane:', data);
      setList(data);
    } catch (err) {
      console.error('SyllabusList: błąd pobierania:', err);
      setError(`Błąd: ${err}`);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, []);

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

  return (
    <div>
      <h2>Lista przedmiotów</h2>
      
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => navigate('/create')} style={{ padding: '10px 16px', cursor: 'pointer' }}>
          + Dodaj nowy przedmiot
        </button>
      </div>

      {list.length === 0 ? (
        <p>Brak przedmiotów w bazie danych.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
              <th style={{ padding: 10, border: '1px solid #ddd' }}>Kod</th>
              <th style={{ padding: 10, border: '1px solid #ddd' }}>Nazwa</th>
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
                <td style={{ padding: 10 }}>{s.semester}</td>
                <td style={{ padding: 10 }}>{s.ectsPoints}</td>
                <td style={{ padding: 10 }}>{s.subjectType || '-'}</td>
                <td style={{ padding: 10 }}>
                  <button onClick={() => navigate(`/syllabus/${s.id}`)} style={{ cursor: 'pointer' }}>
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