export interface Center {
  id?: string;
  name?: string;
  code?: string;
}

export interface Curriculum {
  id: string;
  name: string;
  code: string;
  description?: string;
  centerId?: string;
  center?: Center;
  academicYear: number;
  level?: string;
  studyMode?: string;
  subjects?: Subject[];
  createdAt?: string;
  createdBy?: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  description?: string;
  curriculumId: string;
  curriculum?: Curriculum;
  semester: number;
  subjectType?: string;
  ectsPoints: number;
  versions?: SubjectVersion[];
  createdAt?: string;
  createdBy?: string;
}

export interface SubjectVersion {
  id?: string;
  subjectId?: string;
  versionNumber: number;
  title: string;
  description?: string;
  learningOutcomes?: string;
  prerequisites?: string;
  literature?: string;
  assessmentMethods?: string;
  totalHours: number;
  theoryHours: number;
  labHours: number;
  otherHours: number;
  changeNote?: string;
  createdAt?: string;
  createdBy?: string;
}

// Stary alias dla kompatybilności
export type Syllabus = Subject;
export type SyllabusVersion = SubjectVersion;

/**
 * Dane do rejestracji nowego użytkownika
 */
export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
}

/**
 * Dane do logowania
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Odpowiedź z serwera po zalogowaniu/rejestracji
 */
export interface LoginResponse {
  token: string;      // Token JWT
  email: string;      // Email użytkownika
  fullName: string;   // Pełne imię
  roles: string[];    // Role użytkownika ["Reader"] lub ["Editor"]
}

/**
 * Informacje o zalogowanym użytkowniku (przechowujemy w localStorage)
 */
export interface AuthUser {
  email: string;
  fullName: string;
  roles: string[];
  token: string;
}