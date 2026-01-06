import { useState } from 'react';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import ThemeToggle from '../components/ThemeToggle';
import KeyboardShortcuts from '../components/KeyboardShortcuts';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';

function MainLayout({ children }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const { user, logout } = useAuthStore();
    const { theme } = useThemeStore();

    // Keyboard shortcuts
    useKeyboardShortcuts({
        '?': () => setShowShortcuts(true),
        'Escape': () => setShowShortcuts(false),
    });

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className="flex h-screen bg-primary">
            {/* Sidebar */}
            <aside
                className={`${sidebarCollapsed ? 'w-16' : 'w-64'
                    } bg-secondary border-r border-default transition-all duration-300 flex flex-col`}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-default">
                    {!sidebarCollapsed && (
                        <h1 className="text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                            ✨ Flux
                        </h1>
                    )}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-2 hover:bg-tertiary rounded-lg transition text-secondary"
                        title={sidebarCollapsed ? 'Expandera' : 'Kollapsa'}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {sidebarCollapsed ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    <a
                        href="/"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary-600 text-white"
                        title="Bibliotek"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {!sidebarCollapsed && <span>Bibliotek</span>}
                    </a>

                    <a
                        href="/albums"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-tertiary text-secondary transition"
                        title="Album"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {!sidebarCollapsed && <span>Album</span>}
                    </a>

                    <a
                        href="/favorites"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-tertiary text-secondary transition"
                        title="Favoriter"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {!sidebarCollapsed && <span>Favoriter</span>}
                    </a>
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-default">
                    <ThemeToggle collapsed={sidebarCollapsed} />

                    {!sidebarCollapsed && user && (
                        <div className="mt-3 pt-3 border-t border-default">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                                        {user.username[0].toUpperCase()}
                                    </div>
                                    <span className="text-sm text-primary font-medium">{user.username}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-1.5 hover:bg-tertiary rounded text-secondary transition"
                                    title="Logga ut"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>

            {/* Keyboard shortcuts overlay */}
            {showShortcuts && (
                <KeyboardShortcuts onClose={() => setShowShortcuts(false)} />
            )}
        </div>
    );
}

export default MainLayout;
