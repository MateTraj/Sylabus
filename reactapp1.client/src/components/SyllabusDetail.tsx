import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Subject, SubjectVersion } from '../types/types';
import { fetchSyllabus, canEdit } from '../api/api';
import VersionHistory from './VersionHistory';
import AddVersionForm from './AddVersionForm';

export default function SyllabusDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [subject, setSubject] = React.useState<Subject | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  
  // Stan dla wersjonowania
  const [selectedVersion, setSelectedVersion] = React.useState<SubjectVersion | null>(null);
  const [showAddVersionForm, setShowAddVersionForm] = React.useState(false);
  
  const isEditor = canEdit();

  /**
   * Załaduj dane przedmiotu
   */
  async function loadSubject() {
    if (!id) return;
    
    setLoading(true);
    setError('');
    
    try {
      const data = await fetchSyllabus(id);
      setSubject(data);
      
      // Ustaw najnowszą wersję jako domyślną
      if (data.versions && data.versions.length > 0) {
        const latest = [...data.versions].sort((a, b) => b.versionNumber - a.versionNumber)[0];
        setSelectedVersion(latest);
      }
      
      setLoading(false);
    } catch (err) {
      setError(String(err));
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadSubject();
  }, [id]);

  /**
   * Obsługa dodania nowej wersji
   */
  function handleVersionAdded(newVersion: SubjectVersion) {
    // Odśwież dane (przeładuj przedmiot)
    loadSubject();
    setShowAddVersionForm(false);
    
    // Pokaż komunikat sukcesu
    alert(`✅ Utworzono wersję ${newVersion.versionNumber}!`);
  }

  if (loading) return <div>Ładowanie...</div>;
  if (error) return <div style={{ color: 'red' }}>Błąd: {error}</div>;
  if (!subject) return <div>Nie znaleziono przedmiotu</div>;

  const displayedVersion = selectedVersion || (subject.versions && subject.versions.length > 0 ? subject.versions[0] : null);
  const latestVersion = subject.versions && subject.versions.length > 0 
    ? [...subject.versions].sort((a, b) => b.versionNumber - a.versionNumber)[0]
    : null;

  return (
      <div className="tekst">
      {/* Nagłówek z nawigacją */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 20 
      }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            padding: '8px 16px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          ← Powrót
        </button>

        {/* Przycisk dodawania nowej wersji - tylko dla Editorów */}
        {isEditor && !showAddVersionForm && (
          <button
            onClick={() => setShowAddVersionForm(true)}
            style={{
              padding: '10px 20px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ➕ Nowa wersja sylabusa
          </button>
        )}
      </div>

      {/* === PODSTAWOWE INFORMACJE O PRZEDMIOCIE === */}
      <div style={{ 
        padding: 20,
        background: '#f8f9fa',
        borderRadius: 8,
        marginBottom: 20
      }}>
        <h2 style={{ marginTop: 0 }}>{subject.name}</h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
          fontSize: '0.95em'
        }}>
          <div><strong>Kod:</strong> {subject.code}</div>
          <div><strong>Semestr:</strong> {subject.semester}</div>
          <div><strong>ECTS:</strong> {subject.ectsPoints}</div>
          <div><strong>Typ:</strong> {subject.subjectType || '-'}</div>
          {subject.curriculum && (
            <>
              <div style={{ gridColumn: '1 / -1' }}>
                <strong>Siatka:</strong> {subject.curriculum.name}
              </div>
              <div><strong>Rok akademicki:</strong> {subject.curriculum.academicYear}/{subject.curriculum.academicYear + 1}</div>
              <div><strong>Poziom:</strong> {subject.curriculum.level || '-'}</div>
              <div><strong>Tryb:</strong> {subject.curriculum.studyMode || '-'}</div>
            </>
          )}
        </div>
        
        {subject.description && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #ddd' }}>
            <strong>Opis ogólny:</strong>
            <p style={{ marginTop: 8 }}>{subject.description}</p>
          </div>
        )}
      </div>

      {/* === FORMULARZ DODAWANIA NOWEJ WERSJI === */}
      {showAddVersionForm && isEditor && (
        <AddVersionForm
          subjectId={subject.id}
          subjectName={subject.name}
          latestVersion={latestVersion || undefined}
          onSuccess={handleVersionAdded}
          onCancel={() => setShowAddVersionForm(false)}
        />
      )}

      {/* === HISTORIA WERSJI === */}
      {subject.versions && subject.versions.length > 0 && (
        <VersionHistory
          versions={subject.versions}
          currentVersionId={displayedVersion?.id}
          onSelectVersion={setSelectedVersion}
        />
      )}

      {/* === SZCZEGÓŁY WYBRANEJ WERSJI === */}
      {displayedVersion ? (
        <div style={{ 
          marginTop: 30,
          padding: 20,
          border: '2px solid #0066cc',
          borderRadius: 8,
          background: '#fff'
        }}>
          <h3 style={{ 
            marginTop: 0,
            color: '#0066cc',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            📖 Szczegóły wersji {displayedVersion.versionNumber}
            {displayedVersion.versionNumber === latestVersion?.versionNumber && (
              <span style={{
                padding: '4px 8px',
                background: '#28a745',
                color: 'white',
                fontSize: '0.7em',
                fontWeight: 'bold',
                borderRadius: 4
              }}>
                AKTUALNA
              </span>
            )}
          </h3>

          {displayedVersion.description && (
            <div style={{ marginBottom: 20 }}>
              <h4>Opis</h4>
              <p style={{ lineHeight: 1.6 }}>{displayedVersion.description}</p>
            </div>
          )}

          {displayedVersion.learningOutcomes && (
            <div style={{ marginBottom: 20 }}>
              <h4>🎯 Efekty kształcenia</h4>
              <p style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {displayedVersion.learningOutcomes}
              </p>
            </div>
          )}

          {displayedVersion.prerequisites && (
            <div style={{ marginBottom: 20 }}>
              <h4>📋 Wymagania wstępne</h4>
              <p style={{ lineHeight: 1.6 }}>{displayedVersion.prerequisites}</p>
            </div>
          )}

          {displayedVersion.literature && (
            <div style={{ marginBottom: 20 }}>
              <h4>📚 Literatura</h4>
              <p style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {displayedVersion.literature}
              </p>
            </div>
          )}

          {displayedVersion.assessmentMethods && (
            <div style={{ marginBottom: 20 }}>
              <h4>✍️ Metody oceniania</h4>
              <p style={{ lineHeight: 1.6 }}>{displayedVersion.assessmentMethods}</p>
            </div>
          )}

          {/* Godziny */}
          <div style={{ marginBottom: 20 }}>
            <h4>⏰ Godziny zajęć</h4>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 12,
              padding: 16,
              background: '#f8f9fa',
              borderRadius: 6
            }}>
              <div>
                <strong>Całkowite:</strong><br />
                <span style={{ fontSize: '1.5em', color: '#0066cc' }}>
                  {displayedVersion.totalHours}h
                </span>
              </div>
              <div>
                <strong>Wykład:</strong><br />
                <span style={{ fontSize: '1.3em' }}>{displayedVersion.theoryHours}h</span>
              </div>
              <div>
                <strong>Laboratorium:</strong><br />
                <span style={{ fontSize: '1.3em' }}>{displayedVersion.labHours}h</span>
              </div>
              <div>
                <strong>Inne:</strong><br />
                <span style={{ fontSize: '1.3em' }}>{displayedVersion.otherHours}h</span>
              </div>
            </div>
          </div>

          {/* Metadane */}
          <div style={{ 
            fontSize: '0.9em', 
            color: '#666',
            paddingTop: 20,
            borderTop: '1px solid #ddd'
          }}>
            <div style={{ marginBottom: 8 }}>
              <strong>Utworzono:</strong>{' '}
              {displayedVersion.createdAt 
                ? new Date(displayedVersion.createdAt).toLocaleString('pl-PL')
                : '-'}
            </div>
            {displayedVersion.createdBy && (
              <div style={{ marginBottom: 8 }}>
                <strong>Autor:</strong> {displayedVersion.createdBy}
              </div>
            )}
            {displayedVersion.changeNote && (
              <div style={{ 
                marginTop: 12,
                padding: 12,
                background: '#fffbf0',
                borderRadius: 6,
                fontStyle: 'italic'
              }}>
                <strong>💬 Notatka o zmianach:</strong><br />
                {displayedVersion.changeNote}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ 
          padding: 20,
          textAlign: 'center',
          background: '#f8f9fa',
          borderRadius: 8,
          marginTop: 30
        }}>
          <p>Brak wersji sylabusa dla tego przedmiotu.</p>
          {isEditor && (
            <button
              onClick={() => setShowAddVersionForm(true)}
              style={{
                marginTop: 10,
                padding: '10px 20px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              ➕ Dodaj pierwszą wersję
            </button>
          )}
        </div>
      )}
    </div>
  );
}