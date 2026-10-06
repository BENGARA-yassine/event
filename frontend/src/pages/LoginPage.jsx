import { useState } from 'react';
import { api } from '../lib/api.js';

export default function LoginPage({ onLogin }) {
    const [email, setEmail] = useState('admin@eventhub.test');
    const [password, setPassword] = useState('Password123!');
    const [error, setError] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            const response = await api('/auth/login', null, {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            onLogin(response);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login">
            <section className="intro">
                <b>✦ eventhub</b>
                <h1>L’événementiel,<br /><i>en mieux.</i></h1>
                <p>Organisez vos événements et créez des expériences qui comptent.</p>
            </section>

            <form className="loginbox" onSubmit={submit}>
                <b>✦</b>
                <h2>Bon retour</h2>
                <p>Connectez-vous à votre espace EventHub.</p>

                <label>
                    E-mail
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </label>

                <label>
                    Mot de passe
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </label>

                {error && <p className="error">{error}</p>}

                <button className="primary">Se connecter →</button>

                <small>admin@eventhub.test · Password123!</small>
            </form>
        </div>
    );
}