import type { Syllabus, SyllabusVersion } from '../types/types';

const base = '/api/syllabuses';

export async function fetchSyllabuses(params?: { centerId?: string; year?: number; search?: string }) {
  const query = new URLSearchParams();
  if (params?.centerId) query.set('centerId', params.centerId);
  if (params?.year) query.set('year', String(params.year));
  if (params?.search) query.set('search', params.search);
  const res = await fetch(`${base}?${query.toString()}`);
  if (!res.ok) throw new Error('Błąd pobierania sylabusów');
  return res.json() as Promise<Syllabus[]>;
}

export async function fetchSyllabus(id: string) {
  const res = await fetch(`${base}/${id}`);
  if (!res.ok) throw new Error('Błąd pobierania sylabusa');
  return res.json() as Promise<Syllabus>;
}

export async function createSyllabus(payload: Partial<Syllabus>) {
  const res = await fetch(base, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Błąd tworzenia sylabusa');
  return res.json() as Promise<Syllabus>;
}

export async function addVersion(syllabusId: string, version: Partial<SyllabusVersion>) {
  const res = await fetch(`${base}/${syllabusId}/versions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(version),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || 'Błąd dodawania wersji');
  }
  return res.json() as Promise<SyllabusVersion>;
}