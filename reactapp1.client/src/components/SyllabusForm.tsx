import React, { useState } from 'react';
import { createSyllabus } from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function SyllabusForm() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    code: '',
    title: '',
    description: '',
    yearIntroduced: new Date().getFullYear(),
    centerId: '',
  });
  const [initialVersion, setInitialVersion] = useState({
    title: '',
    versionNumber: 1,
    totalHours: 0,
    theoryHours: 0,
    labHours: 0,
    otherHours: 0,
    description: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload: any = {
        code: form.code,
        title: form.title,
        description: form.description,
        yearIntroduced: form.yearIntroduced,
        centerId: form.centerId || null,
        versions: [{
          title: initialVersion.title || form.title,
          versionNumber: initialVersion.versionNumber || 1,
          totalHours: initialVersion.totalHours || 0,
          theoryHours: initialVersion.theoryHours || 0,
          labHours: initialVersion.labHours || 0,
          otherHours: initialVersion.otherHours || 0,
          description: initialVersion.description,
        }],
        curriculumEntries: [], // mo¿esz dodaæ pola do wprowadzania siatki
      };
      const created = await createSyllabus(payload);
      nav(`/syllabus/${created.id}`);
    } catch (err) {
      alert(String(err));
    }
  }

  return (
    <div>
      <h2>Nowy sylabus</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8, maxWidth: 700 }}>
        <input placeholder="Kod" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
        <input placeholder="Tytu³" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <input placeholder="Rok wprowadzenia" type="number" value={form.yearIntroduced} onChange={e => setForm({ ...form, yearIntroduced: Number(e.target.value) })} />
        <input placeholder="Oœrodek Id (opcjonalnie)" value={form.centerId} onChange={e => setForm({ ...form, centerId: e.target.value })} />
        <textarea placeholder="Opis" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

        <h4>Pierwsza wersja</h4>
        <input placeholder="Tytu³ wersji" value={initialVersion.title} onChange={e => setInitialVersion({ ...initialVersion, title: e.target.value })} />
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="number" placeholder="Suma godzin" value={initialVersion.totalHours} onChange={e => setInitialVersion({ ...initialVersion, totalHours: Number(e.target.value) })} />
          <input type="number" placeholder="Wyk³ady" value={initialVersion.theoryHours} onChange={e => setInitialVersion({ ...initialVersion, theoryHours: Number(e.target.value) })} />
          <input type="number" placeholder="Æwiczenia" value={initialVersion.labHours} onChange={e => setInitialVersion({ ...initialVersion, labHours: Number(e.target.value) })} />
          <input type="number" placeholder="Inne" value={initialVersion.otherHours} onChange={e => setInitialVersion({ ...initialVersion, otherHours: Number(e.target.value) })} />
        </div>
        <textarea placeholder="Opis wersji" value={initialVersion.description} onChange={e => setInitialVersion({ ...initialVersion, description: e.target.value })} />

        <div>
          <button type="submit">Utwórz sylabus</button>
          <button type="button" onClick={() => nav(-1)} style={{ marginLeft: 8 }}>Anuluj</button>
        </div>
      </form>
    </div>
  );
}