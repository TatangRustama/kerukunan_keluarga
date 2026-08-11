import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import { Announcement } from '../types';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Plus, Edit2, Trash2, Megaphone, X } from 'lucide-react';

export function Berita({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { token, appUser } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ title: '', content: '' });
  
  const [selectedAnnDetail, setSelectedAnnDetail] = useState<Announcement | null>(null);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [deleteAnnId, setDeleteAnnId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdminOrOperator = appUser?.role === 'super_admin' || appUser?.role === 'operator';

  const fetchAnnouncements = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        search: searchQuery
      });
      
      const res = await fetch(`/api/announcements?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.data);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch announcements", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAnnouncements();
    }, 300);
    return () => clearTimeout(timer);
  }, [token, currentPage, searchQuery]);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    if (!token) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addForm)
      });
      if (res.ok) {
        setShowAddForm(false);
        setAddForm({ title: '', content: '' });
        fetchAnnouncements();
      } else {
        alert("Gagal menambahkan pengumuman");
      }
    } catch (error) {
      console.error("Failed to add announcement", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: any) => {
    e.preventDefault();
    if (!token || !editingAnn) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/announcements/${editingAnn.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editingAnn.title,
          content: editingAnn.content,
        })
      });
      
      if (res.ok) {
        setEditingAnn(null);
        fetchAnnouncements();
      } else {
        alert("Gagal mengubah pengumuman");
      }
    } catch (error) {
      console.error("Failed to edit announcement", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !deleteAnnId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/announcements/${deleteAnnId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        setDeleteAnnId(null);
        fetchAnnouncements();
      } else {
        alert("Gagal menghapus pengumuman");
      }
    } catch (error) {
      console.error("Failed to delete announcement", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header title="Berita & Pengumuman" onNavigate={onNavigate as any} />
      
      <div className="flex-1 flex flex-col p-4 bg-pkk-bg relative h-[calc(100vh-140px)]">
        {isAdminOrOperator && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="absolute bottom-28 right-6 w-14 h-14 bg-pkk-primary text-white rounded-[20px] shadow-xl shadow-pkk-primary/30 flex items-center justify-center transition-transform active:scale-90 z-40"
            title="Tambah Pengumuman"
          >
            <Plus size={24} />
          </button>
        )}

        {/* Search */}
        <div className="flex flex-col gap-3 mb-6 flex-shrink-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-pkk-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Cari pengumuman..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-pkk-surface border border-pkk-border rounded-2xl py-3.5 pl-12 pr-4 text-[15px] text-pkk-text-main placeholder:text-pkk-text-muted focus:outline-none focus:border-pkk-primary focus:ring-1 focus:ring-pkk-primary transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-4">
          {loading ? (
            <div className="flex justify-center py-10 text-pkk-primary">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.length === 0 ? (
                <div className="text-center py-10 text-pkk-text-muted">
                  Belum ada pengumuman.
                </div>
              ) : (
                announcements.map(ann => (
                  <Card 
                    key={ann.id} 
                    className="p-4 border rounded-xl shadow-sm group cursor-pointer hover:shadow-md transition-all bg-white"
                    onClick={() => setSelectedAnnDetail(ann)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-orange-50 text-orange-500 p-2.5 rounded-xl shrink-0 mt-1">
                        <Megaphone size={20} />
                      </div>
                      <div className="flex-1 w-full overflow-hidden">
                        <h3 className="font-bold text-lg text-pkk-text-main leading-tight truncate w-full mb-1">{ann.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          <span className="font-medium text-gray-700">{ann.authorName || 'Admin'}</span>
                          <span>•</span>
                          <span>{format(new Date(ann.createdAt), 'dd MMM yyyy', { locale: id })}</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{ann.content}</p>
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
          )}
        </div>

        {/* Detail Modal */}
        {selectedAnnDetail && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-start mb-4 gap-4">
                <h3 className="text-xl font-bold text-gray-900 leading-tight">{selectedAnnDetail.title}</h3>
                <button onClick={() => setSelectedAnnDetail(null)} className="p-1.5 text-gray-400 hover:text-gray-700 shrink-0 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                  <span className="font-medium text-gray-700">{selectedAnnDetail.authorName || 'Admin'}</span>
                  <span>•</span>
                  <span>{format(new Date(selectedAnnDetail.createdAt), 'dd MMMM yyyy, HH:mm', { locale: id })}</span>
                </div>
                
                <div className="text-gray-700 text-[15px] whitespace-pre-wrap leading-relaxed">
                  {selectedAnnDetail.content}
                </div>
              </div>
              
              {isAdminOrOperator && (
                <div className="pt-5 mt-5 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                  <button 
                    onClick={() => {
                      setEditingAnn(selectedAnnDetail);
                      setSelectedAnnDetail(null);
                    }}
                    className="px-4 py-2 flex items-center gap-2 text-sm font-bold rounded-xl text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <Edit2 size={16} /> Ubah
                  </button>
                  <button 
                    onClick={() => {
                      setDeleteAnnId(selectedAnnDetail.id);
                      setSelectedAnnDetail(null);
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

        {/* Add Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-xl font-bold text-gray-900">Tambah Pengumuman</h3>
                <button onClick={() => setShowAddForm(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAdd} className="flex-1 flex flex-col min-h-0">
                <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Judul</label>
                    <input 
                      type="text" 
                      required
                      value={addForm.title}
                      onChange={e => setAddForm({...addForm, title: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pkk-primary/20 focus:border-pkk-primary transition-all text-sm"
                      placeholder="Masukkan judul pengumuman"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Isi Pengumuman</label>
                    <textarea 
                      required
                      value={addForm.content}
                      onChange={e => setAddForm({...addForm, content: e.target.value})}
                      rows={6}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pkk-primary/20 focus:border-pkk-primary transition-all text-sm resize-none"
                      placeholder="Tuliskan isi pengumuman..."
                    ></textarea>
                  </div>
                </div>
                <div className="pt-6 shrink-0">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-pkk-primary text-white font-bold rounded-xl hover:bg-pkk-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Pengumuman'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingAnn && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-xl font-bold text-gray-900">Ubah Pengumuman</h3>
                <button onClick={() => setEditingAnn(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleEdit} className="flex-1 flex flex-col min-h-0">
                <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Judul</label>
                    <input 
                      type="text" 
                      required
                      value={editingAnn.title}
                      onChange={e => setEditingAnn({...editingAnn, title: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pkk-primary/20 focus:border-pkk-primary transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Isi Pengumuman</label>
                    <textarea 
                      required
                      value={editingAnn.content}
                      onChange={e => setEditingAnn({...editingAnn, content: e.target.value})}
                      rows={6}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pkk-primary/20 focus:border-pkk-primary transition-all text-sm resize-none"
                    ></textarea>
                  </div>
                </div>
                <div className="pt-6 shrink-0">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-pkk-primary text-white font-bold rounded-xl hover:bg-pkk-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteAnnId && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Pengumuman?</h3>
              <p className="text-gray-600 mb-6">Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteAnnId(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-70"
                >
                  {isSubmitting ? 'Menghapus...' : 'Hapus'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
