import { useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'; // <--- تأكد من وجود useNavigate هنا
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import EventsPage from './pages/EventsPage.jsx';
import ParticipantsPage from './pages/ParticipantsPage.jsx';
import RegistrationPage from './pages/RegistrationPage.jsx';
import Layout from './components/Layout.jsx';
import { AuthContext } from './context/AuthContext.jsx';
import './App.css';

const Protected = ({ auth, logout, children }) =>
    auth ? <Layout user={auth.user} logout={logout}>{children}</Layout> : <Navigate to="/login" replace />;

export default function App() {
    const navigate = useNavigate(); // الآن سيعمل بشكل صحيح تماماً
    const [auth, setAuth] = useState(null);

    const login = (value) => {
        setAuth(value);
        navigate('/dashboard');
    };

    const logout = () => {
        setAuth(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={auth}>
            <Routes>
                <Route path="/login" element={auth ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={login} />} />
                <Route path="/dashboard" element={<Protected auth={auth} logout={logout}><DashboardPage /></Protected>} />
                <Route path="/events" element={<Protected auth={auth} logout={logout}><EventsPage /></Protected>} />
                <Route path="/participants" element={<Protected auth={auth} logout={logout}><ParticipantsPage /></Protected>} />
                <Route path="/registrations/new" element={<Protected auth={auth} logout={logout}><RegistrationPage /></Protected>} />
                <Route path="*" element={<Navigate to={auth ? '/dashboard' : '/login'} replace />} />
            </Routes>
        </AuthContext.Provider>
    );
}