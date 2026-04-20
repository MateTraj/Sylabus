import React from 'react';
import { Link } from 'react-router-dom';
import type { Syllabus } from '../types/types';
import { fetchSyllabuses } from '../api/api';

export default function SyllabusList() {
  const [list, setList] = React.useState<Syllabus[]>([]);
  const [search, setSearch] = React.useState('');
  const [year, setYear] = React.useState<number | ''>('');
  const [loading, setLoading] = React.useState(false);
  const [centers, setCenters] = React.useState<Array<{ id?: string; name?: string }>>([]);
  const [centerId, setCenterId] = React.useState<string | ''>('');
  const [error, setError] = React.useState('');

  async function load() {
    console.log('SyllabusList: load() called with search=', search, 'year=', year);
    setLoading(true);
    setError('');
    try {
      const data = await fetchSyllabuses({ search: search || undefined, year: year ? Number(year) : undefined });
      console.log('SyllabusList: fetched data', data);
      setList(data);
      const unique = Array.from(new Map(data.map(s => [s.center?.id || '', { id: s.center?.id, name: s.center?.name }])).values());
      setCenters(unique.filter(c => c.name));
    } catch (err) {
      console.error('SyllabusList: fetch error', err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); }, []);
  React.useEffect(() => { load(); }, [search, year, centerId]);

  const filtered = centerId ? list.filter(s => s.centerId === centerId) : list;

  return (
    <div>
      <h2>Lista sylabusów</h2>

      {error && <div style={{background:'#fee',color:'#c00',padding:8,marginBottom:8,borderRadius:6}}>{error}</div>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="Szukaj po tytule lub kodzie" value={search} onChange={e => setSearch(e.target.value)} />
        <input placeholder="Rok" value={year} onChange={e => setYear(e.target.value === '' ? '' : Number(e.target.value))} style={{ width: 80 }} />
        <select value={centerId} onChange={e => setCenterId(e.target.value)}>
          <option value="">Wszystkie ośrodki</option>
          {centers.map(c => c.id && <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <Link to="/create"><button>Nowy sylabus</button></Link>
        <Link to="/grid"><button>Siatka przedmiotów</button></Link>
      </div>

      {loading ? <p>Ładowanie...</p> : (
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Kod</th>
              <th>Tytuł</th>
              <th>Ośrodek</th>
              <th>Rok</th>
              <th>Wersja (najnowsza)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} style={{textAlign:'center',padding:16}}>Brak sylabusów</td></tr>
            ) : (
              filtered.map(s => (
                <tr key={s.id}>
                  <td><Link to={`/syllabus/${s.id}`}>{s.code}</Link></td>
                  <td><Link to={`/syllabus/${s.id}`}>{s.title}</Link></td>
                  <td>{s.center?.name}</td>
                  <td>{s.yearIntroduced}</td>
                  <td>{s.versions && s.versions.length ? s.versions[0].versionNumber : '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}