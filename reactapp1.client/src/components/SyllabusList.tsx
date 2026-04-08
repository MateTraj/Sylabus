import React, { useEffect, useState } from 'react';
import { Syllabus } from '../types/types';
import { fetchSyllabuses } from '../api/api';
import { Link } from 'react-router-dom';

export default function SyllabusList() {
  const [list, setList] = useState<Syllabus[]>([]);
  const [search, setSearch] = useState('');
  const [year, setYear] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [centers, setCenters] = useState<Array<{ id?: string; name?: string }>>([]);
  const [centerId, setCenterId] = useState<string | ''>('');

  async function load() {
    setLoading(true);
    try {
      const data = await fetchSyllabuses({ search: search || undefined, year: year ? Number(year) : undefined });
      setList(data);
      // derive centers from fetched list
      const unique = Array.from(new Map(data.map(s => [s.center?.id || '', { id: s.center?.id, name: s.center?.name }])).values());
      setCenters(unique.filter(c => c.name));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // apply client-side center filter (server supports centerId but controllers may not expose centers endpoint)
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, year, centerId]);

  const filtered = centerId ? list.filter(s => s.centerId === centerId) : list;

  return (
    <div>
      <h2>Lista sylabusów</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="Szukaj po tytule lub kodzie" value={search} onChange={e => setSearch(e.target.value)} />
        <input placeholder="Rok" value={year} onChange={e => setYear(e.target.value === '' ? '' : Number(e.target.value))} style={{ width: 80 }} />
        <select value={centerId} onChange={e => setCenterId(e.target.value)}>
          <option value="">Wszystkie oœrodki</option>
          {centers.map(c => c.id && <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <Link to="/create"><button>Nowy sylabus</button></Link>
        <Link to="/grid"><button>Siatka przedmiotów</button></Link>
      </div>

      {loading ? <p>£adowanie...</p> : (
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Kod</th>
              <th>Tytu³</th>
              <th>Oœrodek</th>
              <th>Rok</th>
              <th>Wersja (najnowsza)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <td><Link to={`/syllabus/${s.id}`}>{s.code}</Link></td>
                <td><Link to={`/syllabus/${s.id}`}>{s.title}</Link></td>
                <td>{s.center?.name}</td>
                <td>{s.yearIntroduced}</td>
                <td>{s.versions && s.versions.length ? s.versions[0].versionNumber : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}