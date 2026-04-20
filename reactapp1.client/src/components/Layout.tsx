import {useNavigate } from 'react-router-dom';

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  function applyFilter(query: Record<string, string>) {
    const params = new URLSearchParams(window.location.search);
    Object.keys(query).forEach(k => {
      if (query[k]) params.set(k, query[k]);
      else params.delete(k);
    });
    const search = params.toString();
    navigate(search ? `/?${search}` : '/');
  }

  return (
    <>
      <div className="top">
        <div className="banner">
          <h1>System Zarządzania Sylabusami</h1>
        </div>
        <div className="userlogon">
          <button className="logout" onClick={() => alert('Wyloguj (do zaimplementowania)')}>
            Wyloguj
          </button>
        </div>
      </div>

      <div className="left">
        <h2>Rozpoczęcie studiów</h2>
        <ul>
          <li onClick={() => applyFilter({ year: '2026' })}>2026/2027</li>
          <li onClick={() => applyFilter({ year: '2025' })}>2025/2026</li>
          <li onClick={() => applyFilter({ year: '' })}>Wszystkie</li>
        </ul>

        <h2>Poziom kształcenia</h2>
        <ul>
          <li onClick={() => applyFilter({ level: 'I' })}>I stopień</li>
          <li onClick={() => applyFilter({ level: 'II' })}>II stopień</li>
          <li onClick={() => applyFilter({ level: '' })}>Wszystkie</li>
        </ul>

        <h2>Forma studiów</h2>
        <ul>
          <li onClick={() => applyFilter({ mode: 'stacjonarne' })}>Stacjonarne</li>
          <li onClick={() => applyFilter({ mode: 'niestacjonarne' })}>Niestacjonarne</li>
          <li onClick={() => applyFilter({ mode: '' })}>Wszystkie</li>
        </ul>

        <h2>Nawigacja</h2>
        <ul>
          <li onClick={() => navigate('/')}>Lista sylabusów</li>
          <li onClick={() => navigate('/create')}>Nowy sylabus</li>
          <li onClick={() => navigate('/grid')}>Siatka przedmiotów</li>
        </ul>
      </div>

      <div className="right">
        {children}
      </div>

      <div className="footer">
        <p style={{ textAlign: 'center', lineHeight: '100px', margin: 0 }}>
          © Uczelnia — System Zarządzania Sylabusami
        </p>
      </div>
    </>
  );
}