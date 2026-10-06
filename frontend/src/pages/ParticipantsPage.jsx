import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function ParticipantsPage() {
    const auth = useAuth();
    const [people, setPeople] = useState([]);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ fullName: '', email: '', phone: '' });
    const [open, setOpen] = useState(false);
    const [error, setError] = useState('');

    // حالات التصفح (Pagination States)
    const [page, setPage] = useState(1);
    const limit = 10; // عدد المشاركين في الصفحة الواحدة

    const load = () => {
        if (!auth?.token) return;

        let query = `?page=${page}&limit=${limit}`;
        if (search) {
            query += `&search=${encodeURIComponent(search)}`;
        }

        api(`/participants${query}`, auth.token)
            .then(setPeople)
            .catch(err => setError(err.message));
    };

    useEffect(() => {
        load();
    }, [search, page, auth?.token]);

    const save = async (e) => {
        e.preventDefault();
        try {
            setError('');
            await api('/participants', auth.token, {
                method: 'POST',
                body: JSON.stringify(form)
            });
            setOpen(false);
            setForm({ fullName: '', email: '', phone: '' });
            load();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <>
            <header>
                <div>
                    <p className="eyebrow">GESTION</p>
                    <h1>Participants</h1>
                </div>
                <button className="primary" onClick={() => setOpen(true)}>+ Ajouter</button>
            </header>

            <input
                className="search"
                placeholder="Rechercher par nom ou e-mail…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }} // العودة للصفحة الأولى عند البحث
            />

            <section className="people">
                {people.map(p => (
                    <article key={p.id}>
                        <span className="avatar">{p.full_name?.[0] || '?'}</span>
                        <div>
                            <h3>{p.full_name}</h3>
                            <p>{p.email}</p>
                        </div>
                        <span>{p.phone || '—'}</span>
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
                    disabled={people.length < limit}
                    style={{ cursor: people.length < limit ? 'not-allowed' : 'pointer', opacity: people.length < limit ? 0.5 : 1 }}
                >
                    Suivant
                </button>
            </div>

            {open && (
                <div className="overlay">
                    <form className="modal form" onSubmit={save}>
                        <button type="button" className="close" onClick={() => setOpen(false)}>×</button>
                        <h2>Nouveau participant</h2>

                        {[
                            ['fullName', 'Nom complet'],
                            ['email', 'E-mail'],
                            ['phone', 'Téléphone']
                        ].map(([key, label]) => (
                            <label key={key}>
                                {label}
                                <input
                                    required={key !== 'phone'}
                                    type={key === 'email' ? 'email' : 'text'}
                                    value={form[key]}
                                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                                />
                            </label>
                        ))}

                        {error && <p className="error">{error}</p>}

                        <button className="primary">Enregistrer</button>
                    </form>
                </div>
            )}
        </>
    );
}