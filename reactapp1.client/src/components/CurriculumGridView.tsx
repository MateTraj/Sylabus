import React, { useEffect, useState } from 'react';
import { fetchSyllabuses } from '../api/api';
import { Syllabus } from '../types/types';
import { Link } from 'react-router-dom';

/**
 * Pokazuje siatkê przedmiotów: wiersz = przedmiot, kolumny = semestry 1..10, zawiera godziny.
 */
export default function CurriculumGridView() {
  const [items, setItems] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const list = await fetchSyllabuses();
        setItems(list);
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <p>£adowanie siatki...</p>;

  const semesters = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div>
      <h2>Siatka przedmiotów</h2>
      <table className="table" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Przedmiot</th>
            {semesters.map(s => <th key={s}>Sem {s}</th>)}
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td><Link to={`/syllabus/${item.id}`}>{item.title}</Link></td>
              {semesters.map(s => {
                const entry = item.curriculumEntries?.find(e => e.semester === s);
                return <td key={s}>{entry ? entry.hours : ''}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}