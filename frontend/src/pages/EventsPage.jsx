import { useEffect, useState } from 'react';
import { api, date } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const Badge = ({ children }) => (
    <span className={`badge ${children}`}>{children}</span>
);

export default function EventsPage() {
    const auth = useAuth();
    const [events, setEvents] = useState([]);
    const [filter, setFilter] = useState('');
    const [detail, setDetail] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [error, setError] = useState('');

    // حالات التصفح (Pagination States)
    const [page, setPage] = useState(1);
    const limit = 10; // عدد العناصر في الصفحة الواحدة

    const load = () => {
        if (!auth?.token) return;

        let query = `?page=${page}&limit=${limit}`;
        if (filter) {
            query += `&status=${filter}`;
        }

        api(`/events${query}`, auth.token)
            .then(setEvents)
            .catch(e => setError(e.message));
    };

    useEffect(() => {
        load();
    }, [filter, page, auth?.token]);

    const publish = async (id) => {
        try {
            await api(`/events/${id}/status`, auth.token, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'published' })
            });
            load();
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <p className="eyebrow">GESTION</p>
                    <h1>Événements</h1>
                </div>
                <button
                    className="primary"
                    onClick={() => setShowCreateModal(true)}
                    style={{ padding: '10px 20px', cursor: 'pointer' }}
                >
                    + Ajouter un événement
                </button>
            </header>

            {error && <p className="error">{error}</p>}

            <div className="tabs">
                {[
                    ['', 'Tous'],
                    ['published', 'Publiés'],
                    ['draft', 'Brouillons'],
                    ['cancelled', 'Annulés']
                ].map(([v, l]) => (
                    <button
                        className={filter === v ? 'sel' : ''}
                        onClick={() => { setFilter(v); setPage(1); }} // العودة للصفحة الأولى عند تغيير الفلتر
                        key={l}
                    >
                        {l}
                    </button>
                ))}
            </div>

            <section className="listing">
                {events.map(e => (
                    <article className="row" onClick={() => setDetail(e)} key={e.id}>
                        <div className="day">
                            <b>{new Date(e.event_date).getDate()}</b>
                            <small>{new Date(e.event_date).toLocaleString('fr-FR', { month: 'short' })}</small>
                        </div>
                        <div className="event">
                            <Badge>{e.status}</Badge>
                            <h3>{e.title}</h3>
                            <p>{e.location} · {date(e.event_date)}</p>
                        </div>
                        <b>{e.registration_count}/{e.max_participants}</b>
                        {e.status === 'draft' && (
                            <button className="outline" onClick={x => { x.stopPropagation(); publish(e.id); }}>
                                Publier
                            </button>
                        )}
                    </article>
                ))}
            </section>

            {/* أزرار التنقل بين الصفحات (Pagination Controls) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '0 10px' }}>
                <button
                    className="outline"
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    style={{ cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
                >
                    Précédent
                </button>

                <span style={{ fontWeight: 'bold' }}>Page {page}</span>

                <button
                    className="outline"
                    onClick={() => setPage(prev => prev + 1)}
                    disabled={events.length < limit}
                    style={{ cursor: events.length < limit ? 'not-allowed' : 'pointer', opacity: events.length < limit ? 0.5 : 1 }}
                >
                    Suivant
                </button>
            </div>

            {/* نافذة تفاصيل الحدث */}
            {detail && <EventDetail event={detail} auth={auth} close={() => setDetail(null)} />}

            {/* نافذة إنشاء حدث جديد */}
            {showCreateModal && (
                <CreateEventModal
                    auth={auth}
                    close={() => setShowCreateModal(false)}
                    onCreated={() => { setShowCreateModal(false); load(); }}
                />
            )}
        </>
    );
}

// مكون نموذج إنشاء حدث جديد
function CreateEventModal({ auth, close, onCreated }) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        location: '',
        event_date: '',
        max_participants: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api('/events', auth.token, {
                method: 'POST',
                body: JSON.stringify({
                    title: form.title,
                    description: form.description,
                    location: form.location,
                    eventDate: form.event_date,
                    maxParticipants: Number(form.max_participants)
                })
            });
            onCreated();
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <div className="overlay" onClick={close}>
            <section className="modal" onClick={e => e.stopPropagation()}>
                <button className="close" onClick={close}>×</button>
                <h2>Créer un événement</h2>
                {error && <p className="error">{error}</p>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                    <input
                        type="text"
                        placeholder="Titre"
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        required
                    />
                    <textarea
                        placeholder="Description"
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        rows="3"
                    />
                    <input
                        type="text"
                        placeholder="Lieu (Location)"
                        value={form.location}
                        onChange={e => setForm({ ...form, location: e.target.value })}
                        required
                    />
                    <input
                        type="datetime-local"
                        value={form.event_date}
                        onChange={e => setForm({ ...form, event_date: e.target.value })}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Max Participants"
                        value={form.max_participants}
                        onChange={e => setForm({ ...form, max_participants: e.target.value })}
                        min="1"
                        required
                    />
                    <button type="submit" className="primary" style={{ marginTop: '10px' }}>Enregistrer</button>
                </form>
            </section>
        </div>
    );
}

function EventDetail({ event, auth, close }) {
    const [data, setData] = useState(null);

    useEffect(() => {
        if (auth?.token && event?.id) {
            api(`/events/${event.id}`, auth.token).then(setData).catch(console.error);
        }
    }, [event.id, auth?.token]);

    return (
        <div className="overlay" onClick={close}>
            <section className="modal" onClick={e => e.stopPropagation()}>
                <button className="close" onClick={close}>×</button>
                <Badge>{event.status}</Badge>
                <h2>{event.title}</h2>
                <p>{event.description}</p>
                <p>{event.location} · {date(event.event_date)}</p>

                <h3>Inscriptions ({data?.registrations?.length || 0})</h3>

                {data?.registrations?.map(r => (
                    <div className="reg" key={r.id}>
                        <b>{r.full_name}</b>
                        <small>{r.email}</small>
                        <Badge>{r.status}</Badge>
                    </div>
                ))}
            </section>
        </div>
    );
}