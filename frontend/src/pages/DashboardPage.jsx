import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const Bar = ({ n, max }) => {
    const percentage = max > 0 ? Math.min(100, (n / max) * 100) : 0;
    return (
        <div className="bar">
            <i style={{ width: `${percentage}%` }} />
        </div>
    );
};

export default function DashboardPage() {
    const auth = useAuth();
    const [data, setData] = useState(null);

    useEffect(() => {
        if (auth?.token) {
            api('/dashboard', auth.token).then(setData).catch(console.error);
        }
    }, [auth?.token]);

    if (!data) return <p>Chargement…</p>;

    return (
        <>
            <header>
                <div>
                    <p className="eyebrow">ESPACE DE GESTION</p>
                    <h1>Vue d’ensemble</h1>
                </div>
            </header>

            <section className="stats">
                {[
                    [data.total_events, 'Événements'],
                    [data.published_events, 'Publiés'],
                    [data.registrations_today, 'Inscriptions aujourd’hui']
                ].map(([n, l]) => (
                    <article className="stat" key={l}>
                        <strong>{n}</strong>
                        <p>{l}</p>
                    </article>
                ))}
            </section>

            <section className="panel">
                <div className="panelhead">
                    <div>
                        <h2>Top événements</h2>
                        <p>Les 5 événements les plus remplis.</p>
                    </div>
                    <Link to="/events">Voir les événements →</Link>
                </div>
                {data.topEvents.map((e, i) => (
                    <div className="rank" key={e.id}>
                        <b>0{i + 1}</b>
                        <span>{e.title}</span>
                        <em>{e.registration_count}/{e.max_participants}</em>
                        <Bar n={e.registration_count} max={e.max_participants} />
                    </div>
                ))}
            </section>
        </>
    );
}