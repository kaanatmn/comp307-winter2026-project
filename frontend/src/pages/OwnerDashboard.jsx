import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Plus, Calendar, Users, Clock, X, Loader2, Mail, Trash2, CheckCircle, EyeOff, Link2, Download, Inbox, Check, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

export default function OwnerDashboard() {
    const { user } = useContext(AuthContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [slots, setSlots] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const timeOptions = [];
    for (let i = 8; i <= 18; i++) {
        const hour24 = i.toString().padStart(2, '0');
        const hour12 = i === 12 ? 12 : i % 12;
        const ampm = i >= 12 ? 'PM' : 'AM';
        timeOptions.push({ label: `${hour12}:00 ${ampm}`, value: `${hour24}:00` });
        if (i !== 18) timeOptions.push({ label: `${hour12}:30 ${ampm}`, value: `${hour24}:30` });
    }

    useEffect(() => { 
        fetchSlots(); 
        fetchPendingRequests();
    }, []);

    const fetchSlots = async () => {
        try {
            const response = await api.get('/slots/my-slots');
            setSlots(response.data);
        } catch (error) { console.error("Failed to fetch slots", error); }
    };

    const fetchPendingRequests = async () => {
        try {
            const response = await api.get('/requests/pending');
            setPendingRequests(response.data);
        } catch (error) { console.error("Failed to fetch requests", error); }
    };

    const handleCreateSlot = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const formattedStart = `${date}T${startTime}:00`;
            const formattedEnd = `${date}T${endTime}:00`;
            await api.post('/slots/create', { startTime: formattedStart, endTime: formattedEnd });
            setIsModalOpen(false); setDate(''); setStartTime(''); setEndTime('');
            await fetchSlots();
        } catch (error) { alert(`Creation Failed: ${error.response?.data?.error || error.message}`); } 
        finally { setIsLoading(false); }
    };

    const handleActivate = async (id) => {
        try { await api.post(`/slots/${id}/activate`); await fetchSlots();
        } catch (error) { alert(`Activation Failed: ${error.response?.data?.error || error.message}`); }
    };

    const handleDeactivate = async (id) => {
        try { await api.post(`/slots/${id}/deactivate`); await fetchSlots();
        } catch (error) { alert(`Hide Failed: ${error.response?.data?.error || error.message}`); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this slot?")) return;
        try { await api.delete(`/slots/${id}/delete`); await fetchSlots();
        } catch (error) { alert(`Delete Failed: ${error.response?.data?.error || error.message}`); }
    };

    // NEW: Handle Pending Requests
    const handleApproveRequest = async (id) => {
        try {
            await api.post(`/requests/${id}/approve`);
            await fetchPendingRequests();
            await fetchSlots(); // Refresh to see the new officially booked slot!
        } catch (error) { alert(error.response?.data?.error || "Failed to approve."); }
    };

    const handleDeclineRequest = async (id) => {
        try {
            await api.post(`/requests/${id}/decline`);
            await fetchPendingRequests();
        } catch (error) { alert(error.response?.data?.error || "Failed to decline."); }
    };

    const handleCopyLink = () => {
        const link = `${window.location.origin}/book/${user.email}`;
        navigator.clipboard.writeText(link);
        alert("Invite link copied to clipboard! You can share this with your students.");
    };

    const exportToCalendar = (slot) => {
        const formatICSDate = (dateString) => {
            const d = new Date(dateString);
            return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };
        const start = formatICSDate(slot.startTime); const end = formatICSDate(slot.endTime);
        const title = `Student Meeting: ${slot.studentName}`;
        const icsContent = [
            'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//McBook SOCS App//EN',
            'BEGIN:VEVENT', `DTSTART:${start}`, `DTEND:${end}`, `SUMMARY:${title}`,
            `DESCRIPTION:McBook SOCS Appointment booked by ${slot.studentEmail}`, 'END:VEVENT', 'END:VCALENDAR'
        ].join('\n');
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a'); link.href = url;
        link.setAttribute('download', `meeting_${start}.ics`);
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    };

    const activeSlotsCount = slots.filter(s => s.isActive && !s.isBooked).length;
    const bookedSlotsCount = slots.filter(s => s.isBooked).length;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome, {user?.name}</h1>
                    <p className="text-slate-600 mt-1 text-lg">Manage your office hours and student appointments.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button onClick={handleCopyLink} className="bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-sm hover:shadow-md">
                        <Link2 className="h-5 w-5" /> Copy Invite Link
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="bg-mcgill-red hover:bg-mcgill-dark text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow-md active:scale-95">
                        <Plus className="h-5 w-5" /> Create Time Slot
                    </button>
                </div>
            </div>

            {/* NEW: Pending Requests Inbox */}
            {pendingRequests.length > 0 && (
                <div className="bg-amber-50 rounded-xl border border-amber-200 shadow-sm overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b border-amber-200 bg-amber-100/50 flex items-center gap-2">
                        <Inbox className="h-5 w-5 text-amber-700" />
                        <h2 className="text-lg font-bold text-amber-900">Pending Meeting Requests ({pendingRequests.length})</h2>
                    </div>
                    <div className="divide-y divide-amber-100">
                        {pendingRequests.map(req => (
                            <div key={req.id} className="p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-amber-50 hover:bg-amber-100/30 transition-colors">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-slate-900 text-lg">{req.studentName}</h3>
                                        <a href={`mailto:${req.studentEmail}`} className="text-sm text-amber-700 hover:underline">({req.studentEmail})</a>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-800 mb-2">
                                        Requested: {new Date(req.requestedTime).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at {new Date(req.requestedTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                    </p>
                                    <div className="bg-white px-4 py-3 rounded-lg border border-amber-200 text-sm text-slate-700 italic">
                                        "{req.message}"
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleApproveRequest(req.id)} className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors active:scale-95">
                                        <Check className="h-4 w-4" /> Approve
                                    </button>
                                    <button onClick={() => handleDeclineRequest(req.id)} className="flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors active:scale-95">
                                        <XCircle className="h-4 w-4" /> Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-red-100 transition-colors">
                    <div className="bg-red-50 p-3 rounded-lg text-mcgill-red"><Calendar className="h-6 w-6" /></div>
                    <div><p className="text-sm font-medium text-slate-500">Available Slots</p><p className="text-2xl font-bold text-slate-900">{activeSlotsCount}</p></div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-blue-100 transition-colors">
                    <div className="bg-blue-50 p-3 rounded-lg text-blue-600"><Users className="h-6 w-6" /></div>
                    <div><p className="text-sm font-medium text-slate-500">Total Bookings</p><p className="text-2xl font-bold text-slate-900">{bookedSlotsCount}</p></div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-slate-300 transition-colors">
                    <div className="bg-slate-50 p-3 rounded-lg text-slate-600"><Clock className="h-6 w-6" /></div>
                    <div><p className="text-sm font-medium text-slate-500">Total Created</p><p className="text-2xl font-bold text-slate-900">{slots.length}</p></div>
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
                        <p className="text-slate-500 max-w-sm mx-auto">Click "Create Time Slot" to open your calendar.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {slots.map((slot) => (
                            <div key={slot.id} className={`p-6 flex flex-col xl:flex-row xl:items-center justify-between hover:bg-slate-50 transition-colors gap-4 ${slot.isBooked ? 'bg-slate-50/50' : ''}`}>
                                <div>
                                    <p className="font-bold text-slate-900 text-lg">
                                        {new Date(slot.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                    </p>
                                    <p className="text-slate-600 font-medium">
                                        {new Date(slot.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - {new Date(slot.endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                    </p>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-3">
                                    {slot.isBooked ? (
                                        <div className="flex flex-wrap items-center gap-2 bg-white border border-blue-200 p-2 rounded-xl shadow-sm">
                                            <span className="text-sm font-bold text-blue-800 px-2 py-1 bg-blue-50 rounded-lg">Booked: {slot.studentName}</span>
                                            <button onClick={() => exportToCalendar(slot)} className="flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white px-3 py-2 rounded-lg transition-colors active:scale-95"><Download className="h-3.5 w-3.5" /> Export</button>
                                            <a href={`mailto:${slot.studentEmail}`} className="flex items-center gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors active:scale-95"><Mail className="h-3.5 w-3.5" /> Email</a>
                                        </div>
                                    ) : slot.isActive ? (
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-2 rounded-lg text-sm font-bold bg-green-50 text-green-700 border border-green-200 flex items-center gap-1.5"><CheckCircle className="h-4 w-4"/> Public</span>
                                            <button onClick={() => handleDeactivate(slot.id)} className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5 active:scale-95"><EyeOff className="h-4 w-4" /> Hide</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleActivate(slot.id)} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm active:scale-95">Activate Slot</button>
                                    )}
                                    
                                    <button onClick={() => handleDelete(slot.id)} className="text-slate-400 hover:text-white hover:bg-red-500 p-2.5 rounded-lg transition-all active:scale-95 border border-transparent hover:border-red-600"><Trash2 className="h-5 w-5" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
                            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="text-xl font-bold text-slate-900">Add New Availability</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-mcgill-red hover:bg-red-50 p-1.5 rounded-lg transition-colors"><X className="h-5 w-5" /></button>
                            </div>
                            <form onSubmit={handleCreateSlot} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Date</label>
                                    <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-mcgill-red/20 focus:border-mcgill-red bg-white text-slate-800 cursor-pointer" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Time</label>
                                        <select required value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-mcgill-red/20 focus:border-mcgill-red bg-white cursor-pointer">
                                            <option value="" disabled>Select Time</option>
                                            {timeOptions.map(t => <option key={`start-${t.value}`} value={t.value}>{t.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Time</label>
                                        <select required value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-mcgill-red/20 focus:border-mcgill-red bg-white cursor-pointer">
                                            <option value="" disabled>Select Time</option>
                                            {timeOptions.map(t => <option key={`end-${t.value}`} value={t.value}>{t.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full mt-6 bg-mcgill-red hover:bg-mcgill-dark text-white py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg active:scale-95 transition-all flex justify-center items-center">
                                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Private Slot'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}