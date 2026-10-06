import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegistrationPage() {
    const auth = useAuth();
    const [events, setEvents] = useState([]);
    const [people, setPeople] = useState([]);
    const [eventId, setEventId] = useState('');
    const [participantId, setParticipantId] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!auth?.token) return;
        Promise.all([
            api('/events?status=published', auth.token),
            api('/participants', auth.token)
        ])
            .then(([e, p]) => {
                setEvents(e);
                setPeople(p);
            })
            .catch(err => setMessage(err.message));
    }, [auth?.token]);

    const submit = async (e) => {
        e.preventDefault();
        try {
            setMessage('');
            await api('/registrations', auth.token, {
                method: 'POST',
                body: JSON.stringify({ eventId, participantId, status: 'confirmed' })
            });
            setMessage('Inscription confirmée.');
            // إعادة تعيين الحقول بعد النجاح
            setEventId('');
            setParticipantId('');
        } catch (err) {
            setMessage(err.message);
        }
    };

    return (
        <>
            <header>
                <div>
                    <p className="eyebrow">INSCRIPTIONS</p>
                    <h1>Nouvelle inscription</h1>
                </div>
            </header>

            <form className="pageform" onSubmit={submit}>
                <p>Associez un participant à un événement publié.</p>

                <label>
                    Événement
                    <select required value={eventId} onChange={e => setEventId(e.target.value)}>
                        <option value="">Sélectionner</option>
                        {events.map(e => (
                            <option value={e.id} key={e.id}>
                                {e.title} ({e.registration_count}/{e.max_participants})
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    Participant
                    <select required value={participantId} onChange={e => setParticipantId(e.target.value)}>
                        <option value="">Sélectionner</option>
                        {people.map(p => (
                            <option value={p.id} key={p.id}>
                                {p.full_name} — {p.email}
                            </option>
                        ))}
                    </select>
                </label>

                {message && <p className="message">{message}</p>}

                <button className="primary">Confirmer l’inscription →</button>
            </form>
        </>
    );
}