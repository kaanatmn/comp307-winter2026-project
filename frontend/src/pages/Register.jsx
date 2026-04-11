import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User as UserIcon, Loader2, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.endsWith('@mcgill.ca') && !email.endsWith('@mail.mcgill.ca')) {
            setError('You must use a valid @mcgill.ca or @mail.mcgill.ca email address.');
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/auth/register', { name, email, password });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-md w-full space-y-8 bg-white/70 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white"
            >
                <div>
                    <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-600">
                        Already have an account? <Link to="/login" className="font-semibold text-mcgill-red hover:text-mcgill-dark transition-colors relative group">
                            Sign in here
                            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-mcgill-red transition-all duration-300 ease-out group-hover:w-full"></span>
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            className="bg-red-50 border-l-4 border-mcgill-red p-4 rounded-r-lg shadow-sm"
                        >
                            <p className="text-sm text-mcgill-dark font-medium">{error}</p>
                        </motion.div>
                    )}

                    <div className="space-y-4 rounded-md shadow-sm">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <UserIcon className="h-5 w-5 text-slate-400 group-focus-within:text-mcgill-red transition-colors" />
                            </div>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="appearance-none bg-white/80 rounded-xl relative block w-full pl-11 px-4 py-3.5 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-mcgill-red/20 focus:border-mcgill-red focus:bg-white sm:text-sm transition-all duration-200"
                                placeholder="Full Name"
                            />
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-mcgill-red transition-colors" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none bg-white/80 rounded-xl relative block w-full pl-11 px-4 py-3.5 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-mcgill-red/20 focus:border-mcgill-red focus:bg-white sm:text-sm transition-all duration-200"
                                placeholder="McGill Email Address"
                            />
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-mcgill-red transition-colors" />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none bg-white/80 rounded-xl relative block w-full pl-11 px-4 py-3.5 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-mcgill-red/20 focus:border-mcgill-red focus:bg-white sm:text-sm transition-all duration-200"
                                placeholder="Create Password"
                            />
                        </div>
                    </div>

                    <div className="text-xs text-slate-500 text-center px-4">
                        <p>Use <span className="font-semibold text-slate-700">@mcgill.ca</span> for Prof/TA access.</p>
                        <p>Use <span className="font-semibold text-slate-700">@mail.mcgill.ca</span> for Student access.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-mcgill-red hover:bg-mcgill-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mcgill-red transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0 disabled:active:scale-100"
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                            <>
                                Register Account
                                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}