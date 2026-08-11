import { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './screens/Dashboard';
import { MembersList } from './screens/MembersList';
import { Registration } from './screens/Registration';
import { MessageBlast } from './screens/MessageBlast';
import { AdminDashboard } from './screens/AdminDashboard';
import { Kegiatan } from './screens/Kegiatan';
import { Berita } from './screens/Berita';
import { Auth } from './screens/Auth';
import { Header } from './components/Header';
import { TabType } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';
import { ActivityAlert } from './components/ActivityAlert';

function AppContent() {
  const { token, appUser, loading, signOut } = useAuth();
  const [currentTab, setCurrentTab] = useState<TabType>('home');

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-pkk-bg">Loading...</div>;
  }

  if (!token) {
    return <Auth />;
  }

  if (appUser?.role === 'pending_operator' || appUser?.role === 'non_aktif') {
    return (
      <div className="w-full min-h-screen bg-pkk-bg flex justify-center">
        <div className="w-full max-w-md bg-pkk-bg min-h-screen relative shadow-2xl flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className="w-24 h-24 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-2">
            <ShieldAlert size={48} />
          </div>
          <h1 className="text-2xl font-bold text-pkk-text-main">
            {appUser?.role === 'non_aktif' ? 'Akun Non-Aktif' : 'Menunggu Persetujuan'}
          </h1>
          <p className="text-[15px] text-pkk-text-muted leading-relaxed">
            {appUser?.role === 'non_aktif' 
              ? 'Akun Anda saat ini dinonaktifkan oleh Admin. Silakan hubungi Admin untuk informasi lebih lanjut.'
              : 'Akun Anda berhasil didaftarkan namun memerlukan persetujuan dari Super Admin sebelum Anda dapat mengakses dashboard.'}
          </p>
          <button 
            onClick={signOut}
            className="mt-4 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ActivityAlert />
      <Layout currentTab={currentTab} onChangeTab={setCurrentTab}>
      {currentTab === 'home' && <Dashboard onNavigate={(tab) => setCurrentTab(tab as TabType)} />}
      {currentTab === 'members' && <MembersList onNavigate={(tab) => setCurrentTab(tab as TabType)} />}
      {currentTab === 'join' && <Registration onBack={() => setCurrentTab('home')} />}
      {currentTab === 'kegiatan' && <Kegiatan onNavigate={(tab) => setCurrentTab(tab as TabType)} />}
      {currentTab === 'berita' && <Berita onNavigate={(tab) => setCurrentTab(tab as TabType)} />}
      {currentTab === 'alerts' && <MessageBlast onBack={() => setCurrentTab('home')} />}
      {currentTab === 'admin' && <AdminDashboard onNavigate={(tab) => setCurrentTab(tab as TabType)} />}
      {currentTab === 'profile' && (
        <>
          <Header title="Profile" onNavigate={(tab) => setCurrentTab(tab as TabType)} />
          <div className="flex-1 flex flex-col items-center justify-center text-pkk-text-muted space-y-4">
            <p>Profile Settings Coming Soon</p>
            <button 
              onClick={signOut}
              className="px-6 py-3 bg-red-100 text-red-600 font-semibold rounded-xl hover:bg-red-200 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </Layout>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
