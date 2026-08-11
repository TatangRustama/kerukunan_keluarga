import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Search, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Member } from '@/types';
import { MemberDetail } from './MemberDetail';

export function MembersList({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchMembers() {
      if (!token) return;
      try {
        const res = await fetch('/api/members', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setMembers(data);
        }
      } catch (error) {
        console.error("Failed to fetch members", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMembers();
  }, [token]);

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (member.pekerjaan && member.pekerjaan.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const currentMembers = filteredMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (selectedMember) {
    return <MemberDetail member={selectedMember} onBack={() => setSelectedMember(null)} />;
  }

  return (
    <>
      <Header title="Kerukunan Basanohi SUA" onNavigate={onNavigate as any} />
      <main className="px-6 pt-2 pb-8 flex-1 flex flex-col overflow-hidden">
        
        <div className="space-y-1 mb-6 flex-shrink-0">
          <h1 className="text-[28px] font-bold text-pkk-text-main tracking-tight">Daftar Anggota</h1>
          <p className="text-[15px] text-pkk-text-muted">Total Anggota: <span className="font-bold text-pkk-primary">{members.length}</span> orang</p>
        </div>

        {/* Search Input */}
        <div className="relative mb-5 flex-shrink-0">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-pkk-text-muted">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Cari anggota berdasarkan nama..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-pkk-surface border border-pkk-border rounded-2xl py-3.5 pl-12 pr-4 text-[15px] text-pkk-text-main placeholder:text-pkk-text-muted focus:outline-none focus:border-pkk-primary focus:ring-1 focus:ring-pkk-primary transition-all shadow-sm"
          />
        </div>

        {/* Member List */}
        <div className="flex-1 overflow-y-auto space-y-3 pb-4">
          {loading ? (
            <div className="flex justify-center py-10 text-pkk-primary">
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : (
            <>
              {currentMembers.map((member) => (
                <Card key={member.id} className="p-3.5 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]" onClick={() => setSelectedMember(member)}>
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-pkk-primary-light flex-shrink-0">
                    <img src={member.imageUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop'} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-pkk-text-main truncate">{member.name}</h3>
                    <p className="text-[13px] font-semibold text-pkk-primary mt-0.5 truncate">{member.pekerjaan || 'Member'}</p>
                    <p className="text-[12px] text-pkk-text-muted mt-0.5 truncate">{member.address}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-pkk-bg flex items-center justify-center text-pkk-text-muted flex-shrink-0">
                    <ChevronRight size={18} />
                  </div>
                </Card>
              ))}
              
              {filteredMembers.length === 0 && (
                <div className="text-center py-10 text-pkk-text-muted">
                  <p>Tidak ada anggota ditemukan.</p>
                </div>
              )}
              
              {totalPages > 1 && (
                <div className="flex justify-between items-center pt-4">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 disabled:opacity-50 text-sm font-medium hover:bg-gray-200"
                  >
                    Sebelumnya
                  </button>
                  <span className="text-sm text-gray-500 font-medium">Halaman {currentPage} dari {totalPages}</span>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 disabled:opacity-50 text-sm font-medium hover:bg-gray-200"
                  >
                    Berikutnya
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
