import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SyllabusList from './components/SyllabusList';
import SyllabusDetail from './components/SyllabusDetail';
import SyllabusForm from './components/SyllabusForm';
import CurriculumGridView from './components/CurriculumGridView';
import Layout from './components/Layout';

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Layout>
        <Routes>
          <Route path="/" element={<SyllabusList />} />
          <Route path="/create" element={<SyllabusForm />} />
          <Route path="/grid" element={<CurriculumGridView />} />
          <Route path="/syllabus/:id" element={<SyllabusDetail />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}