import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createSubject, fetchCurriculums } from '../api/api';
import type { Curriculum } from '../types/types';

export default function SyllabusForm() {
  const navigate = useNavigate();
  const [curriculums, setCurriculums] = React.useState<Curriculum[]>([]);
  const [form, setForm] = React.useState({
    code: '',
    name: '',
    description: '',
    curriculumId: '',
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

  // Załaduj dostępne siatki przedmiotów
  React.useEffect(() => {
    fetchCurriculums()
      .then(data => {
        setCurriculums(data);
        if (data.length > 0) {
          setForm(prev => ({ ...prev, curriculumId: data[0].id }));
        }
      })
      .catch(err => console.error('Błąd ładowania siatek:', err));
  }, []);

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
      navigate(`/syllabus/${created.id}`);
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
        <div style={{ background: '#fee', color: '#c00', padding: 12, marginBottom: 12, borderRadius: 6 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, maxWidth: 700 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
            Kod przedmiotu *
          </label>
          <input
            required
            placeholder="np. INF-PO-001"
            value={form.code}
            onChange={e => setForm({ ...form, code: e.target.value })}
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
            Nazwa przedmiotu *
          </label>
          <input
            required
            placeholder="np. Programowanie Obiektowe"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
            Siatka przedmiotów *
          </label>
          <select
            required
            value={form.curriculumId}
            onChange={e => setForm({ ...form, curriculumId: e.target.value })}
            style={{ width: '100%', padding: 8 }}
          >
            <option value="">-- Wybierz siatkę --</option>
            {curriculums.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
              Semestr *
            </label>
            <input
              required
              type="number"
              min="1"
              max="10"
              value={form.semester}
              onChange={e => setForm({ ...form, semester: Number(e.target.value) })}
              style={{ width: '100%', padding: 8 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
              ECTS *
            </label>
            <input
              required
              type="number"
              min="1"
              max="30"
              value={form.ectsPoints}
              onChange={e => setForm({ ...form, ectsPoints: Number(e.target.value) })}
              style={{ width: '100%', padding: 8 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
              Typ przedmiotu
            </label>
            <select
              value={form.subjectType}
              onChange={e => setForm({ ...form, subjectType: e.target.value })}
              style={{ width: '100%', padding: 8 }}
            >
              <option value="Obowiązkowy">Obowiązkowy</option>
              <option value="Fakultatywny">Fakultatywny</option>
              <option value="Do wyboru">Do wyboru</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
            Opis ogólny
          </label>
          <textarea
            placeholder="Krótki opis przedmiotu..."
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={3}
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <hr style={{ margin: '16px 0' }} />

        <h3>Pierwsza wersja sylabusa</h3>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
            Tytuł wersji
          </label>
          <input
            placeholder="Jeśli puste, użyje nazwy przedmiotu"
            value={initialVersion.title}
            onChange={e => setInitialVersion({ ...initialVersion, title: e.target.value })}
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
            Godziny
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
            <input
              type="number"
              placeholder="Suma"
              value={initialVersion.totalHours}
              onChange={e => setInitialVersion({ ...initialVersion, totalHours: Number(e.target.value) })}
              style={{ padding: 8 }}
            />
            <input
              type="number"
              placeholder="Wykłady"
              value={initialVersion.theoryHours}
              onChange={e => setInitialVersion({ ...initialVersion, theoryHours: Number(e.target.value) })}
              style={{ padding: 8 }}
            />
            <input
              type="number"
              placeholder="Lab"
              value={initialVersion.labHours}
              onChange={e => setInitialVersion({ ...initialVersion, labHours: Number(e.target.value) })}
              style={{ padding: 8 }}
            />
            <input
              type="number"
              placeholder="Inne"
              value={initialVersion.otherHours}
              onChange={e => setInitialVersion({ ...initialVersion, otherHours: Number(e.target.value) })}
              style={{ padding: 8 }}
            />
          </div>
          <small style={{ color: '#666', display: 'block', marginTop: 4 }}>
            Suma: {initialVersion.theoryHours + initialVersion.labHours + initialVersion.otherHours} 
            (powinno być: {initialVersion.totalHours})
          </small>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
            Opis sylabusa
          </label>
          <textarea
            placeholder="Szczegółowy opis treści przedmiotu..."
            value={initialVersion.description}
            onChange={e => setInitialVersion({ ...initialVersion, description: e.target.value })}
            rows={3}
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
            Efekty kształcenia
          </label>
          <textarea
            placeholder="Jakie umiejętności zdobędzie student..."
            value={initialVersion.learningOutcomes}
            onChange={e => setInitialVersion({ ...initialVersion, learningOutcomes: e.target.value })}
            rows={3}
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
            Wymagania wstępne
          </label>
          <textarea
            placeholder="Jakie przedmioty/umiejętności są wymagane..."
            value={initialVersion.prerequisites}
            onChange={e => setInitialVersion({ ...initialVersion, prerequisites: e.target.value })}
            rows={2}
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
            Literatura
          </label>
          <textarea
            placeholder="Zalecane książki i materiały..."
            value={initialVersion.literature}
            onChange={e => setInitialVersion({ ...initialVersion, literature: e.target.value })}
            rows={2}
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
            Metody oceniania
          </label>
          <textarea
            placeholder="Jak student będzie oceniany..."
            value={initialVersion.assessmentMethods}
            onChange={e => setInitialVersion({ ...initialVersion, assessmentMethods: e.target.value })}
            rows={2}
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button type="submit" disabled={loading} style={{ padding: '10px 20px', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Tworzenie...' : 'Utwórz przedmiot'}
          </button>
          <button type="button" onClick={() => navigate(-1)} style={{ padding: '10px 20px', cursor: 'pointer' }}>
            Anuluj
          </button>
        </div>
      </form>
    </div>
  );
}