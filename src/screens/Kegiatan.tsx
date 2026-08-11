import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { useAuth } from '@/contexts/AuthContext';
import { KegiatanEvent } from '@/types';
import { Calendar as CalendarIcon, List, Plus, X, Loader2, MapPin, Clock, Edit2, Trash2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, isToday } from 'date-fns';
import { id } from 'date-fns/locale';

export function Kegiatan({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { token, appUser } = useAuth();
  const [listEvents, setListEvents] = useState<KegiatanEvent[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<KegiatanEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showHistory, setShowHistory] = useState(false);
  const limit = 10;
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ title: '', description: '', date: '' });
  
  const [selectedEventDetail, setSelectedEventDetail] = useState<KegiatanEvent | null>(null);
  
  const [editingEvent, setEditingEvent] = useState<KegiatanEvent | null>(null);
  const [deleteEventId, setDeleteEventId] = useState<number | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCalendarEvents = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/events?all=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCalendarEvents(data);
      }
    } catch (error) {
      console.error("Failed to fetch calendar events", error);
    }
  };

  const fetchListEvents = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        search: searchQuery,
        history: showHistory.toString()
      });
      
      const res = await fetch(`/api/events?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setListEvents(data.data);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch list events", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = () => {
    fetchCalendarEvents();
    fetchListEvents();
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchListEvents();
    }, 300);
    return () => clearTimeout(timer);
  }, [token, currentPage, searchQuery, showHistory]);

  const handleAddEvent = async (e: any) => {
    e.preventDefault();
    if (!token) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addForm)
      });
      
      if (res.ok) {
        setShowAddForm(false);
        setAddForm({ title: '', description: '', date: '' });
        fetchAllData();
      } else {
        alert("Gagal menambahkan kegiatan");
      }
    } catch (error) {
      console.error('Failed to add event', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEvent = async (e: any) => {
    e.preventDefault();
    if (!token || !editingEvent) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editingEvent.title,
          description: editingEvent.description,
          date: editingEvent.date
        })
      });
      
      if (res.ok) {
        setEditingEvent(null);
        fetchAllData();
      } else {
        alert("Gagal mengubah kegiatan");
      }
    } catch (error) {
      console.error('Failed to edit event', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!token || !deleteEventId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/events/${deleteEventId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        setDeleteEventId(null);
        fetchAllData();
      } else {
        alert("Gagal menghapus kegiatan");
      }
    } catch (error) {
      console.error('Failed to delete event', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  };

  const days = getDaysInMonth(currentDate);

  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter(event => isSameDay(parseISO(event.date), date));
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const getEventStatusStyle = (eventDate: string) => {
    const date = parseISO(eventDate);
    const now = new Date();
    date.setHours(0, 0, 0, 0);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (date < today) {
      return "bg-gray-50 border-gray-200"; // past
    } else if (date.getTime() === today.getTime()) {
      return "bg-orange-50 border-orange-200"; // today
    } else {
      return "bg-blue-50 border-blue-200"; // future
    }
  };

  return (
    <>
      <Header title="Kegiatan" onNavigate={onNavigate as any} />
      <main className="px-6 pt-2 pb-8 flex-1 flex flex-col overflow-hidden relative">
        
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <div>
            <h1 className="text-[28px] font-bold text-pkk-text-main tracking-tight">Kegiatan Komunitas</h1>
            <p className="text-[15px] text-pkk-text-muted">Jadwal dan aktivitas Kerukunan</p>
          </div>
          <div className="flex gap-2">
            <div className="bg-gray-100 p-1 rounded-xl flex">
              <button 
                onClick={() => setView('list')}
                className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-white shadow-sm text-pkk-primary' : 'text-gray-500'}`}
              >
                <List size={20} />
              </button>
              <button 
                onClick={() => setView('calendar')}
                className={`p-2 rounded-lg transition-colors ${view === 'calendar' ? 'bg-white shadow-sm text-pkk-primary' : 'text-gray-500'}`}
              >
                <CalendarIcon size={20} />
              </button>
            </div>
          </div>
        </div>

        {appUser?.role === 'super_admin' && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="mb-6 w-full bg-pkk-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-pkk-primary/90 transition-colors"
          >
            <Plus size={20} />
            Tambah Kegiatan Baru
          </button>
        )}

        {/* Search & Filters */}
        <div className="flex flex-col gap-3 mb-6 flex-shrink-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-pkk-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Cari kegiatan berdasarkan nama..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-pkk-surface border border-pkk-border rounded-2xl py-3.5 pl-12 pr-4 text-[15px] text-pkk-text-main placeholder:text-pkk-text-muted focus:outline-none focus:border-pkk-primary focus:ring-1 focus:ring-pkk-primary transition-all shadow-sm"
            />
          </div>
          
          {view === 'list' && (
            <div className="flex justify-end">
              <button 
                onClick={() => {
                  setShowHistory(!showHistory);
                  setCurrentPage(1);
                }}
                className={`text-[13px] font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${showHistory ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <Clock size={14} />
                {showHistory ? 'Sembunyikan Riwayat Lama' : 'Tampilkan Seluruh Riwayat'}
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pb-4">
          {loading ? (
            <div className="flex justify-center py-10 text-pkk-primary">
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : view === 'list' ? (
            <div className="space-y-4">
              {listEvents.length === 0 ? (
                <div className="text-center py-10 text-pkk-text-muted">
                  Belum ada kegiatan yang dijadwalkan.
                </div>
              ) : (
                listEvents.map(event => (
                  <Card 
                    key={event.id} 
                    className={`p-4 border rounded-xl shadow-sm group cursor-pointer hover:shadow-md transition-all ${getEventStatusStyle(event.date)}`}
                    onClick={() => setSelectedEventDetail(event)}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 w-full overflow-hidden">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-lg text-pkk-text-main leading-tight truncate w-full">{event.title}</h3>
                        </div>
                        <div className="inline-flex items-center text-xs font-semibold bg-white/60 text-gray-700 px-2.5 py-1 rounded-md mb-2 shadow-sm border border-black/5">
                          <CalendarIcon size={12} className="mr-1.5" />
                          {format(parseISO(event.date), 'dd MMM yyyy, HH:mm', { locale: id })}
                        </div>
                        {event.description && <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>}
                      </div>
                    </div>
                  </Card>
                ))
              )}

              {totalPages > 1 && (
                <div className="flex justify-between items-center pt-6 pb-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 disabled:opacity-50 text-sm font-bold hover:bg-gray-200 transition-colors"
                  >
                    Sebelumnya
                  </button>
                  <span className="text-sm text-gray-500 font-medium">Halaman {currentPage} dari {totalPages}</span>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 disabled:opacity-50 text-sm font-bold hover:bg-gray-200 transition-colors"
                  >
                    Berikutnya
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex justify-between items-center mb-4">
                <button onClick={prevMonth} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">&lt;</button>
                <h2 className="font-bold text-lg">{format(currentDate, 'MMMM yyyy', { locale: id })}</h2>
                <button onClick={nextMonth} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">&gt;</button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                  <div key={day} className="text-xs font-semibold text-gray-500 py-1">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {/* Empty slots for days before start of month */}
                {Array.from({ length: days[0].getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="p-2" />
                ))}
                
                {days.map(day => {
                  const dayEvents = getEventsForDate(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isTodayDate = isToday(day);
                  
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        p-2 rounded-lg relative aspect-square flex flex-col items-center justify-center transition-colors
                        ${isSelected ? 'bg-pkk-primary text-white font-bold' : isTodayDate ? 'bg-orange-50 text-orange-600 font-bold' : 'hover:bg-gray-50 text-gray-700'}
                      `}
                    >
                      <span className="text-sm">{format(day, 'd')}</span>
                      {dayEvents.length > 0 && (
                        <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-orange-500" />
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Selected Date View */}
              {selectedDate && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <h3 className="font-bold mb-3 flex items-center justify-between">
                    Kegiatan tanggal {format(selectedDate, 'dd MMM yyyy', { locale: id })}
                    <button onClick={() => setSelectedDate(null)} className="text-xs text-gray-400 hover:text-gray-600">Tutup</button>
                  </h3>
                  
                  {getEventsForDate(selectedDate).length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Tidak ada kegiatan pada tanggal ini.</p>
                  ) : (
                    <div className="space-y-3">
                      {getEventsForDate(selectedDate).map(event => (
                        <Card 
                          key={event.id} 
                          className={`p-3 border rounded-xl shadow-sm group cursor-pointer hover:shadow-md transition-all ${getEventStatusStyle(event.date)}`}
                          onClick={() => setSelectedEventDetail(event)}
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 w-full overflow-hidden">
                              <h4 className="font-bold text-pkk-text-main text-sm truncate w-full">{event.title}</h4>
                              {event.description && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{event.description}</p>}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Detail Event Modal */}
        {selectedEventDetail && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-start mb-4 gap-4">
                <h3 className="text-xl font-bold text-gray-900 leading-tight">{selectedEventDetail.title}</h3>
                <button onClick={() => setSelectedEventDetail(null)} className="p-1.5 text-gray-400 hover:text-gray-700 shrink-0 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="inline-flex items-center text-sm font-semibold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg mb-4 border border-blue-100">
                  <CalendarIcon size={16} className="mr-2" />
                  {format(parseISO(selectedEventDetail.date), 'dd MMMM yyyy, HH:mm', { locale: id })}
                </div>
                
                {selectedEventDetail.description ? (
                  <div className="text-gray-700 text-[15px] whitespace-pre-wrap leading-relaxed">
                    {selectedEventDetail.description}
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm italic">
                    Tidak ada deskripsi/keterangan.
                  </div>
                )}
              </div>
              
              {appUser?.role === 'super_admin' && (
                <div className="pt-5 mt-5 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                  <button 
                    onClick={() => {
                      setEditingEvent(selectedEventDetail);
                      setSelectedEventDetail(null);
                    }}
                    className="px-4 py-2 flex items-center gap-2 text-sm font-bold rounded-xl text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <Edit2 size={16} /> Ubah
                  </button>
                  <button 
                    onClick={() => {
                      setDeleteEventId(selectedEventDetail.id);
                      setSelectedEventDetail(null);
                    }}
                    className="px-4 py-2 flex items-center gap-2 text-sm font-bold rounded-xl text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={16} /> Hapus
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Event Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Tambah Kegiatan Baru</h3>
                <button onClick={() => setShowAddForm(false)} className="p-1 text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kegiatan</label>
                  <input 
                    type="text" 
                    required
                    value={addForm.title}
                    onChange={e => setAddForm({...addForm, title: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-pkk-primary focus:ring-1 focus:ring-pkk-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                  <input 
                    type="datetime-local" 
                    required
                    value={addForm.date}
                    onChange={e => setAddForm({...addForm, date: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-pkk-primary focus:ring-1 focus:ring-pkk-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi/Lokasi (Opsional)</label>
                  <textarea 
                    value={addForm.description}
                    onChange={e => setAddForm({...addForm, description: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-pkk-primary focus:ring-1 focus:ring-pkk-primary min-h-[100px]"
                  />
                </div>
                
                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-pkk-primary text-white font-bold hover:bg-pkk-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Kegiatan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Event Modal */}
        {editingEvent && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Ubah Kegiatan</h3>
                <button onClick={() => setEditingEvent(null)} className="p-1 text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleEditEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kegiatan</label>
                  <input 
                    type="text" 
                    required
                    value={editingEvent.title}
                    onChange={e => setEditingEvent({...editingEvent, title: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-pkk-primary focus:ring-1 focus:ring-pkk-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                  <input 
                    type="datetime-local" 
                    required
                    value={editingEvent.date}
                    onChange={e => setEditingEvent({...editingEvent, date: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-pkk-primary focus:ring-1 focus:ring-pkk-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi/Lokasi (Opsional)</label>
                  <textarea 
                    value={editingEvent.description || ''}
                    onChange={e => setEditingEvent({...editingEvent, description: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-pkk-primary focus:ring-1 focus:ring-pkk-primary min-h-[100px]"
                  />
                </div>
                
                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-pkk-primary text-white font-bold hover:bg-pkk-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteEventId && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Kegiatan</h3>
              <p className="text-sm text-gray-600 mb-6">Apakah Anda yakin ingin menghapus kegiatan ini? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteEventId(null)}
                  disabled={isSubmitting}
                  className="flex-1 py-2 rounded-xl border border-gray-200 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button 
                  onClick={handleDeleteEvent}
                  disabled={isSubmitting}
                  className="flex-1 py-2 rounded-xl bg-red-600 font-medium text-white hover:bg-red-700"
                >
                  {isSubmitting ? 'Menghapus...' : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
