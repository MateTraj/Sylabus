import React from 'react';
import type { SubjectVersion } from '../types/types';

interface VersionHistoryProps {
  versions: SubjectVersion[];
  currentVersionId?: string;
  onSelectVersion: (version: SubjectVersion) => void;
}

/**
 * Komponent wyświetlający historię wersji sylabusa.
 */
export default function VersionHistory({ 
  versions, 
  currentVersionId, 
  onSelectVersion 
}: VersionHistoryProps) {
  
  const [expanded, setExpanded] = React.useState(false);

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

  return (
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {displayedVersions.map((version) => {
          const isLatest = version.versionNumber === latestVersion.versionNumber;
          const isCurrent = version.id === currentVersionId;

          return (
            <div
              key={version.id}
              onClick={() => onSelectVersion(version)}
              style={{
                padding: 16,
                border: isCurrent ? '2px solid #0066cc' : '1px solid #ddd',
                borderRadius: 8,
                background: isCurrent ? '#e3f2fd' : '#f8f9fa',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
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

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: '1.2em', fontWeight: 'bold', color: isCurrent ? '#0066cc' : '#333' }}>
                  v{version.versionNumber}
                </span>
                <span style={{ fontSize: '0.9em', color: '#666' }}>
                  {version.title || 'Bez tytułu'}
                </span>
              </div>

              <div style={{ fontSize: '0.85em', color: '#666' }}>
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

              <div style={{ 
                marginTop: 12,
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

              {isCurrent && (
                <div style={{ marginTop: 12, fontSize: '0.85em', color: '#0066cc', fontWeight: 'bold' }}>
                  ▶ Wyświetlana poniżej
                </div>
              )}
            </div>
          );
        })}
      </div>

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

      <div style={{ marginTop: 16, padding: 12, background: '#fffbf0', borderRadius: 4, fontSize: '0.8em', color: '#666' }}>
        💡 <strong>Wskazówka:</strong> Kliknij na wersję aby zobaczyć jej szczegóły poniżej.
      </div>
    </div>
  );
}