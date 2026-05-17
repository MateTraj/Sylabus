import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createSubject, fetchCurriculums } from '../api/api';
import type { Curriculum } from '../types/types';

export default function SyllabusForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [curriculums, setCurriculums] = React.useState<Curriculum[]>([]);
  
  const preselectedCurriculumId = searchParams.get('curriculumId');
  
  const [form, setForm] = React.useState({
    code: '',
    name: '',
    description: '',
    curriculumId: preselectedCurriculumId || '',
    semester: 1,
    subjectType: 'Obowiązkowy',
    ectsPoints: 3,
  });
  
  const [initialVersion, setInitialVersion] = React.useState({
    title: '',
    description: '',
    learningOutcomes: '',
    prerequisites: '',
    literature: '',
    assessmentMethods: '',
    totalHours: 30,
    theoryHours: 15,
    labHours: 15,
    otherHours: 0,
  });
  
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    fetchCurriculums()
      .then(data => {
        setCurriculums(data);
        if (data.length > 0 && !preselectedCurriculumId) {
          setForm(prev => ({ ...prev, curriculumId: data[0].id }));
        }
      })
      .catch(err => console.error('Błąd ładowania siatek:', err));
  }, [preselectedCurriculumId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Walidacja
    if (!form.code || !form.name || !form.curriculumId) {
      setError('Kod, nazwa i siatka przedmiotów są wymagane');
      setLoading(false);
      return;
    }

    if (initialVersion.totalHours !== initialVersion.theoryHours + initialVersion.labHours + initialVersion.otherHours) {
      setError('Suma godzin (wykład + lab + inne) musi równać się całkowitej liczbie godzin');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        code: form.code,
        name: form.name,
        description: form.description || undefined,
        curriculumId: form.curriculumId,
        semester: form.semester,
        subjectType: form.subjectType,
        ectsPoints: form.ectsPoints,
        versions: [{
          title: initialVersion.title || form.name,
          versionNumber: 1,
          description: initialVersion.description || undefined,
          learningOutcomes: initialVersion.learningOutcomes || undefined,
          prerequisites: initialVersion.prerequisites || undefined,
          literature: initialVersion.literature || undefined,
          assessmentMethods: initialVersion.assessmentMethods || undefined,
          totalHours: initialVersion.totalHours,
          theoryHours: initialVersion.theoryHours,
          labHours: initialVersion.labHours,
          otherHours: initialVersion.otherHours,
        }],
      };

      console.log('Wysyłanie payload:', payload);
      const created = await createSubject(payload);
      
      // Przekierowanie na /subject/ zamiast /syllabus/
      navigate(`/subject/${created.id}`);
    } catch (err) {
      setError(String(err));
      console.error('Błąd tworzenia przedmiotu:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Nowy przedmiot</h2>

      {error && (
        <div style={{ 
          background: '#fee', 
          color: '#c00', 
          padding: 12, 
          borderRadius: 6, 
          marginBottom: 16 
        }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Siatka przedmiotów */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Sylabus (siatka przedmiotów): <span style={{ color: 'red' }}>*</span>
          </label>
          <select
            value={form.curriculumId}
            onChange={(e) => setForm(prev => ({ ...prev, curriculumId: e.target.value }))}
            required
            disabled={!!preselectedCurriculumId}
            style={{
              width: '100%',
              padding: 8,
              fontSize: '1em',
              border: '1px solid #ccc',
              borderRadius: 4,
              background: preselectedCurriculumId ? '#f0f0f0' : 'white'
            }}
          >
            <option value="">-- Wybierz sylabus --</option>
            {curriculums.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
          {preselectedCurriculumId && (
            <small style={{ color: '#666' }}>Sylabus został wybrany automatycznie</small>
          )}
        </div>

        {/* Kod przedmiotu */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Kod przedmiotu: <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            value={form.code}
            onChange={(e) => setForm(prev => ({ ...prev, code: e.target.value }))}
            required
            placeholder="np. INF-PO-001"
            style={{
              width: '100%',
              padding: 8,
              fontSize: '1em',
              border: '1px solid #ccc',
              borderRadius: 4
            }}
          />
        </div>

        {/* Nazwa przedmiotu */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Nazwa przedmiotu: <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            required
            placeholder="np. Programowanie Obiektowe"
            style={{
              width: '100%',
              padding: 8,
              fontSize: '1em',
              border: '1px solid #ccc',
              borderRadius: 4
            }}
          />
        </div>

        {/* Semestr, ECTS, Typ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Semestr:</label>
            <input
              type="number"
              value={form.semester}
              onChange={(e) => setForm(prev => ({ ...prev, semester: parseInt(e.target.value) || 1 }))
}
              min={1}
              max={12}
              style={{ width: '100%', padding: 8, fontSize: '1em', border: '1px solid #ccc', borderRadius: 4 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>ECTS:</label>
            <input
              type="number"
              value={form.ectsPoints}
              onChange={(e) => setForm(prev => ({ ...prev, ectsPoints: parseInt(e.target.value) || 0 }))
}
              min={0}
              style={{ width: '100%', padding: 8, fontSize: '1em', border: '1px solid #ccc', borderRadius: 4 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Typ:</label>
            <select
              value={form.subjectType}
              onChange={(e) => setForm(prev => ({ ...prev, subjectType: e.target.value }))
}
              style={{ width: '100%', padding: 8, fontSize: '1em', border: '1px solid #ccc', borderRadius: 4 }}
            >
              <option value="Obowiązkowy">Obowiązkowy</option>
              <option value="Fakultatywny">Fakultatywny</option>
              <option value="Do wyboru">Do wyboru</option>
            </select>
          </div>
        </div>

        {/* Opis */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Opis:</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))
}
            rows={3}
            style={{ width: '100%', padding: 8, fontSize: '1em', border: '1px solid #ccc', borderRadius: 4, fontFamily: 'inherit' }}
          />
        </div>

        {/* Początkowa wersja sylabusa */}
        <div style={{ marginTop: 30, padding: 16, background: '#f0f8ff', borderRadius: 8, border: '1px solid #0066cc' }}>
          <h3>📖 Pierwsza wersja sylabusa</h3>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Tytuł wersji:</label>
            <input
              type="text"
              value={initialVersion.title}
              onChange={(e) => setInitialVersion(prev => ({ ...prev, title: e.target.value }))
}
              placeholder="Domyślnie: nazwa przedmiotu"
              style={{ width: '100%', padding: 8, fontSize: '1em', border: '1px solid #ccc', borderRadius: 4 }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Opis:</label>
            <textarea
              value={initialVersion.description}
              onChange={(e) => setInitialVersion(prev => ({ ...prev, description: e.target.value }))
}
              rows={2}
              style={{ width: '100%', padding: 8, fontSize: '1em', border: '1px solid #ccc', borderRadius: 4, fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Efekty kształcenia:</label>
            <textarea
              value={initialVersion.learningOutcomes}
              onChange={(e) => setInitialVersion(prev => ({ ...prev, learningOutcomes: e.target.value }))
}
              rows={3}
              style={{ width: '100%', padding: 8, fontSize: '1em', border: '1px solid #ccc', borderRadius: 4, fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Wymagania wstępne:</label>
            <textarea
              value={initialVersion.prerequisites}
              onChange={(e) => setInitialVersion(prev => ({ ...prev, prerequisites: e.target.value }))
}
              rows={2}
              style={{ width: '100%', padding: 8, fontSize: '1em', border: '1px solid #ccc', borderRadius: 4, fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Literatura:</label>
            <textarea
              value={initialVersion.literature}
              onChange={(e) => setInitialVersion(prev => ({ ...prev, literature: e.target.value }))
}
              rows={2}
              style={{ width: '100%', padding: 8, fontSize: '1em', border: '1px solid #ccc', borderRadius: 4, fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Metody oceniania:</label>
            <textarea
              value={initialVersion.assessmentMethods}
              onChange={(e) => setInitialVersion(prev => ({ ...prev, assessmentMethods: e.target.value }))
}
              rows={2}
              style={{ width: '100%', padding: 8, fontSize: '1em', border: '1px solid #ccc', borderRadius: 4, fontFamily: 'inherit' }}
            />
          </div>

          {/* Godziny */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Całkowite:</label>
              <input
                type="number"
                value={initialVersion.totalHours}
                onChange={(e) => setInitialVersion(prev => ({ ...prev, totalHours: parseInt(e.target.value) || 0 }))
}
                min={0}
                style={{ width: '100%', padding: 8, fontSize: '1em', border: '1px solid #ccc', borderRadius: 4 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Wykład:</label>
              <input
                type="number"
                value={initialVersion.theoryHours}
                onChange={(e) => setInitialVersion(prev => ({ ...prev, theoryHours: parseInt(e.target.value) || 0 }))
}
                min={0}
                style={{ width: '100%', padding: 8, fontSize: '1em', border: '1px solid #ccc', borderRadius: 4 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Lab:</label>
              <input
                type="number"
                value={initialVersion.labHours}
                onChange={(e) => setInitialVersion(prev => ({ ...prev, labHours: parseInt(e.target.value) || 0 }))
}
                min={0}
                style={{ width: '100%', padding: 8, fontSize: '1em', border: '1px solid #ccc', borderRadius: 4 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Inne:</label>
              <input
                type="number"
                value={initialVersion.otherHours}
                onChange={(e) => setInitialVersion(prev => ({ ...prev, otherHours: parseInt(e.target.value) || 0 }))
}
                min={0}
                style={{ width: '100%', padding: 8, fontSize: '1em', border: '1px solid #ccc', borderRadius: 4 }}
              />
            </div>
          </div>
        </div>

        {/* Przyciski */}
        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px 24px',
              fontSize: '1em',
              fontWeight: 'bold',
              background: loading ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Tworzenie...' : '✓ Utwórz przedmiot'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={loading}
            style={{
              padding: '12px 24px',
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