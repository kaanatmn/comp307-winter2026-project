import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Search, User, Clock, Loader2, CalendarPlus, Mail, XCircle, Download, MessageSquare, X, BarChart3, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

export default function StudentDashboard() {
    const { user } = useContext(AuthContext);
    const [professors, setProfessors] = useState({});
    const [myAppointments, setMyAppointments] = useState([]);
    const [activePolls, setActivePolls] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [requestModal, setRequestModal] = useState({ isOpen: false, profEmail: '', profName: '' });
    const [reqDate, setReqDate] = useState('');
    const [reqTime, setReqTime] = useState('');
    const [reqMessage, setReqMessage] = useState('');

    const timeOptions = [];
    for (let i = 8; i <= 18; i++) {
        const hour24 = i.toString().padStart(2, '0');
        const hour12 = i === 12 ? 12 : i % 12;
        const ampm = i >= 12 ? 'PM' : 'AM';
        timeOptions.push({ label: `${hour12}:00 ${ampm}`, value: `${hour24}:00` });
        if (i !== 18) timeOptions.push({ label: `${hour12}:30 ${ampm}`, value: `${hour24}:30` });
    }

    useEffect(() => { fetchAllData(); }, []);

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const [directoryRes, appointmentsRes, pollsRes] = await Promise.all([
                api.get('/slots/available'),
                api.get('/slots/my-appointments'),
                api.get('/group/active')
            ]);
            
            const grouped = directoryRes.data.reduce((acc, slot) => {
                if (!acc[slot.profEmail]) acc[slot.profEmail] = { name: slot.profName, email: slot.profEmail, slots: [] };
                acc[slot.profEmail].slots.push(slot);
                return acc;
            }, {});

            setProfessors(grouped); setMyAppointments(appointmentsRes.data); setActivePolls(pollsRes.data);
        } catch (error) { console.error("Failed to fetch data", error); } 
        finally { setIsLoading(false); }
    };

    const handleBookSlot = async (slotId) => { try { await api.post(`/slots/${slotId}/book`); fetchAllData(); } catch (error) { alert("Failed to book slot."); } };
    
    // NEW: Triggers an email to the professor if the student cancels a booked slot!
    const handleCancelSlot = async (app) => {
        if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
        try { 
            await api.post(`/slots/${app.id}/cancel`); 
            const subject = encodeURIComponent(`Appointment Cancelled`);
            const body = encodeURIComponent(`Hello ${app.profName},\n\nI am cancelling my appointment with you scheduled for ${new Date(app.startTime).toLocaleString()}.\n\nBest,\n${user.name}`);
            window.location.href = `mailto:${app.profEmail}?subject=${subject}&body=${body}`;
            fetchAllData(); 
        } catch (error) { alert("Failed to cancel slot."); }
    };

    const handleSendRequest = async (e) => {
        e.preventDefault();
        try {
            await api.post('/requests/create', { ownerEmail: requestModal.profEmail, requestedTime: `${reqDate}T${reqTime}:00`, message: reqMessage });
            const subject = encodeURIComponent(`Meeting Request from ${user.name}`);
            const body = encodeURIComponent(`Hello ${requestModal.profName},\n\nI have requested a custom meeting time on ${reqDate} at ${reqTime}.\n\nReason: ${reqMessage}\n\nPlease check your McBook dashboard to approve or decline.\n\nThanks,\n${user.name}`);
            window.location.href = `mailto:${requestModal.profEmail}?subject=${subject}&body=${body}`;
            setRequestModal({ isOpen: false, profEmail: '', profName: '' }); setReqDate(''); setReqTime(''); setReqMessage('');
        } catch (error) { alert(error.response?.data?.error || "Failed to send request."); }
    };

    const handleVote = async (optionId) => {
        try { await api.post(`/group/vote/${optionId}`); alert("Your vote has been recorded!"); fetchAllData(); } 
        catch (error) { alert("Failed to vote."); }
    };

    const exportToCalendar = (slot) => {
        const formatICSDate = (dateString) => new Date(dateString).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const start = formatICSDate(slot.startTime); const end = formatICSDate(slot.endTime);
        const title = slot.type === 'GROUP' ? slot.title : `Office Hours with ${slot.profName}`;
        const icsContent = [
            'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//McBook SOCS App//EN',
            'BEGIN:VEVENT', `DTSTART:${start}`, `DTEND:${end}`, `SUMMARY:${title}`,
            `DESCRIPTION:McBook SOCS Appointment via ${slot.profEmail}`, 'END:VEVENT', 'END:VCALENDAR'
        ].join('\n');
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a'); link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', `appointment_${start}.ics`); document.body.appendChild(link); link.click(); document.body.removeChild(link);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8"><h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome, {user?.name}</h1><p className="text-slate-600 mt-1 text-lg">Browse available office hours, polls, and manage appointments.</p></div>

            {activePolls.length > 0 && (
                <div className="bg-blue-50 rounded-xl border border-blue-200 shadow-sm overflow-hidden mb-10">
                    <div className="px-6 py-4 border-b border-blue-200 bg-blue-100/50 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-blue-700" /><h2 className="text-lg font-bold text-blue-900">Group Meeting Polls</h2></div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activePolls.map(poll => (
                            <div key={poll.id} className="bg-white border border-blue-200 rounded-xl p-5 shadow-sm">
                                <h3 className="font-bold text-slate-900 text-lg mb-1">{poll.title}</h3>
                                <p className="text-sm text-slate-500 mb-4">Hosted by: {poll.profName}</p>
                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vote for times you can attend:</p>
                                    {poll.options.map(opt => (
                                        <div key={opt.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
                                            <div><p className="font-semibold text-slate-800 text-sm">{new Date(opt.startTime).toLocaleDateString()}</p><p className="text-slate-500 text-xs">{new Date(opt.startTime).toLocaleTimeString([], {timeStyle: 'short'})}</p></div>
                                            <button onClick={() => handleVote(opt.id)} className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-colors active:scale-95 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Vote</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-10">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50"><h2 className="text-lg font-bold text-slate-800">My Upcoming Appointments</h2></div>
                <div className="p-6">
                    {myAppointments.length === 0 ? (
                        <p className="text-slate-500 text-center py-4">You have no upcoming appointments.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {myAppointments.map(app => (
                                <div key={app.id} className={`border rounded-xl p-4 flex flex-col xl:flex-row justify-between xl:items-center gap-4 transition-colors ${app.type === 'GROUP' ? 'bg-purple-50 hover:bg-purple-100/50 border-purple-200' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}`}>
                                    <div>
                                        {app.type === 'GROUP' && <span className="px-2 py-0.5 bg-purple-200 text-purple-800 text-[10px] font-black uppercase tracking-wider rounded mb-1.5 inline-block">Group Session</span>}
                                        <h3 className="font-bold text-slate-900 text-lg">{app.type === 'GROUP' ? app.title : `Meeting with ${app.profName}`}</h3>
                                        <p className="text-sm font-medium text-slate-700 mt-1">{app.type === 'GROUP' && `Host: ${app.profName} • `}{new Date(app.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                                        <p className="text-sm text-slate-500">{new Date(app.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - {new Date(app.endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button onClick={() => exportToCalendar(app)} className="flex items-center gap-1.5 bg-mcgill-red text-white hover:bg-mcgill-dark px-3 py-2 rounded-lg text-sm font-semibold transition-colors active:scale-95 shadow-sm"><Download className="h-4 w-4" /> Export</button>
                                        <a href={`mailto:${app.profEmail}`} className="flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"><Mail className="h-4 w-4" /> Email</a>
                                        <button onClick={() => handleCancelSlot(app)} className="flex items-center gap-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm active:scale-95"><XCircle className="h-4 w-4" /> Cancel</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center gap-2"><Search className="h-5 w-5 text-mcgill-red" /><h2 className="text-xl font-bold text-slate-800">Available Office Hours</h2></div>
                <div className="p-6">
                    {isLoading ? ( <div className="flex justify-center py-12"><Loader2 className="h-10 w-10 text-mcgill-red animate-spin" /></div>
                    ) : Object.keys(professors).length === 0 ? ( <div className="text-center py-12"><Clock className="h-16 w-16 mx-auto text-slate-300 mb-4" /><h3 className="text-xl font-semibold text-slate-900 mb-2">No availability right now</h3></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.values(professors).map((prof) => (
                                <div key={prof.email} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4"><div className="h-12 w-12 bg-red-50 text-mcgill-red rounded-full flex items-center justify-center"><User className="h-6 w-6" /></div><div><h3 className="font-bold text-slate-900 leading-tight">{prof.name}</h3><a href={`mailto:${prof.email}`} className="text-sm text-mcgill-red hover:underline">{prof.email}</a></div></div>
                                    <button onClick={() => setRequestModal({ isOpen: true, profEmail: prof.email, profName: prof.name })} className="w-full mb-4 bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"><MessageSquare className="h-4 w-4" /> Request Custom Time</button>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Available Times</h4>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                        {prof.slots.map(slot => (
                                            <div key={slot.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 hover:border-mcgill-red/30 transition-colors">
                                                <div><p className="text-sm font-semibold text-slate-800">{new Date(slot.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p><p className="text-xs text-slate-500">{new Date(slot.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p></div>
                                                <button onClick={() => handleBookSlot(slot.id)} className="bg-white text-mcgill-red border border-red-200 hover:bg-mcgill-red hover:text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 active:scale-95"><CalendarPlus className="h-4 w-4" /> Book</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {requestModal.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
                            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50"><h3 className="text-xl font-bold text-slate-900">Request Meeting</h3><button onClick={() => setRequestModal({ isOpen: false, profEmail: '', profName: '' })} className="text-slate-400 hover:text-mcgill-red hover:bg-red-50 p-1.5 rounded-lg transition-colors"><X className="h-5 w-5" /></button></div>
                            <form onSubmit={handleSendRequest} className="p-6 space-y-4">
                                <p className="text-sm text-slate-600 mb-4">Propose a custom time to meet with <b>{requestModal.profName}</b>.</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Date</label><input type="date" required value={reqDate} onChange={(e) => setReqDate(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mcgill-red/20 focus:border-mcgill-red" /></div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Time</label><select required value={reqTime} onChange={(e) => setReqTime(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mcgill-red/20 focus:border-mcgill-red bg-white"><option value="" disabled>Select Time</option>{timeOptions.map(t => <option key={`req-${t.value}`} value={t.value}>{t.label}</option>)}</select></div>
                                </div>
                                <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Message (Reason for meeting)</label><textarea required rows="3" value={reqMessage} onChange={(e) => setReqMessage(e.target.value)} placeholder="I need help with Assignment 3..." className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-mcgill-red/20 focus:border-mcgill-red resize-none"></textarea></div>
                                <button type="submit" className="w-full bg-mcgill-red hover:bg-mcgill-dark text-white py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg active:scale-95 transition-all">Send Request</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}