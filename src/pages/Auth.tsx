import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithEmail, signupWithEmail, loginWithGoogle } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function Auth() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Redirect to dashboard if already authenticated
    useEffect(() => {
        if (user) {
            console.log('User already authenticated, redirecting to dashboard');
            navigate('/', { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await loginWithEmail(email, password);
            } else {
                await signupWithEmail(email, password);
            }
            navigate('/');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);

        try {
            await loginWithGoogle();
            // After successful popup login, the onAuthStateChanged listener
            // will update the user state and trigger navigation
            navigate('/');
        } catch (err: unknown) {
            console.error('Google login error:', err);
            // Handle specific error codes
            if (err instanceof Error) {
                if (err.message.includes('popup-closed-by-user')) {
                    setError('Sign-in was cancelled. Please try again.');
                } else if (err.message.includes('popup-blocked')) {
                    setError('Popup was blocked. Please allow popups for this site.');
                } else {
                    setError(err.message);
                }
            } else {
                setError('Google login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-radial from-dark-surface to-dark-bg">
            <div className="w-full max-w-md">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold gradient-text mb-2">✈️ SkyLog</h1>
                    <p className="text-gray-400">Track your journey across the globe</p>
                </div>

                {/* Auth Card */}
                <div className="glass rounded-2xl p-8 border border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-6">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            type="email"
                            label="Email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Input
                            type="password"
                            label="Password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            isLoading={loading}
                        >
                            {isLogin ? 'Sign In' : 'Sign Up'}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-dark-surface text-gray-400">Or continue with</span>
                        </div>
                    </div>

                    <Button
                        variant="secondary"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={handleGoogleLogin}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Google
                    </Button>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-neon-blue hover:underline text-sm"
                        >
                            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
