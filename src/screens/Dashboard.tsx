import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Users, UserPlus, Megaphone, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Announcement } from '@/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function Dashboard({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { token } = useAuth();
  const [newsData, setNewsData] = useState<Announcement[]>([]);
  const [stats, setStats] = useState<{totalMembers: number, nextEvent: any}>({ totalMembers: 0, nextEvent: null });

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const [newsRes, statsRes] = await Promise.all([
          fetch('/api/announcements?limit=3', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/dashboard/stats', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        if (newsRes.ok) {
          const data = await newsRes.json();
          setNewsData(data.data);
        }
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };
    fetchData();
  }, [token]);

  return (
    <>
      <Header onNavigate={onNavigate as any} />
      <main className="px-6 pt-2 pb-8 space-y-8 flex-1 overflow-y-auto">
        {/* Welcome Header */}
        <section className="space-y-1">
          <h1 className="text-[28px] leading-tight font-bold text-pkk-text-main tracking-tight">Halo, Keluarga!</h1>
          <p className="text-base text-pkk-text-muted">Senang melihat Anda kembali hari ini.</p>
        </section>

        {/* Summary Bento Grid */}
        <section className="grid grid-cols-2 gap-4">
          {/* Large Card: Total Members */}
          <Card className="col-span-2 p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-pkk-text-muted">Total Anggota</p>
                <h2 className="text-[32px] font-bold text-pkk-primary mt-1 tracking-tight">{stats.totalMembers}</h2>
              </div>
              <div className="p-2.5 bg-pkk-primary-light rounded-2xl text-pkk-primary">
                <Users size={24} className="fill-current" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-pkk-primary font-bold">+12%</span>
              <span className="text-pkk-text-muted">dari bulan lalu</span>
            </div>
            {/* Mini Chart Visualization */}
            <div className="h-16 w-full flex items-end gap-1.5 mt-2">
              <div className="flex-1 bg-pkk-primary-light rounded-t-sm h-8 opacity-60"></div>
              <div className="flex-1 bg-pkk-primary-light rounded-t-sm h-10 opacity-70"></div>
              <div className="flex-1 bg-pkk-primary-light rounded-t-sm h-8 opacity-60"></div>
              <div className="flex-1 bg-pkk-primary-light rounded-t-sm h-12 opacity-80"></div>
              <div className="flex-1 bg-pkk-primary rounded-t-sm h-16"></div>
            </div>
          </Card>
          
          {/* Next Event Card - Full Width */}
          <Card className="col-span-2 p-5 flex justify-between items-center h-auto cursor-pointer active:scale-[0.98] transition-transform" onClick={() => onNavigate('kegiatan')}>
            <div>
              <p className="text-xs font-medium text-pkk-text-muted mb-1">Acara Berikutnya</p>
              {stats.nextEvent ? (
                <>
                  <h3 className="text-xl font-bold text-pkk-text-main truncate max-w-[200px]">{stats.nextEvent.title}</h3>
                  <p className="text-sm font-medium text-pkk-primary mt-1">{format(new Date(stats.nextEvent.date), 'dd MMM yyyy', { locale: id })}</p>
                </>
              ) : (
                <p className="text-sm font-medium text-pkk-text-main mt-1">Belum ada acara</p>
              )}
            </div>
            <div className="bg-pkk-bg p-3 rounded-2xl">
              <ChevronRight size={24} className="text-pkk-primary" />
            </div>
          </Card>
        </section>

        {/* Quick Action Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-pkk-text-main">Aksi Cepat</h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => onNavigate('join')}
              className="w-full bg-pkk-primary py-4 px-5 rounded-2xl text-white flex items-center justify-between transition-transform active:scale-[0.98] shadow-lg shadow-pkk-primary/20"
            >
              <div className="flex items-center gap-3">
                <UserPlus size={22} />
                <span className="font-semibold text-[15px]">Daftar Anggota Baru</span>
              </div>
              <ChevronRight size={20} className="opacity-80" />
            </button>
            <button 
              onClick={() => onNavigate('alerts')}
              className="w-full bg-pkk-primary-light py-4 px-5 rounded-2xl text-pkk-primary flex items-center justify-between transition-transform active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <Megaphone size={22} />
                <span className="font-semibold text-[15px]">Message Blast</span>
              </div>
              <ChevronRight size={20} className="opacity-80" />
            </button>
          </div>
        </section>

        {/* Association News Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-pkk-text-main">Berita Terkini</h2>
            <button 
              onClick={() => onNavigate('berita')}
              className="text-pkk-primary text-sm font-semibold tracking-wide"
            >
              Lihat Semua
            </button>
          </div>
          <div className="space-y-3">
            {newsData.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Belum ada berita terkini.</p>
            ) : (
              newsData.map((news) => (
                <Card 
                  key={news.id} 
                  className="p-4 flex h-auto cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onNavigate('berita')}
                >
                  <div className="flex flex-col justify-center flex-1 min-w-0">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-pkk-primary mb-1.5">PENGUMUMAN</span>
                    <h3 className="text-[14px] font-bold text-pkk-text-main leading-snug line-clamp-2">{news.title}</h3>
                    <p className="text-[11px] text-pkk-text-muted mt-1.5 font-medium">{format(new Date(news.createdAt), 'dd MMM yyyy', { locale: id })}</p>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>
      </main>
    </>
  );


}
