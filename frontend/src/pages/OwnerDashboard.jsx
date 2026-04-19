import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Plus, Calendar, Users, Clock, X, Loader2, Mail, Trash2, CheckCircle, EyeOff, Link2, Download, Inbox, Check, XCircle, BarChart3, Users2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

export default function OwnerDashboard() {
    const { user } = useContext(AuthContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPollModalOpen, setIsPollModalOpen] = useState(false);
    const [slots, setSlots] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [myPolls, setMyPolls] = useState([]);
    
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [repeatWeeks, setRepeatWeeks] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const [pollTitle, setPollTitle] = useState('');
    const [pollOptions, setPollOptions] = useState([]);
    const [pollDate, setPollDate] = useState('');
    const [pollTime, setPollTime] = useState('');

    const timeOptions = [];
    for (let i = 8; i <= 18; i++) {
        const hour24 = i.toString().padStart(2, '0');
        const hour12 = i === 12 ? 12 : i % 12;
        const ampm = i >= 12 ? 'PM' : 'AM';
        timeOptions.push({ label: `${hour12}:00 ${ampm}`, value: `${hour24}:00` });
        if (i !== 18) timeOptions.push({ label: `${hour12}:30 ${ampm}`, value: `${hour24}:30` });
    }

    useEffect(() => { 
        fetchSlots(); fetchPendingRequests(); fetchMyPolls();
    }, []);

    const fetchSlots = async () => { try { const response = await api.get('/slots/my-slots'); setSlots(response.data); } catch (error) { console.error("Failed to fetch slots", error); } };
    const fetchPendingRequests = async () => { try { const response = await api.get('/requests/pending'); setPendingRequests(response.data); } catch (error) { console.error("Failed to fetch requests", error); } };
    const fetchMyPolls = async () => { try { const response = await api.get('/group/my-polls'); setMyPolls(response.data); } catch (error) { console.error("Failed to fetch polls", error); } };

    const handleCreateSlot = async (e) => {
        e.preventDefault(); setIsLoading(true);
        try {
            await api.post('/slots/create', { startTime: `${date}T${startTime}:00`, endTime: `${date}T${endTime}:00`, weeks: repeatWeeks.toString() });
            setIsModalOpen(false); setDate(''); setStartTime(''); setEndTime(''); setRepeatWeeks(1); await fetchSlots();
        } catch (error) { alert(`Creation Failed: ${error.response?.data?.error || error.message}`); } finally { setIsLoading(false); }
    };

    const handleActivate = async (id) => { try { await api.post(`/slots/${id}/activate`); await fetchSlots(); } catch (error) { alert(`Activation Failed: ${error.response?.data?.error || error.message}`); } };
    const handleDeactivate = async (id) => { try { await api.post(`/slots/${id}/deactivate`); await fetchSlots(); } catch (error) { alert(`Hide Failed: ${error.response?.data?.error || error.message}`); } };
    
    const handleDelete = async (slotId, isBooked, studentEmail, studentName, startTimeStr) => {
        if (!window.confirm("Are you sure you want to delete this slot?")) return;
        try { 
            await api.delete(`/slots/${slotId}/delete`); 
            if (isBooked && studentEmail) {
                const subject = encodeURIComponent(`Appointment Cancelled`);
                const body = encodeURIComponent(`Hello ${studentName},\n\nI have cancelled our appointment scheduled for ${new Date(startTimeStr).toLocaleString()}.\n\nBest,\n${user.name}`);
                window.location.href = `mailto:${studentEmail}?subject=${subject}&body=${body}`;
            }
            await fetchSlots(); 
        } catch (error) { alert(`Delete Failed: ${error.response?.data?.error || error.message}`); }
    };

    const handleApproveRequest = async (req) => {
        try {
            await api.post(`/requests/${req.id}/approve`);
            await fetchPendingRequests(); 
            await fetchSlots(); 
            const subject = encodeURIComponent(`Meeting Request Approved`);
            const body = encodeURIComponent(`Hello ${req.studentName},\n\nI have approved your meeting request for ${new Date(req.requestedTime).toLocaleString()}.\n\nIt is now in your Student Dashboard.\n\nBest,\n${user.name}`);
            window.location.href = `mailto:${req.studentEmail}?subject=${subject}&body=${body}`;
        } catch (error) { alert(error.response?.data?.error || "Failed to approve."); }
    };

    const handleDeclineRequest = async (req) => {
        try {
            await api.post(`/requests/${req.id}/decline`);
            await fetchPendingRequests(); 
            const subject = encodeURIComponent(`Meeting Request Declined`);
            const body = encodeURIComponent(`Hello ${req.studentName},\n\nUnfortunately, I must decline your meeting request for ${new Date(req.requestedTime).toLocaleString()}.\n\nPlease check my availability for other times.\n\nBest,\n${user.name}`);
            window.location.href = `mailto:${req.studentEmail}?subject=${subject}&body=${body}`;
        } catch (error) { alert(error.response?.data?.error || "Failed to decline."); }
    };

    const handleAddPollOption = () => {
        if (!pollDate || !pollTime) return alert("Select a date and time to add.");
        const newOption = `${pollDate}T${pollTime}:00`;
        if (pollOptions.includes(newOption)) return alert("Option already added.");
        setPollOptions([...pollOptions, newOption]); setPollTime('');
    };

    const handleCreatePoll = async (e) => {
        e.preventDefault();
        if (pollOptions.length < 2) return alert("You must provide at least 2 time options for a poll.");
        setIsLoading(true);
        try {
            await api.post('/group/create', { title: pollTitle, startTimes: pollOptions });
            setIsPollModalOpen(false); setPollTitle(''); setPollOptions([]); setPollDate(''); setPollTime('');
            await fetchMyPolls(); alert("Group Poll Created successfully!");
        } catch (error) { alert(error.response?.data?.error || "Failed to create poll."); } finally { setIsLoading(false); }
    };

    const handleFinalizePoll = async (poll, option) => {
        const weeksStr = window.prompt(`Are you sure you want to finalize this poll for ${new Date(option.startTime).toLocaleString()}?\n\nHow many consecutive weeks should this group meeting repeat? (Enter 1 for a one-time event)`, "1");
        if (weeksStr === null) return; 
        const weeks = parseInt(weeksStr, 10) || 1;

        try {
            await api.post(`/group/finalize/${poll.id}/${option.id}?weeks=${weeks}`);
            await fetchMyPolls(); 
            await fetchSlots(); 
            alert("Poll Finalized! The shared meeting slots have been generated in your schedule.");
        } catch (error) { alert(error.response?.data?.error || "Failed to finalize poll."); }
    };

    const handleCopyLink = () => {
        const link = `${window.location.origin}/book/${user.email}`;
        navigator.clipboard.writeText(link);
        alert("Invite link copied to clipboard! You can share this with your students.");
    };

    const exportToCalendar = (slot) => {
        const formatICSDate = (dateString) => new Date(dateString).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const start = formatICSDate(slot.startTime); const end = formatICSDate(slot.endTime);
        const title = slot.isGrouped ? `Group Session: ${slot.title}` : `Student Meeting: ${slot.studentName}`;
        const icsContent = [
            'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//McBook SOCS App//EN',
            'BEGIN:VEVENT', `DTSTART:${start}`, `DTEND:${end}`, `SUMMARY:${title}`,
            `DESCRIPTION:McBook SOCS Appointment`, 'END:VEVENT', 'END:VCALENDAR'
        ].join('\n');
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a'); link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', `meeting_${start}.ics`); document.body.appendChild(link); link.click(); document.body.removeChild(link);
    };

    const handleCancelGroupSession = async (slotId, title) => {
        if (!window.confirm(`Are you sure you want to cancel the entire group session "${title}"? This will remove all participants.`)) return;
        try {
            await api.delete(`/slots/${slotId}/delete`);
            await fetchSlots(); 
        } catch (error) {
            console.error("Error canceling session:", error);
            alert("Failed to cancel the session.");
        }
    };

    const activeSlotsCount = slots.filter(s => s.isActive && !s.isBooked).length;
    const bookedSlotsCount = slots.filter(s => s.isBooked).length;

    const groupedSchedule = slots.reduce((acc, slot) => {
        if (slot.type === 'GROUP') {
            const key = `group_${slot.title}_${slot.startTime}`;
            if (!acc[key]) acc[key] = { ...slot, isGrouped: true, attendees: [] };
            if (slot.isBooked) acc[key].attendees.push({ name: slot.studentName, email: slot.studentEmail, slotId: slot.id });
            return acc;
        } else {
            acc[`solo_${slot.id}`] = { ...slot, isGrouped: false };
            return acc;
        }
    }, {});

    const displaySlots = Object.values(groupedSchedule).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome, {user?.name}</h1>
                    <p className="text-slate-600 mt-1 text-lg">Manage your office hours, requests, and group polls.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button onClick={handleCopyLink} className="bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-sm hover:shadow-md"><Link2 className="h-5 w-5" /> Invite Link</button>
                    <button onClick={() => setIsPollModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow-md active:scale-95"><Users2 className="h-5 w-5" /> Group Poll</button>
                    <button onClick={() => setIsModalOpen(true)} className="bg-mcgill-red hover:bg-mcgill-dark text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow-md active:scale-95"><Plus className="h-5 w-5" /> 1-on-1 Slot</button>
                </div>
            </div>

            {pendingRequests.length > 0 && (
                <div className="bg-amber-50 rounded-xl border border-amber-200 shadow-sm overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b border-amber-200 bg-amber-100/50 flex items-center gap-2"><Inbox className="h-5 w-5 text-amber-700" /><h2 className="text-lg font-bold text-amber-900">Pending Meeting Requests ({pendingRequests.length})</h2></div>
                    <div className="divide-y divide-amber-100">
                        {pendingRequests.map(req => (
                            <div key={req.id} className="p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-amber-50 hover:bg-amber-100/30 transition-colors">
                                <div><div className="flex items-center gap-2 mb-1"><h3 className="font-bold text-slate-900 text-lg">{req.studentName}</h3><a href={`mailto:${req.studentEmail}`} className="text-sm text-amber-700 hover:underline">({req.studentEmail})</a></div><p className="text-sm font-semibold text-slate-800 mb-2">Requested: {new Date(req.requestedTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p><div className="bg-white px-4 py-3 rounded-lg border border-amber-200 text-sm text-slate-700 italic">"{req.message}"</div></div>
                                <div className="flex gap-2"><button onClick={() => handleApproveRequest(req)} className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors active:scale-95"><Check className="h-4 w-4" /> Approve</button><button onClick={() => handleDeclineRequest(req)} className="flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors active:scale-95"><XCircle className="h-4 w-4" /> Decline</button></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {myPolls.filter(p => p.active).length > 0 && (
                <div className="bg-blue-50 rounded-xl border border-blue-200 shadow-sm overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b border-blue-200 bg-blue-100/50 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-blue-700" /><h2 className="text-lg font-bold text-blue-900">Active Group Polls</h2></div>
                    <div className="divide-y divide-blue-100 p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50">
                        {myPolls.filter(p => p.active).map(poll => (
                            <div key={poll.id} className="bg-white border border-blue-200 rounded-xl p-5 shadow-sm">
                                <h3 className="font-bold text-slate-900 text-lg mb-3">{poll.title}</h3>
                                <div className="space-y-3">
                                    {poll.options.map(opt => (
                                        <div key={opt.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                                            <div><p className="font-semibold text-slate-800 text-sm">{new Date(opt.startTime).toLocaleDateString()}</p><p className="text-slate-500 text-xs">{new Date(opt.startTime).toLocaleTimeString([], {timeStyle: 'short'})}</p></div>
                                            <div className="flex items-center gap-4"><div className="text-center"><span className="block text-xl font-black text-blue-600 leading-none">{opt.votes}</span><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Votes</span></div><button onClick={() => handleFinalizePoll(poll, opt)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-colors active:scale-95">Finalize</button></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-red-100 transition-colors"><div className="bg-red-50 p-3 rounded-lg text-mcgill-red"><Calendar className="h-6 w-6" /></div><div><p className="text-sm font-medium text-slate-500">Available Slots</p><p className="text-2xl font-bold text-slate-900">{activeSlotsCount}</p></div></div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-blue-100 transition-colors"><div className="bg-blue-50 p-3 rounded-lg text-blue-600"><Users className="h-6 w-6" /></div><div><p className="text-sm font-medium text-slate-500">Total Bookings</p><p className="text-2xl font-bold text-slate-900">{bookedSlotsCount}</p></div></div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-slate-300 transition-colors"><div className="bg-slate-50 p-3 rounded-lg text-slate-600"><Clock className="h-6 w-6" /></div><div><p className="text-sm font-medium text-slate-500">Total Created</p><p className="text-2xl font-bold text-slate-900">{slots.length}</p></div></div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center"><h2 className="text-lg font-bold text-slate-800">Your Schedule (1-on-1 & Finalized Groups)</h2></div>
                {displaySlots.length === 0 ? (
                    <div className="p-16 text-center"><Calendar className="h-16 w-16 mx-auto text-slate-300 mb-4" /><h3 className="text-xl font-semibold text-slate-900 mb-2">No time slots created yet</h3></div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {displaySlots.map((item) => (
                            <div key={item.isGrouped ? `grp_${item.id}` : item.id} className={`p-6 flex flex-col xl:flex-row xl:items-center justify-between hover:bg-slate-50 transition-colors gap-4 ${item.isBooked || item.isGrouped ? 'bg-slate-50/50' : ''} ${item.isGrouped ? '!border-l-4 !border-l-purple-500' : ''}`}>
                                <div>
                                    {item.isGrouped && <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-xs font-black uppercase tracking-wider rounded-md mb-2 inline-block shadow-sm">Group Session</span>}
                                    <p className={`font-bold text-slate-900 ${item.isGrouped ? 'text-xl' : 'text-lg'}`}>{item.isGrouped ? item.title : new Date(item.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                                    <p className="text-slate-600 font-medium">{item.isGrouped && `${new Date(item.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • `}{new Date(item.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - {new Date(item.endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-3">
                                    {item.isGrouped ? (
                                        <div className="flex flex-col gap-3 bg-white border border-purple-200 p-4 rounded-xl shadow-sm w-full xl:w-auto">
                                            <div className="flex items-center justify-between gap-6 border-b border-purple-100 pb-2">
                                                <span className="text-sm font-bold text-purple-800">Attendees ({item.attendees.length})</span>
                                                <div className="flex gap-2">
                                                    <button onClick={() => exportToCalendar(item)} className="flex items-center gap-1.5 text-xs font-bold bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-1.5 rounded-lg transition-colors active:scale-95"><Download className="h-3.5 w-3.5" /> Export</button>
                                                    <button onClick={() => handleCancelGroupSession(item.id, item.title)} className="flex items-center gap-1.5 text-xs font-bold bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1.5 rounded-lg transition-colors active:scale-95"><Trash2 className="h-3.5 w-3.5" /> Cancel Entire Session</button>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {item.attendees.length > 0 ? item.attendees.map(student => (
                                                    <div key={student.slotId} className="flex items-center gap-1.5 bg-purple-50 px-2.5 py-1.5 rounded-lg border border-purple-100">
                                                        <span className="text-xs font-semibold text-purple-900">{student.name}</span>
                                                        <div className="flex items-center gap-1 ml-1 pl-2 border-l border-purple-200">
                                                            <a href={`mailto:${student.email}`} className="text-purple-500 hover:text-purple-700 p-0.5" title="Email Student"><Mail className="h-3.5 w-3.5" /></a>
                                                            <button onClick={() => handleDelete(student.slotId, true, student.email, student.name, item.startTime)} className="text-red-400 hover:text-red-600 p-0.5" title="Remove from Group"><X className="h-3.5 w-3.5" /></button>
                                                        </div>
                                                    </div>
                                                )) : <span className="text-xs text-slate-400 italic">No attendees yet</span>}
                                            </div>
                                        </div>
                                    ) : item.isBooked ? (
                                        <div className="flex flex-wrap items-center gap-2 bg-white border border-blue-200 p-2 rounded-xl shadow-sm">
                                            <span className="text-sm font-bold text-blue-800 px-2 py-1 bg-blue-50 rounded-lg">Booked: {item.studentName}</span>
                                            <button onClick={() => exportToCalendar(item)} className="flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white px-3 py-2 rounded-lg transition-colors active:scale-95"><Download className="h-3.5 w-3.5" /> Export</button>
                                            <a href={`mailto:${item.studentEmail}`} className="flex items-center gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors active:scale-95"><Mail className="h-3.5 w-3.5" /> Email</a>
                                            <button onClick={() => handleDelete(item.id, true, item.studentEmail, item.studentName, item.startTime)} className="text-slate-400 hover:text-white hover:bg-red-500 p-2 rounded-lg transition-all active:scale-95 border border-transparent hover:border-red-600"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    ) : item.isActive ? (
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-2 rounded-lg text-sm font-bold bg-green-50 text-green-700 border border-green-200 flex items-center gap-1.5"><CheckCircle className="h-4 w-4"/> Public</span>
                                            <button onClick={() => handleDeactivate(item.id)} className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5 active:scale-95"><EyeOff className="h-4 w-4" /> Hide</button>
                                            <button onClick={() => handleDelete(item.id, false, null, null, null)} className="text-slate-400 hover:text-white hover:bg-red-500 p-2.5 rounded-lg transition-all active:scale-95 border border-transparent hover:border-red-600"><Trash2 className="h-5 w-5" /></button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleActivate(item.id)} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm active:scale-95">Activate Slot</button>
                                            <button onClick={() => handleDelete(item.id, false, null, null, null)} className="text-slate-400 hover:text-white hover:bg-red-500 p-2.5 rounded-lg transition-all active:scale-95 border border-transparent hover:border-red-600"><Trash2 className="h-5 w-5" /></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
                            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50"><h3 className="text-xl font-bold text-slate-900">Add 1-on-1 Availability</h3><button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-mcgill-red hover:bg-red-50 p-1.5 rounded-lg transition-colors"><X className="h-5 w-5" /></button></div>
                            <form onSubmit={handleCreateSlot} className="p-6 space-y-5">
                                <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Date</label><input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-mcgill-red/20 focus:border-mcgill-red bg-white" /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Time</label><select required value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-mcgill-red/20 focus:border-mcgill-red bg-white"><option value="" disabled>Select Time</option>{timeOptions.map(t => <option key={`s-${t.value}`} value={t.value}>{t.label}</option>)}</select></div>
                                    <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">End Time</label><select required value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-mcgill-red/20 focus:border-mcgill-red bg-white"><option value="" disabled>Select Time</option>{timeOptions.map(t => <option key={`e-${t.value}`} value={t.value}>{t.label}</option>)}</select></div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Repeat for (Weeks)</label>
                                    <input type="number" min="1" max="15" required value={repeatWeeks} onChange={(e) => setRepeatWeeks(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-mcgill-red/20 focus:border-mcgill-red bg-white" />
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full mt-6 bg-mcgill-red hover:bg-mcgill-dark text-white py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg active:scale-95 transition-all flex justify-center items-center">{isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Private Slot'}</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isPollModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
                            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50"><h3 className="text-xl font-bold text-slate-900">Create Group Poll</h3><button onClick={() => setIsPollModalOpen(false)} className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"><X className="h-5 w-5" /></button></div>
                            <form onSubmit={handleCreatePoll} className="p-6 space-y-5">
                                <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Poll Topic / Title</label><input type="text" required value={pollTitle} onChange={(e) => setPollTitle(e.target.value)} placeholder="e.g., Final Exam Review Session" className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-white" /></div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Add Time Options (Min 2)</label>
                                    <div className="flex gap-2 mb-3">
                                        <input type="date" value={pollDate} onChange={(e) => setPollDate(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600" />
                                        <select value={pollTime} onChange={(e) => setPollTime(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-white"><option value="" disabled>Time</option>{timeOptions.map(t => <option key={`p-${t.value}`} value={t.value}>{t.label}</option>)}</select>
                                        <button type="button" onClick={handleAddPollOption} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold active:scale-95">Add</button>
                                    </div>
                                    {pollOptions.length > 0 && (
                                        <div className="space-y-2 mt-4 max-h-32 overflow-y-auto">
                                            {pollOptions.map((opt, i) => (
                                                <div key={i} className="flex justify-between items-center bg-white px-3 py-2 rounded border border-slate-200 text-sm font-medium text-slate-700">
                                                    <span>{new Date(opt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                                    <button type="button" onClick={() => setPollOptions(pollOptions.filter(o => o !== opt))} className="text-red-500 hover:text-red-700"><X className="h-4 w-4" /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg active:scale-95 transition-all flex justify-center items-center">{isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Launch Poll'}</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}