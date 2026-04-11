import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Search } from 'lucide-react';

export default function StudentDashboard() {
    const { user } = useContext(AuthContext);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Welcome, {user?.name}
            </h1>
            <p className="text-slate-600 mt-1 text-lg mb-8">
                Find your professors and book appointments.
            </p>

            <div className="bg-white p-12 rounded-xl border border-slate-200 shadow-sm text-center">
                <Search className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Booking Directory</h3>
                <p className="text-slate-500">
                    The professor search and booking interface will appear here.
                </p>
            </div>
        </div>
    );
}