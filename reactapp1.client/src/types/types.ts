export interface Center {
  id: string;
  name: string;
  code: string;
}

export interface CurriculumGridEntry {
  id: string;
  syllabusId: string;
  semester: number;
  hours: number;
  year?: number | null;
}

export interface SyllabusVersion {
  id: string;
  syllabusId: string;
  versionNumber: number;
  title: string;
  description?: string | null;
  learningOutcomes?: string | null;
  prerequisites?: string | null;
  literature?: string | null;
  assessmentMethods?: string | null;
  totalHours: number;
  theoryHours: number;
  labHours: number;
  otherHours: number;
  changeNote?: string | null;
  createdAt: string;
  createdBy?: string | null;
}

export interface Syllabus {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  centerId?: string | null;
  center?: Center | null;
  yearIntroduced: number;
  versions?: SyllabusVersion[];
  curriculumEntries?: CurriculumGridEntry[];
}