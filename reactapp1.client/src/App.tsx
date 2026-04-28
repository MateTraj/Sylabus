import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SyllabusList from './components/SyllabusList';
import SyllabusDetail from './components/SyllabusDetail';
import SyllabusForm from './components/SyllabusForm';
import CurriculumGridView from './components/CurriculumGridView';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Layout from './components/Layout';
import { getAuthUser, canEdit } from './api/api';

/**
 * Komponent ochronny - wymusza logowanie na chronionych trasach
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = getAuthUser();
  
  // Jeśli użytkownik NIE jest zalogowany -> przekieruj na /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

/**
 * Komponent ochronny - tylko dla Editorów
 */
function EditorRoute({ children }: { children: React.ReactNode }) {
  const user = getAuthUser();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!canEdit()) {
    // Użytkownik zalogowany, ale nie ma uprawnień
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>🔒 Brak uprawnień</h2>
        <p>Aby wykonać tę akcję, potrzebujesz roli <strong>Editor</strong>.</p>
        <button onClick={() => window.history.back()}>Wróć</button>
      </div>
    );
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Routes>
        {/* === PUBLICZNE TRASY (bez Layout) === */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* === CHRONIONE TRASY (z Layout) === */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <SyllabusList />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/grid" element={
          <ProtectedRoute>
            <Layout>
              <CurriculumGridView />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/syllabus/:id" element={
          <ProtectedRoute>
            <Layout>
              <SyllabusDetail />
            </Layout>
          </ProtectedRoute>
        } />

        {/* === TYLKO DLA EDITORÓW === */}
        <Route path="/create" element={
          <EditorRoute>
            <Layout>
              <SyllabusForm />
            </Layout>
          </EditorRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}