import React from 'react';
import { compareVersions, DiffComparison } from '../api/api';

interface VersionComparisonProps {
  subjectId: string;
  version1: number;
  version2: number;
  onClose: () => void;
}

export default function VersionComparison({ 
  subjectId, 
  version1, 
  version2, 
  onClose 
}: VersionComparisonProps) {
  const [diff, setDiff] = React.useState<DiffComparison | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setLoading(true);
    compareVersions(subjectId, version1, version2)
      .then(data => {
        setDiff(data);
        setLoading(false);
      })
      .catch(err => {
        setError(String(err));
        setLoading(false);
      });
  }, [subjectId, version1, version2]);

  if (loading) return <div>Porównywanie wersji...</div>;
  if (error) return <div style={{ color: 'red' }}>Błąd: {error}</div>;
  if (!diff) return null;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'major': return '#dc3545';
      case 'minor': return '#ffc107';
      case 'cosmetic': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'major': return 'Istotna';
      case 'minor': return 'Średnia';
      case 'cosmetic': return 'Kosmetyczna';
      default: return '';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20
    }}>
      <div style={{
        background: 'white',
        borderRadius: 8,
        maxWidth: 900,
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        padding: 30
      }}>
        {/* Nagłówek */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>
            🔄 Porównanie wersji {version1} ↔️ {version2}
          </h2>
          <button onClick={onClose} style={{
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            padding: '8px 16px',
            cursor: 'pointer'
          }}>
            ✕ Zamknij
          </button>
        </div>

        {/* Podobieństwo */}
        <div style={{
          padding: 16,
          background: diff.comparison.similarity > 80 ? '#d4edda' : '#fff3cd',
          borderRadius: 6,
          marginBottom: 20
        }}>
          <div style={{ fontSize: '1.1em', fontWeight: 'bold' }}>
            Podobieństwo: {diff.comparison.similarity}%
          </div>
          <div style={{ fontSize: '0.9em', color: '#666', marginTop: 4 }}>
            {diff.summary.totalChanges} zmian | 
            {diff.summary.majorChanges > 0 && ` ${diff.summary.majorChanges} istotnych |`}
            {diff.summary.hasSignificantChanges ? ' Wymagana weryfikacja' : ' Zmiany małe'}
          </div>
        </div>

        {/* Zmiany */}
        {diff.details.changed.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3>📝 Zmienione pola ({diff.details.changed.length})</h3>
            {diff.details.changed.map((change, idx) => (
              <div key={idx} style={{
                marginBottom: 12,
                padding: 12,
                border: '1px solid #ddd',
                borderRadius: 6,
                background: '#f8f9fa'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <strong>{change.label}</strong>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: '0.8em',
                    background: getCategoryColor(change.category),
                    color: 'white'
                  }}>
                    {getCategoryLabel(change.category)}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: '0.8em', color: '#666', marginBottom: 4 }}>Wersja {version1}:</div>
                    <div style={{ padding: 8, background: '#fff', borderRadius: 4, border: '1px solid #fcc' }}>
                      {String(change.oldValue || '-')}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8em', color: '#666', marginBottom: 4 }}>Wersja {version2}:</div>
                    <div style={{ padding: 8, background: '#fff', borderRadius: 4, border: '1px solid #cfc' }}>
                      {String(change.newValue || '-')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dodane */}
        {diff.details.added.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3>➕ Dodane pola ({diff.details.added.length})</h3>
            {diff.details.added.map((item, idx) => (
              <div key={idx} style={{
                padding: 12,
                background: '#d4edda',
                borderRadius: 6,
                marginBottom: 8
              }}>
                <strong>{item.label}:</strong> {String(item.value)}
              </div>
            ))}
          </div>
        )}

        {/* Usunięte */}
        {diff.details.removed.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3>➖ Usunięte pola ({diff.details.removed.length})</h3>
            {diff.details.removed.map((item, idx) => (
              <div key={idx} style={{
                padding: 12,
                background: '#f8d7da',
                borderRadius: 6,
                marginBottom: 8
              }}>
                <strong>{item.label}:</strong> {String(item.value)}
              </div>
            ))}
          </div>
        )}

        {diff.summary.totalChanges === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
            ✓ Wersje są identyczne
          </div>
        )}
      </div>
    </div>
  );
}