import type { Subject, SubjectVersion, Curriculum, RegisterRequest, LoginRequest, LoginResponse, AuthUser } from '../types/types';

const subjectsBase = '/api/subjects';
const curriculumsBase = '/api/curriculums';
const authBase = '/api/auth';

// ========================================
// AUTENTYKACJA
// ========================================

/**
 * Rejestracja nowego użytkownika
 */
export async function register(data: RegisterRequest): Promise<LoginResponse> {
  const res = await fetch(`${authBase}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Błąd rejestracji');
  }
  
  return res.json();
}

/**
 * Logowanie użytkownika
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`${authBase}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Nieprawidłowy email lub hasło');
  }
  
  return res.json();
}

/**
 * Pobierz informacje o aktualnie zalogowanym użytkowniku (wymaga tokenu)
 */
export async function getCurrentUser(): Promise<AuthUser> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Brak tokenu - użytkownik niezalogowany');
  }

  const res = await fetch(`${authBase}/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,  // 🔑 Dołączamy token do zapytania
    },
  });
  
  if (!res.ok) {
    throw new Error('Błąd pobierania danych użytkownika');
  }
  
  return res.json();
}

// === POMOCNICZE FUNKCJE DO ZARZĄDZANIA TOKENEM ===

const AUTH_STORAGE_KEY = 'syllabus_auth';

/**
 * Zapisz dane użytkownika w localStorage (po zalogowaniu)
 */
export function saveAuthUser(data: LoginResponse) {
  const authUser: AuthUser = {
    email: data.email,
    fullName: data.fullName,
    roles: data.roles,
    token: data.token,
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
}

/**
 * Pobierz dane zalogowanego użytkownika z localStorage
 */
export function getAuthUser(): AuthUser | null {
  const data = localStorage.getItem(AUTH_STORAGE_KEY);
  return data ? JSON.parse(data) : null;
}

/**
 * Pobierz tylko token JWT
 */
export function getAuthToken(): string | null {
  const user = getAuthUser();
  return user?.token || null;
}

/**
 * Wyloguj użytkownika (usuń dane z localStorage)
 */
export function logout() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * Sprawdź czy użytkownik ma daną rolę
 */
export function hasRole(role: string): boolean {
  const user = getAuthUser();
  return user?.roles.includes(role) || false;
}

/**
 * Sprawdź czy użytkownik może edytować (ma rolę Editor lub Admin)
 */
export function canEdit(): boolean {
  return hasRole('Editor') || hasRole('Admin');
}

// ========================================
// ISTNIEJĄCE FUNKCJE (z aktualizacją do tokenów)
// ========================================

/**
 * Pomocnicza funkcja do dodawania tokenu JWT do nagłówków
 */
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Pomocnicza funkcja do obsługi błędów HTTP
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return response.json();
  }

  // Pobierz szczegółowy komunikat błędu z backendu
  let errorMessage = `HTTP ${response.status}`;
  try {
    const errorData = await response.json();
    console.error('🔴 Backend error details:', errorData); // 🔍 Log pełnego obiektu błędu
    
    // ASP.NET zwraca błędy walidacji w formacie { errors: { pole: ["błąd1", "błąd2"] } }
    if (errorData.errors) {
      const validationErrors = Object.entries(errorData.errors)
        .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
        .join('\n');
      errorMessage = `Błędy walidacji:\n${validationErrors}`;
    } else {
      errorMessage = errorData.message || errorData.title || JSON.stringify(errorData);
    }
  } catch {
    const text = await response.text();
    console.error('🔴 Backend error text:', text);
    errorMessage = text || `HTTP ${response.status}`;
  }

  // 401 Unauthorized
  if (response.status === 401) {
    console.warn('🔒 Sesja wygasła');
    logout();
    window.location.href = '/login';
    throw new Error('Sesja wygasła. Zaloguj się ponownie.');
  }

  // 403 Forbidden
  if (response.status === 403) {
    throw new Error('Brak uprawnień do wykonania tej operacji');
  }

  throw new Error(errorMessage);
}

// === SUBJECTS API ===
export async function fetchSubjects(params?: { 
  curriculumId?: string; 
  semester?: number; 
  search?: string;
  year?: string;      // 🆕
  level?: string;     // 🆕
  mode?: string;      // 🆕
}) {
  const query = new URLSearchParams();
  if (params?.curriculumId) query.set('curriculumId', params.curriculumId);
  if (params?.semester) query.set('semester', String(params.semester));
  if (params?.search) query.set('search', params.search);
  if (params?.year) query.set('year', params.year);           // 🆕
  if (params?.level) query.set('level', params.level);        // 🆕
  if (params?.mode) query.set('mode', params.mode);           // 🆕
  
  const url = query.toString() ? `${subjectsBase}?${query}` : subjectsBase;
  
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json() as Promise<Subject[]>;
}

export async function fetchSubject(id: string) {
  const res = await fetch(`${subjectsBase}/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<Subject>(res);
}

export async function createSubject(payload: Partial<Subject>) {
  const res = await fetch(subjectsBase, {
    method: 'POST',
    headers: getAuthHeaders(),  // 🔑 Token wymagany do tworzenia
    body: JSON.stringify(payload),
  });
  return handleResponse<Subject>(res);
}

export async function addSubjectVersion(subjectId: string, version: Partial<SubjectVersion>) {
  const res = await fetch(`${subjectsBase}/${subjectId}/versions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(version),
  });
  return handleResponse<SubjectVersion>(res);
}

// === CURRICULUMS API ===
export async function fetchCurriculums(params?: { year?: number; level?: string }) {
  const query = new URLSearchParams();
  if (params?.year) query.set('year', String(params.year));
  if (params?.level) query.set('level', params.level);
  
  const url = query.toString() ? `${curriculumsBase}?${query}` : curriculumsBase;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });
  return handleResponse<Curriculum[]>(res);
}

export async function fetchCurriculum(id: string) {
  const res = await fetch(`${curriculumsBase}/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<Curriculum>(res);
}

export async function createCurriculum(payload: Partial<Curriculum>) {
  const res = await fetch(curriculumsBase, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<Curriculum>(res);
}

// Aliasy
export const fetchSyllabuses = fetchSubjects;
export const fetchSyllabus = fetchSubject;
export const createSyllabus = createSubject;
export const addVersion = addSubjectVersion;