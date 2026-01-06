import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import useThemeStore from './store/themeStore';
import Login from './pages/Login';
import Library from './pages/Library';
import MainLayout from './layouts/MainLayout';

function App() {
    const { checkAuth, isAuthenticated, isLoading } = useAuthStore();
    const { initTheme } = useThemeStore();

    useEffect(() => {
        initTheme();
        checkAuth();
    }, [checkAuth, initTheme]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-primary">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-secondary">Laddar Flux...</p>
                </div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/login"
                    element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
                />
                <Route
                    path="/*"
                    element={
                        isAuthenticated ? (
                            <MainLayout>
                                <Routes>
                                    <Route path="/" element={<Library />} />
                                    <Route path="/library" element={<Library />} />
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </MainLayout>
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
