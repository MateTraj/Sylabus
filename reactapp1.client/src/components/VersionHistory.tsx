import React from 'react';
import type { SubjectVersion } from '../types/types';
import VersionComparison from './VersionComparison';

// Dodaj props
interface VersionHistoryProps {
  versions: SubjectVersion[];
  currentVersionId?: string;
  onSelectVersion: (version: SubjectVersion) => void;
  subjectId: string;
  subjectName?: string;
}

/**
 * Komponent wyświetlający historię wersji sylabusa.
 */
export default function VersionHistory({ 
  versions, 
  currentVersionId, 
  onSelectVersion,
  subjectId,
  // subjectName nie używamy, więc nie przypisujemy
}: VersionHistoryProps) {
  
  const [expanded, setExpanded] = React.useState(false);
  
  // Stan dla porównywania wersji
  const [selectedForCompare, setSelectedForCompare] = React.useState<number[]>([]);
  const [showComparison, setShowComparison] = React.useState(false);

  if (!versions || versions.length === 0) {
    return (
      <div style={{ 
        padding: 16, 
        background: '#f8f9fa', 
        borderRadius: 8,
        textAlign: 'center' 
      }}>
        <p>Brak wersji sylabusa</p>
      </div>
    );
  }

  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);
  const latestVersion = sortedVersions[0];
  const displayedVersions = expanded ? sortedVersions : sortedVersions.slice(0, 3);

  // Obsługa zaznaczania wersji
  function toggleVersionSelection(versionNumber: number) {
    setSelectedForCompare(prev => {
      if (prev.includes(versionNumber)) {
        return prev.filter(v => v !== versionNumber);
      } else {
        // Maksymalnie 2 wersje do porównania
        return [...prev, versionNumber].slice(-2);
      }
    });
  }

  // Otwórz okno porównania
  function handleCompare() {
    if (selectedForCompare.length === 2) {
      console.log('🔄 Porównywanie wersji:', selectedForCompare);
      setShowComparison(true);
    }
  }

  return (
    <>
      <div style={{ 
        marginTop: 30,
        padding: 20,
        border: '1px solid #ddd',
        borderRadius: 8,
        background: '#fff'
      }}>
        <h3 style={{ 
          marginTop: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          📜 Historia wersji ({versions.length})
          <span style={{ fontSize: '0.75em', fontWeight: 'normal', color: '#666' }}>
            Wersja aktualna: {latestVersion.versionNumber}
          </span>
        </h3>

        {/* Panel porównywania */}
        {selectedForCompare.length > 0 && (
          <div style={{
            marginBottom: 16,
            padding: 12,
            background: '#e3f2fd',
            borderRadius: 6,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <strong>Zaznaczone do porównania:</strong>{' '}
              {selectedForCompare.length === 1 && `wersja ${selectedForCompare[0]} (zaznacz jeszcze jedną)`}
              {selectedForCompare.length === 2 && `wersje ${selectedForCompare[0]} i ${selectedForCompare[1]}`}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {selectedForCompare.length === 2 && (
                <button
                  onClick={handleCompare}
                  style={{
                    padding: '8px 16px',
                    background: '#0066cc',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  🔄 Porównaj wersje
                </button>
              )}
              <button
                onClick={() => setSelectedForCompare([])}
                style={{
                  padding: '8px 16px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                Anuluj
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {displayedVersions.map((version) => {
            const isLatest = version.versionNumber === latestVersion.versionNumber;
            const isCurrent = version.id === currentVersionId;
            const isSelected = selectedForCompare.includes(version.versionNumber);

            return (
              <div
                key={version.id}
                onClick={() => onSelectVersion(version)}
                style={{
                  padding: 16,
                  border: isCurrent ? '2px solid #0066cc' : isSelected ? '2px solid #28a745' : '1px solid #ddd',
                  borderRadius: 8,
                  background: isCurrent ? '#e3f2fd' : isSelected ? '#d4edda' : '#f8f9fa',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                {/* Badge */}
                {isLatest && (
                  <span style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    padding: '4px 8px',
                    background: '#28a745',
                    color: 'white',
                    fontSize: '0.75em',
                    fontWeight: 'bold',
                    borderRadius: 4
                  }}>
                    AKTUALNA
                  </span>
                )}

                {/* Nagłówek wersji */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  {/* Checkbox do porównywania */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleVersionSelection(version.versionNumber);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  
                  <span style={{ fontSize: '1.2em', fontWeight: 'bold', color: isCurrent ? '#0066cc' : '#333' }}>
                    v{version.versionNumber}
                  </span>
                  <span style={{ fontSize: '0.9em', color: '#666' }}>
                    {version.title || 'Bez tytułu'}
                  </span>
                </div>

                {/* Metadane */}
                <div style={{ fontSize: '0.85em', color: '#666', marginLeft: 30 }}>
                  <div>
                    📅 {version.createdAt 
                      ? new Date(version.createdAt).toLocaleString('pl-PL')
                      : 'Brak daty'}
                  </div>
                  {version.createdBy && (
                    <div style={{ marginTop: 4 }}>👤 {version.createdBy}</div>
                  )}
                  {version.changeNote && (
                    <div style={{ marginTop: 8, padding: 8, background: '#fff', borderRadius: 4, fontStyle: 'italic' }}>
                      💬 {version.changeNote}
                    </div>
                  )}
                </div>

                {/* Podsumowanie godzin */}
                <div style={{ 
                  marginTop: 12,
                  marginLeft: 30,
                  padding: 8,
                  background: isCurrent ? '#fff' : '#e9ecef',
                  borderRadius: 4,
                  fontSize: '0.85em',
                  display: 'flex',
                  gap: 16,
                  flexWrap: 'wrap'
                }}>
                  <span>🕐 Razem: <strong>{version.totalHours}h</strong></span>
                  <span>📖 Wykład: {version.theoryHours}h</span>
                  <span>💻 Lab: {version.labHours}h</span>
                  <span>📝 Inne: {version.otherHours}h</span>
                </div>

                {/* Wskaźnik */}
                {isCurrent && (
                  <div style={{ marginTop: 12, marginLeft: 30, fontSize: '0.85em', color: '#0066cc', fontWeight: 'bold' }}>
                    ▶ Wyświetlana poniżej
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Przycisk rozwiń/zwiń */}
        {versions.length > 3 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            style={{
              marginTop: 12,
              padding: '8px 16px',
              width: '100%',
              background: '#f8f9fa',
              border: '1px solid #ddd',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: '0.9em',
              color: '#0066cc'
            }}
          >
            {expanded ? '▲ Pokaż mniej' : `▼ Pokaż wszystkie wersje (${versions.length - 3} więcej)`}
          </button>
        )}

        {/* Legenda */}
        <div style={{ marginTop: 16, padding: 12, background: '#fffbf0', borderRadius: 4, fontSize: '0.8em', color: '#666' }}>
          💡 <strong>Wskazówka:</strong> Kliknij na wersję aby zobaczyć szczegóły. 
          Zaznacz dwie wersje aby je porównać.
        </div>
      </div>

      {/* Modal z porównaniem */}
      {showComparison && selectedForCompare.length === 2 && (
        <VersionComparison
          subjectId={subjectId}
          version1={Math.min(...selectedForCompare)}
          version2={Math.max(...selectedForCompare)}
          onClose={() => {
            setShowComparison(false);
            setSelectedForCompare([]);
          }}
        />
      )}
    </>
  );
}