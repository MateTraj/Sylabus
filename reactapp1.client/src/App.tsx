import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SyllabusesList from './components/SyllabusesList';
import CurriculumDetail from './components/CurriculumDetail';
import CurriculumForm from './components/CurriculumForm';     // NOWE
import SubjectDetail from './components/SubjectDetail';
import SyllabusForm from './components/SyllabusForm';
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
        <p>Potrzebujesz roli <strong>Editor</strong>.</p>
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
              <SyllabusesList />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/curriculum/:id" element={
          <ProtectedRoute>
            <Layout>
              <CurriculumDetail />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Tworzenie sylabusa */}
        <Route path="/curriculum/create" element={
          <EditorRoute>
            <Layout>
              <CurriculumForm />
            </Layout>
          </EditorRoute>
        } />

        {/* Edycja sylabusa */}
        <Route path="/curriculum/edit/:id" element={
          <EditorRoute>
            <Layout>
              <CurriculumForm />
            </Layout>
          </EditorRoute>
        } />

        <Route path="/subject/:id" element={
          <ProtectedRoute>
            <Layout>
              <SubjectDetail />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Tworzenie przedmiotu */}
        <Route path="/subject/create" element={
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