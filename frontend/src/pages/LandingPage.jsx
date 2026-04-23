import { useContext } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CalendarCheck, ShieldCheck, Clock, ArrowRight, LayoutDashboard } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function LandingPage() {
    const { user } = useContext(AuthContext);

    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
                        Welcome to <span className="text-mcgill-red relative inline-block">
                            McBook
                            <span className="absolute bottom-2 left-0 w-full h-3 bg-mcgill-light -z-10 rounded-full"></span>
                        </span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                        The official appointment booking platform for McGill University. Connect with your professors and TAs instantly.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        {/* dynamic button */}
                        {!user ? (
                            <>
                                <Link to="/register" className="group flex justify-center items-center gap-2 bg-mcgill-red hover:bg-mcgill-dark text-white px-8 py-3.5 rounded-xl font-semibold text-lg shadow-md hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-200">
                                    Get Started
                                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                                </Link>
                                <Link to="/login" className="bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 px-8 py-3.5 rounded-xl font-semibold text-lg shadow-sm hover:shadow-md hover:-translate-y-1 active:scale-95 transition-all duration-200">
                                    Sign In
                                </Link>
                            </>
                        ) : (
                            <Link to={user.role === 'OWNER' ? "/owner-dashboard" : "/student-dashboard"} className="group flex justify-center items-center gap-2 bg-mcgill-red hover:bg-mcgill-dark text-white px-8 py-3.5 rounded-xl font-semibold text-lg shadow-md hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-200">
                                <LayoutDashboard className="h-5 w-5" />
                                Go to your Dashboard
                                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                            </Link>
                        )}
                    </div>
                </motion.div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    <div className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-red-900/5 hover:-translate-y-2 transition-all duration-300 cursor-default">
                        <div className="w-14 h-14 bg-red-50 text-mcgill-red rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-mcgill-red group-hover:text-white transition-all duration-300">
                            <ShieldCheck className="h-7 w-7" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">1. Register</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Create an account using your official McGill email. <b>@mcgill.ca</b> accounts are registered as Owners, and <b>@mail.mcgill.ca</b> as Students.
                        </p>
                    </div>

                    <div className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-red-900/5 hover:-translate-y-2 transition-all duration-300 cursor-default">
                        <div className="w-14 h-14 bg-red-50 text-mcgill-red rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-mcgill-red group-hover:text-white transition-all duration-300">
                            <Clock className="h-7 w-7" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">2. Find or Create</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Owners can easily create and activate office hours. Students can seamlessly browse the directory to find their professors.
                        </p>
                    </div>

                    <div className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-red-900/5 hover:-translate-y-2 transition-all duration-300 cursor-default">
                        <div className="w-14 h-14 bg-red-50 text-mcgill-red rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-mcgill-red group-hover:text-white transition-all duration-300">
                            <CalendarCheck className="h-7 w-7" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">3. Book & Manage</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Reserve a slot with one click. Manage your schedule from your dashboard, email attendees, or export to your calendar.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}