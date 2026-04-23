import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, CalendarDays, User } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
                            {/* icon bounce */}
                            <img src="/martlet.webp" alt="McGill Martlet" className="h-8 w-8 sm:h-10 sm:w-10 object-contain transition-transform duration-300 group-hover:scale-110" />
                            <span className="font-bold text-xl sm:text-2xl text-mcgill-red tracking-tight">McBook</span>
                        </Link>
                    </div>

                    {/* navigation links */}
                    {/* reduced gap on mobile */}
                    <div className="flex items-center gap-3 sm:gap-5">
                        {!user ? (
                            <>
                                {/* underline effect */}
                                <Link to="/login" className="relative group text-slate-600 font-medium pb-1">
                                    Sign In
                                    <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-mcgill-red transition-all duration-300 ease-out group-hover:w-full"></span>
                                </Link>
                                
                                {/* tactile button */}
                                <Link to="/register" className="bg-mcgill-red hover:bg-mcgill-dark text-white px-4 sm:px-5 py-2 rounded-lg font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200">
                                    Register
                                </Link>
                            </>
                        ) : (
                            <>
                                {/* collision prevention mobile */}
                                <div className="hidden md:flex items-center gap-2 text-slate-600 mr-4 border-r border-slate-200 pr-5">
                                    <User className="h-4 w-4" />
                                    <span className="text-sm font-medium whitespace-nowrap">{user.name}</span>
                                </div>
                                <Link 
                                    to={user.role === 'OWNER' ? "/owner-dashboard" : "/student-dashboard"}
                                    className="relative group flex items-center gap-2 text-slate-600 font-medium pb-1"
                                >
                                    <CalendarDays className="h-5 w-5 transition-transform duration-300 group-hover:text-mcgill-red" />
                                    {/* for super small screens */}
                                    <span className="hidden sm:inline">Dashboard</span>
                                    <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-mcgill-red transition-all duration-300 ease-out group-hover:w-full"></span>
                                </Link>
                                <button 
                                    onClick={logout}
                                    className="flex items-center gap-2 text-slate-400 hover:text-mcgill-red font-medium hover:bg-red-50 p-2 rounded-full transition-all duration-200 ml-1 active:scale-90"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}