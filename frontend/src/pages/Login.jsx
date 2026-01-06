import { useState } from 'react';
import useAuthStore from '../store/authStore';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(username, password);
        } catch (err) {
            setError(err.response?.data?.error || 'Inloggning misslyckades');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 dark:from-dark-950 dark:via-dark-900 dark:to-dark-800 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-white mb-2">✨ Flux</h1>
                    <p className="text-primary-100 dark:text-dark-600">Din självhostade fotoplattform</p>
                </div>

                <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl p-8">
                    <h2 className="text-2xl font-semibold text-primary mb-6">Logga in</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-primary mb-2">
                                Användarnamn
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-primary transition"
                                placeholder="admin"
                                required
                                autoFocus
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-primary mb-2">
                                Lösenord
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-primary transition"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Loggar in...
                                </>
                            ) : (
                                'Logga in'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-secondary">
                        <p>🔒 Självhostad och privat</p>
                    </div>
                </div>

                <div className="mt-4 text-center text-sm text-primary-100 dark:text-dark-600">
                    <p>Flux v0.1.0 • Integritet först</p>
                </div>
            </div>
        </div>
    );
}

export default Login;
