import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Plus, Calendar, Users, Clock, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

export default function OwnerDashboard() {
    const { user } = useContext(AuthContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [slots, setSlots] = useState([]);
    
    // Form State
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Generate clean 12-hour AM/PM options but keep 24-hour values for the database
    const timeOptions = [];
    for (let i = 8; i <= 18; i++) {
        const hour24 = i.toString().padStart(2, '0');
        const hour12 = i === 12 ? 12 : i % 12;
        const ampm = i >= 12 ? 'PM' : 'AM';

        timeOptions.push({ label: `${hour12}:00 ${ampm}`, value: `${hour24}:00` });
        if (i !== 18) {
            timeOptions.push({ label: `${hour12}:30 ${ampm}`, value: `${hour24}:30` });
        }
    }

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        try {
            const response = await api.get('/slots/my-slots');
            setSlots(response.data);
        } catch (error) {
            console.error("Failed to fetch slots", error);
        }
    };

    const handleCreateSlot = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formattedStart = `${date}T${startTime}:00`;
            const formattedEnd = `${date}T${endTime}:00`;

            await api.post('/slots/create', {
                startTime: formattedStart,
                endTime: formattedEnd
            });

            setIsModalOpen(false);
            setDate('');
            setStartTime('');
            setEndTime('');
            fetchSlots();
        } catch (error) {
            alert("Failed to create slot. Check console.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Welcome, {user?.name}
                    </h1>
                    <p className="text-slate-600 mt-1 text-lg">
                        Manage your office hours and student appointments.
                    </p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-mcgill-red hover:bg-mcgill-dark text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow-md active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    Create Time Slot
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="bg-red-50 p-3 rounded-lg text-mcgill-red">
                        <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Active Slots</p>
                        <p className="text-2xl font-bold text-slate-900">{slots.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg text-slate-600">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Bookings</p>
                        <p className="text-2xl font-bold text-slate-900">0</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg text-slate-600">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Upcoming Today</p>
                        <p className="text-2xl font-bold text-slate-900">0</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">Your Schedule</h2>
                </div>
                
                {slots.length === 0 ? (
                    <div className="p-16 text-center">
                        <Calendar className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No time slots created yet</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">
                            Click the "Create Time Slot" button above to open your calendar to students.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {slots.map((slot) => (
                            <div key={slot.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div>
                                    <p className="font-semibold text-slate-900">
                                        {new Date(slot.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                    </p>
                                    <p className="text-slate-500 text-sm">
                                        {/* Explicitly force 12-hour AM/PM format */}
                                        {new Date(slot.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - 
                                        {new Date(slot.endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                    </p>
                                </div>
                                <div>
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                                        Available
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="text-xl font-bold text-slate-900">Add New Availability</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-mcgill-red hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleCreateSlot} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Date</label>
                                    <div className="relative">
                                        <input 
                                            type="date" 
                                            required 
                                            value={date} 
                                            onChange={(e) => setDate(e.target.value)} 
                                            className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-mcgill-red/20 focus:border-mcgill-red bg-white text-slate-800 transition-colors cursor-pointer" 
                                        />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Time</label>
                                        <div className="relative">
                                            <select 
                                                required 
                                                value={startTime} 
                                                onChange={(e) => setStartTime(e.target.value)} 
                                                className="w-full rounded-xl border border-slate-300 pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-mcgill-red/20 focus:border-mcgill-red bg-white text-slate-800 appearance-none cursor-pointer transition-colors"
                                            >
                                                <option value="" disabled>Select Time</option>
                                                {timeOptions.map(t => <option key={`start-${t.value}`} value={t.value}>{t.label}</option>)}
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                                                <Clock className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Time</label>
                                        <div className="relative">
                                            <select 
                                                required 
                                                value={endTime} 
                                                onChange={(e) => setEndTime(e.target.value)} 
                                                className="w-full rounded-xl border border-slate-300 pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-mcgill-red/20 focus:border-mcgill-red bg-white text-slate-800 appearance-none cursor-pointer transition-colors"
                                            >
                                                <option value="" disabled>Select Time</option>
                                                {timeOptions.map(t => <option key={`end-${t.value}`} value={t.value}>{t.label}</option>)}
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                                                <Clock className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <button type="submit" disabled={isLoading} className="w-full mt-6 bg-mcgill-red hover:bg-mcgill-dark text-white py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg active:scale-95 transition-all flex justify-center items-center">
                                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Time Slot'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}