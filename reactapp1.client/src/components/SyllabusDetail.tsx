import * as React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Syllabus, SyllabusVersion } from '../types/types';
import { fetchSyllabus, addVersion } from '../api/api';

export default function SyllabusDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = React.useState<Syllabus | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [adding, setAdding] = React.useState(false);
  const [form, setForm] = React.useState<Partial<SyllabusVersion>>({
    title: '',
    versionNumber: 1,
    totalHours: 0,
    theoryHours: 0,
    labHours: 0,
    otherHours: 0,
    description: '',
    changeNote: '',
  });

  React.useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const s = await fetchSyllabus(id);
        setItem(s);
      } finally { setLoading(false); }
    })();
  }, [id]);

  if (!id) return <p>Brak id</p>;
  if (loading || !item) return <p>Ładowanie...</p>;

  // gwarantujemy typ string dla dalszego użycia
  const sid: string = id as string;

  async function handleAddVersion(e?: React.FormEvent) {
    e?.preventDefault();
    setAdding(true);
    try {
      await addVersion(sid, {
        title: form.title || item!.title,
        versionNumber: form.versionNumber || 1,
        description: form.description,
        totalHours: form.totalHours || 0,
        theoryHours: form.theoryHours || 0,
        labHours: form.labHours || 0,
        otherHours: form.otherHours || 0,
        changeNote: form.changeNote,
      });
      const s = await fetchSyllabus(sid);
      setItem(s);
      setForm({ ...form, title: '', changeNote: '' });
    } catch (err) {
      alert(String(err));
    } finally { setAdding(false); }
  }

  return (
    <div>
      <button onClick={() => navigate(-1)}>Powrót</button>
      <h2>{item!.title} ({item!.code})</h2>
      <p><strong>Wydział:</strong> {item!.center?.name}</p>
      <p><strong>Rok wprowadzenia:</strong> {item!.yearIntroduced}</p>
      <p>{item!.description}</p>

      <h3>Wersje</h3>
      <ul>
        {item!.versions?.map(v => (
          <li key={v.id}>
            <strong>v{v.versionNumber}</strong> — {v.title} — utworzono: {new Date(v.createdAt).toLocaleString()}
            <div>Godziny: {v.totalHours} (W:{v.theoryHours} L:{v.labHours} O:{v.otherHours})</div>
            <div>Notatka: {v.changeNote}</div>
          </li>
        ))}
      </ul>

      <h3>Dodaj wersję</h3>
      <form onSubmit={handleAddVersion} style={{ display: 'grid', gap: 8, maxWidth: 600 }}>
        <input placeholder="Tytuł wersji" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} />
        <input type="number" placeholder="Numer wersji" value={form.versionNumber ?? 1} onChange={e => setForm({ ...form, versionNumber: Number(e.target.value) })} />
        <textarea placeholder="Opis" value={form.description || ''} onChange={e => setForm({ ...form, description: e.currentTarget.value })} />
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="number" placeholder="Suma godzin" value={form.totalHours ?? 0} onChange={e => setForm({ ...form, totalHours: Number(e.target.value) })} />
          <input type="number" placeholder="Wykłady" value={form.theoryHours ?? 0} onChange={e => setForm({ ...form, theoryHours: Number(e.target.value) })} />
          <input type="number" placeholder="Ćwiczenia" value={form.labHours ?? 0} onChange={e => setForm({ ...form, labHours: Number(e.target.value) })} />
          <input type="number" placeholder="Inne" value={form.otherHours ?? 0} onChange={e => setForm({ ...form, otherHours: Number(e.target.value) })} />
        </div>
        <input placeholder="Notatka zmian" value={form.changeNote || ''} onChange={e => setForm({ ...form, changeNote: e.target.value })} />
        <div>
          <button type="submit" disabled={adding}>Dodaj wersję</button>
          <Link to={`/syllabus/${sid}/export`}><button type="button" style={{ marginLeft: 8 }}>Eksport (wymaga endpointu)</button></Link>
        </div>
      </form>

      <h3>Siatka przedmiotów (dla tego sylabusa)</h3>
      <table className="table">
        <thead><tr><th>Semestr</th><th>Godziny</th></tr></thead>
        <tbody>
          {item!.curriculumEntries?.map(e => (
            <tr key={e.id}><td>{e.semester}</td><td>{e.hours}</td></tr>
          )) ?? <tr><td colSpan={2}>Brak</td></tr>}
        </tbody>
      </table>
    </div>
  );
}