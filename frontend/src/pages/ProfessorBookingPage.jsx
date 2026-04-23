import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Loader2, CalendarPlus, ArrowLeft } from 'lucide-react';
import api from '../api/axios';

export default function ProfessorBookingPage() {
    const { email } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [slots, setSlots] = useState([]);
    const [profName, setProfName] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) { fetchSlots(); }
    }, [user, email]);

    const fetchSlots = async () => {
        try {
            const res = await api.get(`/slots/available/${email}`);
            setSlots(res.data);
            if (res.data.length > 0) {
                setProfName(res.data[0].profName);
            }
        } catch (error) {
            console.error("Failed to fetch slots", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBookSlot = async (id) => {
        try {
            await api.post(`/slots/${id}/book`);
            alert("Successfully booked! You can view it in your Dashboard.");
            navigate('/student-dashboard'); 
        } catch (error) {
            alert(error.response?.data?.error || "Failed to book slot.");
        }
    };

    if (!user) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4">
                <User className="h-20 w-20 text-slate-300 mb-6" />
                <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Login Required</h2>
                <p className="text-slate-600 text-lg mb-8 max-w-md">You must be signed in with a McGill account to view availability and book an appointment with <b>{email}</b>.</p>
                <Link to="/login" state={{ from: location.pathname }} className="bg-mcgill-red text-white px-8 py-3.5 rounded-xl font-bold shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
                    Sign In to Continue
                </Link>
            </div>
        );
    }

    if (user.role === 'OWNER') {
         return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Owners cannot book slots</h2>
                <Link to="/owner-dashboard" className="text-mcgill-red font-semibold hover:underline">Return to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            {/* FIXED: Button now explicitly navigates to the student dashboard */}
            <button onClick={() => navigate('/student-dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-8 transition-colors font-medium">
                <ArrowLeft className="h-5 w-5" /> Back to Dashboard
            </button>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-10 text-center mb-8">
                <div className="h-24 w-24 bg-red-50 text-mcgill-red rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                    <User className="h-12 w-12" />
                </div>
                <h1 className="text-4xl font-bold text-slate-900">{profName || email}</h1>
                <p className="text-slate-500 mt-2 text-lg">Available Office Hours</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-16"><Loader2 className="h-12 w-12 text-mcgill-red animate-spin" /></div>
            ) : slots.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
                    <p className="text-slate-500 text-xl font-medium">No active availability found for this professor.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {slots.map(slot => (
                            <div key={slot.id} className="p-8 flex flex-col sm:flex-row justify-between items-center gap-6 hover:bg-slate-50 transition-colors">
                                <div>
                                    <p className="text-xl font-bold text-slate-900 mb-1">
                                        {new Date(slot.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </p>
                                    <p className="text-slate-600 font-medium text-lg">
                                        {new Date(slot.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - {new Date(slot.endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                    </p>
                                </div>
                                <button onClick={() => handleBookSlot(slot.id)} className="w-full sm:w-auto bg-mcgill-red hover:bg-mcgill-dark text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md hover:shadow-lg">
                                    <CalendarPlus className="h-5 w-5" /> Book Appointment
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}