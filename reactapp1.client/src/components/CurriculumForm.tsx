import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createCurriculum, updateCurriculum, fetchCurriculum } from '../api/api';
import type { Curriculum } from '../types/types';

/**
 * Formularz tworzenia/edycji sylabusa
 */
export default function CurriculumForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Pobierz id z URL
  const isEditMode = !!id; // Tryb edycji jeśli id istnieje
  
  const [loading, setLoading] = React.useState(false);
  const [loadingData, setLoadingData] = React.useState(isEditMode);
  const [error, setError] = React.useState('');
  
  const [form, setForm] = React.useState({
    name: '',
    code: '',
    description: '',
    academicYear: new Date().getFullYear(),
    level: 'I stopień',
    studyMode: 'Stacjonarne',
    centerId: ''
  });

  // Załaduj dane sylabusa w trybie edycji
  React.useEffect(() => {
    if (!isEditMode || !id) return;

    setLoadingData(true);
    fetchCurriculum(id)
      .then(data => {
        setForm({
          name: data.name,
          code: data.code,
          description: data.description || '',
          academicYear: data.academicYear,
          level: data.level || 'I stopień',
          studyMode: data.studyMode || 'Stacjonarne',
          centerId: data.centerId || ''
        });
        setLoadingData(false);
      })
      .catch(err => {
        setError(`Błąd ładowania danych: ${err}`);
        setLoadingData(false);
      });
  }, [id, isEditMode]);

  /**
   * Aktualizuj pole formularza
   */
  function updateField(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  /**
   * Walidacja przed wysłaniem
   */
  function validateForm(): string | null {
    if (!form.name.trim()) {
      return 'Nazwa sylabusa jest wymagana';
    }

    if (!form.code.trim()) {
      return 'Kod sylabusa jest wymagany';
    }

    if (form.academicYear < 2000 || form.academicYear > 2100) {
      return 'Nieprawidłowy rok akademicki';
    }

    return null;
  }

  /**
   * Obsługa zapisu
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const payload: Partial<Curriculum> = {
        name: form.name.trim(),
        code: form.code.trim(),
        description: form.description.trim() || undefined,
        academicYear: form.academicYear,
        level: form.level,
        studyMode: form.studyMode,
      };

      if (isEditMode && id) {
        // Edycja istniejącego sylabusa
        console.log('📝 Aktualizacja sylabusa:', payload);
        const updated = await updateCurriculum(id, payload);
        console.log('✅ Zaktualizowano sylabus:', updated);
        navigate(`/curriculum/${id}`);
      } else {
        // Tworzenie nowego
        console.log('📤 Tworzenie sylabusa:', payload);
        const created = await createCurriculum(payload);
        console.log('✅ Utworzono sylabus:', created);
        navigate(`/curriculum/${created.id}`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Błąd zapisu sylabusa';
      setError(errorMsg);
      console.error('❌ Błąd zapisu sylabusa:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p>Ładowanie danych sylabusa...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Nagłówek */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 30 
      }}>
        <h2 style={{ margin: 0 }}>
          {isEditMode ? '✏️ Edycja sylabusa' : '➕ Nowy sylabus kierunku studiów'}
        </h2>
        <button 
          onClick={() => navigate(isEditMode ? `/curriculum/${id}` : '/')} 
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

      {/* Komunikat błędu */}
      {error && (
        <div style={{ 
          background: '#fee', 
          color: '#c00', 
          padding: 16, 
          borderRadius: 6, 
          marginBottom: 20,
          border: '1px solid #fcc'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Informacja */}
      {!isEditMode && (
        <div style={{ 
          marginBottom: 30,
          padding: 16,
          background: '#e3f2fd',
          borderRadius: 6,
          fontSize: '0.9em'
        }}>
          💡 <strong>Wskazówka:</strong> Po utworzeniu sylabusa będziesz mógł dodać do niego przedmioty.
        </div>
      )}

      {/* Formularz */}
      <form onSubmit={handleSubmit}>
        <div style={{ 
          padding: 24,
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: 8
        }}>
          {/* Nazwa */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', fontSize: '0.95em' }}>
              Nazwa sylabusa: <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
              placeholder="np. Informatyka I stopień 2025/2026"
              style={{
                width: '100%',
                padding: 12,
                fontSize: '1em',
                border: '1px solid #ccc',
                borderRadius: 4,
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Kod */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', fontSize: '0.95em' }}>
              Kod sylabusa: <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => updateField('code', e.target.value.toUpperCase())}
              required
              placeholder="np. INF-I-2025"
              style={{
                width: '100%',
                padding: 12,
                fontSize: '1em',
                border: '1px solid #ccc',
                borderRadius: 4,
                fontFamily: 'monospace',
                textTransform: 'uppercase'
              }}
            />
          </div>

          {/* Rok, Poziom, Tryb */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', fontSize: '0.95em' }}>
                Rok akademicki: <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="number"
                value={form.academicYear}
                onChange={(e) => updateField('academicYear', parseInt(e.target.value) || 0)}
                required
                min={2000}
                max={2100}
                style={{ width: '100%', padding: 12, fontSize: '1em', border: '1px solid #ccc', borderRadius: 4 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', fontSize: '0.95em' }}>
                Poziom:
              </label>
              <select
                value={form.level}
                onChange={(e) => updateField('level', e.target.value)}
                style={{ width: '100%', padding: 12, fontSize: '1em', border: '1px solid #ccc', borderRadius: 4, background: 'white' }}
              >
                <option value="I stopień">I stopień</option>
                <option value="II stopień">II stopień</option>
                <option value="Jednolite magisterskie">Jednolite magisterskie</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', fontSize: '0.95em' }}>
                Tryb:
              </label>
              <select
                value={form.studyMode}
                onChange={(e) => updateField('studyMode', e.target.value)}
                style={{ width: '100%', padding: 12, fontSize: '1em', border: '1px solid #ccc', borderRadius: 4, background: 'white' }}
              >
                <option value="Stacjonarne">Stacjonarne</option>
                <option value="Niestacjonarne">Niestacjonarne</option>
              </select>
            </div>
          </div>

          {/* Opis */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', fontSize: '0.95em' }}>
              Opis (opcjonalnie):
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={4}
              placeholder="Krótki opis programu studiów..."
              style={{
                width: '100%',
                padding: 12,
                fontSize: '1em',
                border: '1px solid #ccc',
                borderRadius: 4,
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Przyciski */}
          <div style={{ display: 'flex', gap: 12, marginTop: 30, paddingTop: 20, borderTop: '2px solid #dee2e6' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '14px 24px',
                fontSize: '1.05em',
                fontWeight: 'bold',
                background: loading ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '⏳ Zapisywanie...' : (isEditMode ? '✓ Zapisz zmiany' : '✓ Utwórz sylabus')}
            </button>
            <button
              type="button"
              onClick={() => navigate(isEditMode ? `/curriculum/${id}` : '/')}
              disabled={loading}
              style={{
                padding: '14px 24px',
                fontSize: '1.05em',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              Anuluj
            </button>
          </div>
        </div>
      </form>
    </div>
    )
};