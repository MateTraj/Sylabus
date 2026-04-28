import React from 'react';
import { addSubjectVersion } from '../api/api';
import type { SubjectVersion } from '../types/types';

interface AddVersionFormProps {
  subjectId: string;
  subjectName: string;
  latestVersion?: SubjectVersion;
  onSuccess: (newVersion: SubjectVersion) => void;
  onCancel: () => void;
}

export default function AddVersionForm({ 
  subjectId, 
  subjectName,
  latestVersion,
  onSuccess, 
  onCancel 
}: AddVersionFormProps) {
  
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  
  const [form, setForm] = React.useState<Partial<SubjectVersion>>({
    title: latestVersion?.title || subjectName,
    description: latestVersion?.description || '',
    learningOutcomes: latestVersion?.learningOutcomes || '',
    prerequisites: latestVersion?.prerequisites || '',
    literature: latestVersion?.literature || '',
    assessmentMethods: latestVersion?.assessmentMethods || '',
    totalHours: latestVersion?.totalHours || 30,
    theoryHours: latestVersion?.theoryHours || 15,
    labHours: latestVersion?.labHours || 15,
    otherHours: latestVersion?.otherHours || 0,
    changeNote: '',
  });

  function updateField(field: keyof SubjectVersion, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function validateHours(): string | null {
    const total = form.totalHours || 0;
    const theory = form.theoryHours || 0;
    const lab = form.labHours || 0;
    const other = form.otherHours || 0;

    if (total !== theory + lab + other) {
      return `Suma godzin musi się zgadzać: ${theory} + ${lab} + ${other} = ${theory + lab + other} ≠ ${total}`;
    }

    if (total <= 0) {
      return 'Całkowita liczba godzin musi być większa niż 0';
    }

    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Walidacja
    if (!form.title) {
      setError('Tytuł jest wymagany');
      return;
    }

    const hoursError = validateHours();
    if (hoursError) {
      setError(hoursError);
      return;
    }

    if (!form.changeNote) {
      setError('Notatka o zmianach jest wymagana');
      return;
    }

    setLoading(true);

    try {
      // 🔍 Dokładne logowanie
      console.log('📤 Wysyłanie wersji:', JSON.stringify(form, null, 2));
      console.log('📤 SubjectId:', subjectId);
      
      const newVersion = await addSubjectVersion(subjectId, form);
      console.log('✅ Utworzono wersję:', newVersion);
      onSuccess(newVersion);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Błąd tworzenia wersji';
      setError(errorMsg);
      console.error('❌ Błąd tworzenia wersji:', err);
    } finally {
      setLoading(false);
    }
  }

  const sumHours = (form.theoryHours || 0) + (form.labHours || 0) + (form.otherHours || 0);
  const hoursValid = sumHours === (form.totalHours || 0);

  return (
    <div style={{ 
      padding: 20, 
      border: '2px solid #0066cc', 
      borderRadius: 8,
      background: '#f0f8ff',
      marginTop: 20
    }}>
      <h3 style={{ marginTop: 0 }}>➕ Nowa wersja sylabusa</h3>

      {error && (
        <div style={{ background: '#fee', color: '#c00', padding: 12, borderRadius: 6, marginBottom: 16 }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Tytuł */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Tytuł wersji: <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            value={form.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            required
            style={{ width: '100%', padding: 8, fontSize: '1em', border: '1px solid #ccc', borderRadius: 4 }}
          />
        </div>

        {/* Opis */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Opis:
          </label>
          <textarea
            value={form.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            rows={3}
            style={{ width: '100%', padding: 8, fontSize: '1em', border: '1px solid #ccc', borderRadius: 4, fontFamily: 'inherit' }}
          />
        </div>

        {/* Efekty kształcenia */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Efekty kształcenia:
          </label>
          <textarea
            value={form.learningOutcomes || ''}
            onChange={(e) => updateField('learningOutcomes', e.target.value)}
            rows={4}
            style={{ width: '100%', padding: 8, fontSize: '1em', border: '1px solid #ccc', borderRadius: 4, fontFamily: 'inherit' }}
          />
        </div>

        {/* Wymagania wstępne */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Wymagania wstępne:
          </label>
          <textarea
            value={form.prerequisites || ''}
            onChange={(e) => updateField('prerequisites', e.target.value)}
            rows={2}
            style={{ width: '100%', padding: 8, fontSize: '1em', border: '1px solid #ccc', borderRadius: 4, fontFamily: 'inherit' }}
          />
        </div>

        {/* Literatura */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Literatura:
          </label>
          <textarea
            value={form.literature || ''}
            onChange={(e) => updateField('literature', e.target.value)}
            rows={3}
            style={{ width: '100%', padding: 8, fontSize: '1em', border: '1px solid #ccc', borderRadius: 4, fontFamily: 'inherit' }}
          />
        </div>

        {/* Metody oceniania */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Metody oceniania:
          </label>
          <textarea
            value={form.assessmentMethods || ''}
            onChange={(e) => updateField('assessmentMethods', e.target.value)}
            rows={2}
            style={{ width: '100%', padding: 8, fontSize: '1em', border: '1px solid #ccc', borderRadius: 4, fontFamily: 'inherit' }}
          />
        </div>

        {/* GODZINY */}
        <div style={{ 
          marginBottom: 16,
          padding: 16,
          background: hoursValid ? '#d4edda' : '#fff3cd',
          border: `1px solid ${hoursValid ? '#c3e6cb' : '#ffeeba'}`,
          borderRadius: 6
        }}>
          <h4 style={{ marginTop: 0 }}>⏰ Godziny zajęć</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {/* Całkowite godziny */}
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                Całkowite godziny: <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="number"
                value={form.totalHours || 0}
                onChange={(e) => updateField('totalHours', parseInt(e.target.value) || 0)}
                min={0}
                required
                style={{ width: '100%', padding: 8, fontSize: '1em', border: '1px solid #ccc', borderRadius: 4 }}
              />
            </div>

            {/* Wykład */}
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                Wykład:
              </label>
              <input
                type="number"
                value={form.theoryHours || 0}
                onChange={(e) => updateField('theoryHours', parseInt(e.target.value) || 0)}
                min={0}
                style={{ width: '100%', padding: 8, fontSize: '1em', border: '1px solid #ccc', borderRadius: 4 }}
              />
            </div>

            {/* Laboratorium */}
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                Laboratorium:
              </label>
              <input
                type="number"
                value={form.labHours || 0}
                onChange={(e) => updateField('labHours', parseInt(e.target.value) || 0)}
                min={0}
                style={{
                  width: '100%',
                  padding: 8,
                  fontSize: '1em',
                  border: '1px solid #ccc',
                  borderRadius: 4
                }}
              />
            </div>

            {/* Inne */}
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                Inne:
              </label>
              <input
                type="number"
                value={form.otherHours || 0}
                onChange={(e) => updateField('otherHours', parseInt(e.target.value) || 0)}
                min={0}
                style={{
                  width: '100%',
                  padding: 8,
                  fontSize: '1em',
                  border: '1px solid #ccc',
                  borderRadius: 4
                }}
              />
            </div>
          </div>

          {/* Walidacja godzin */}
          <div style={{ 
            marginTop: 12,
            padding: 10,
            background: '#fff',
            borderRadius: 4,
            fontSize: '0.9em'
          }}>
            {hoursValid ? (
              <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                ✓ Suma godzin się zgadza: {sumHours}h
              </span>
            ) : (
              <span style={{ color: '#856404', fontWeight: 'bold' }}>
                ⚠️ Suma: {sumHours}h, Oczekiwane: {form.totalHours || 0}h
              </span>
            )}
          </div>
        </div>

        {/* Notatka o zmianach */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Notatka o zmianach: <span style={{ color: 'red' }}>*</span>
          </label>
          <textarea
            value={form.changeNote || ''}
            onChange={(e) => updateField('changeNote', e.target.value)}
            rows={2}
            required
            placeholder="Co zostało zmienione? (np. 'Dodano nową literaturę')"
            style={{
              width: '100%',
              padding: 8,
              fontSize: '1em',
              border: '1px solid #ccc',
              borderRadius: 4,
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Przyciski akcji */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="submit"
            disabled={loading || !hoursValid}
            style={{
              flex: 1,
              padding: '12px 16px',
              fontSize: '1em',
              fontWeight: 'bold',
              background: loading || !hoursValid ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: loading || !hoursValid ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Zapisywanie...' : '✓ Utwórz nową wersję'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '12px 16px',
              fontSize: '1em',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Anuluj
          </button>
        </div>
      </form>
    </div>
  );
}