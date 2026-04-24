import type { Subject, SubjectVersion, Curriculum } from '../types/types';

const subjectsBase = '/api/subjects';
const curriculumsBase = '/api/curriculums';

// Subjects API
export async function fetchSubjects(params?: { curriculumId?: string; semester?: number; search?: string }) {
  const query = new URLSearchParams();
  if (params?.curriculumId) query.set('curriculumId', params.curriculumId);
  if (params?.semester) query.set('semester', String(params.semester));
  if (params?.search) query.set('search', params.search);
  
  const url = query.toString() ? `${subjectsBase}?${query}` : subjectsBase;
  console.log('API: Wywołanie:', url);
  
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json() as Promise<Subject[]>;
}

export async function fetchSubject(id: string) {
  const res = await fetch(`${subjectsBase}/${id}`);
  if (!res.ok) throw new Error(`Błąd pobierania przedmiotu: ${res.status}`);
  return res.json() as Promise<Subject>;
}

export async function createSubject(payload: Partial<Subject>) {
  const res = await fetch(subjectsBase, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Błąd tworzenia przedmiotu: ${res.status}`);
  return res.json() as Promise<Subject>;
}

export async function addSubjectVersion(subjectId: string, version: Partial<SubjectVersion>) {
  const res = await fetch(`${subjectsBase}/${subjectId}/versions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(version),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `Błąd dodawania wersji: ${res.status}`);
  }
  return res.json() as Promise<SubjectVersion>;
}

// Curriculums API
export async function fetchCurriculums(params?: { year?: number; level?: string }) {
  const query = new URLSearchParams();
  if (params?.year) query.set('year', String(params.year));
  if (params?.level) query.set('level', params.level);
  
  const url = query.toString() ? `${curriculumsBase}?${query}` : curriculumsBase;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Błąd pobierania siatek: ${res.status}`);
  return res.json() as Promise<Curriculum[]>;
}

export async function fetchCurriculum(id: string) {
  const res = await fetch(`${curriculumsBase}/${id}`);
  if (!res.ok) throw new Error(`Błąd pobierania siatki: ${res.status}`);
  return res.json() as Promise<Curriculum>;
}

export async function createCurriculum(payload: Partial<Curriculum>) {
  const res = await fetch(curriculumsBase, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Błąd tworzenia siatki: ${res.status}`);
  return res.json() as Promise<Curriculum>;
}

// Aliasy dla kompatybilności wstecznej
export const fetchSyllabuses = fetchSubjects;
export const fetchSyllabus = fetchSubject;
export const createSyllabus = createSubject;
export const addVersion = addSubjectVersion;