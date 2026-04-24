import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Subject } from '../types/types';
import { fetchSyllabus } from '../api/api';

export default function SyllabusDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [subject, setSubject] = React.useState<Subject | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    fetchSyllabus(id)
      .then(data => {
        setSubject(data);
        setLoading(false);
      })
      .catch(err => {
        setError(String(err));
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Ładowanie...</div>;
  if (error) return <div style={{ color: 'red' }}>Błąd: {error}</div>;
  if (!subject) return <div>Nie znaleziono przedmiotu</div>;

  const currentVersion = subject.versions && subject.versions.length > 0 ? subject.versions[0] : null;

  return (
    <div>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        ← Powrót
      </button>

      <h2>{subject.name}</h2>
      <p><strong>Kod:</strong> {subject.code}</p>
      <p><strong>Semestr:</strong> {subject.semester}</p>
      <p><strong>ECTS:</strong> {subject.ectsPoints}</p>
      <p><strong>Typ:</strong> {subject.subjectType || '-'}</p>
      {subject.description && <p><strong>Opis:</strong> {subject.description}</p>}

      <hr style={{ margin: '20px 0' }} />

      {currentVersion ? (
        <>
          <h3>Aktualna wersja sylabusa (v{currentVersion.versionNumber})</h3>
          
          {currentVersion.description && (
            <div style={{ marginBottom: 16 }}>
              <h4>Opis</h4>
              <p>{currentVersion.description}</p>
            </div>
          )}

          {currentVersion.learningOutcomes && (
            <div style={{ marginBottom: 16 }}>
              <h4>Efekty kształcenia</h4>
              <p>{currentVersion.learningOutcomes}</p>
            </div>
          )}

          {currentVersion.prerequisites && (
            <div style={{ marginBottom: 16 }}>
              <h4>Wymagania wstępne</h4>
              <p>{currentVersion.prerequisites}</p>
            </div>
          )}

          {currentVersion.literature && (
            <div style={{ marginBottom: 16 }}>
              <h4>Literatura</h4>
              <p>{currentVersion.literature}</p>
            </div>
          )}

          {currentVersion.assessmentMethods && (
            <div style={{ marginBottom: 16 }}>
              <h4>Metody oceniania</h4>
              <p>{currentVersion.assessmentMethods}</p>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <h4>Godziny</h4>
            <p>Całkowite: {currentVersion.totalHours}h</p>
            <p>Wykład: {currentVersion.theoryHours}h</p>
            <p>Laboratorium: {currentVersion.labHours}h</p>
            <p>Inne: {currentVersion.otherHours}h</p>
          </div>

          <div style={{ fontSize: '0.9em', color: '#666', marginTop: 20 }}>
            <p>
              Utworzono: {currentVersion.createdAt ? new Date(currentVersion.createdAt).toLocaleString('pl-PL') : '-'}
            </p>
            {currentVersion.createdBy && <p>Autor: {currentVersion.createdBy}</p>}
          </div>
        </>
      ) : (
        <p>Brak wersji sylabusa dla tego przedmiotu.</p>
      )}

      <hr style={{ margin: '20px 0' }} />

      {subject.versions && subject.versions.length > 1 && (
        <div>
          <h3>Historia wersji ({subject.versions.length})</h3>
          <ul>
            {subject.versions.map(v => (
              <li key={v.id}>
                Wersja {v.versionNumber} - {v.createdAt ? new Date(v.createdAt).toLocaleDateString('pl-PL') : '-'}
                {v.changeNote && ` - ${v.changeNote}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}