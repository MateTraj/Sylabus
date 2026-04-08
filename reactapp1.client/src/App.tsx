import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import SyllabusList from './components/SyllabusList';
import SyllabusDetail from './components/SyllabusDetail';
import SyllabusForm from './components/SyllabusForm';
import CurriculumGridView from './components/CurriculumGridView';

interface Forecast {
    date: string;
    temperatureC: number;
    temperatureF: number;
    summary: string;
}

function App() {
    const [forecasts, setForecasts] = React.useState<Forecast[]>();

    React.useEffect(() => {
        populateWeatherData();
    }, []);

    const contents = forecasts === undefined
        ? <p><em>Loading... Please refresh once the ASP.NET backend has started. See <a href="https://aka.ms/jspsintegrationreact">https://aka.ms/jspsintegrationreact</a> for more details.</em></p>
        : <table className="table table-striped" aria-labelledby="tableLabel">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Temp. (C)</th>
                    <th>Temp. (F)</th>
                    <th>Summary</th>
                </tr>
            </thead>
            <tbody>
                {forecasts.map(forecast =>
                    <tr key={forecast.date}>
                        <td>{forecast.date}</td>
                        <td>{forecast.temperatureC}</td>
                        <td>{forecast.temperatureF}</td>
                        <td>{forecast.summary}</td>
                    </tr>
                )}
            </tbody>
        </table>;

    return (
        <BrowserRouter>
            <div style={{ padding: 16 }}>
                <header style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>System zarz¹dzania sylabusami</h1>
                    <nav>
                        <Link to="/" style={{ marginRight: 12 }}>Lista</Link>
                        <Link to="/create" style={{ marginRight: 12 }}>Nowy</Link>
                        <Link to="/grid">Siatka</Link>
                    </nav>
                </header>

                <main>
                    <Routes>
                        <Route path="/" element={<SyllabusList />} />
                        <Route path="/create" element={<SyllabusForm />} />
                        <Route path="/grid" element={<CurriculumGridView />} />
                        <Route path="/syllabus/:id" element={<SyllabusDetail />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );

    async function populateWeatherData() {
        const response = await fetch('weatherforecast');
        if (response.ok) {
            const data = await response.json();
            setForecasts(data);
        }
    }
}

export default App;