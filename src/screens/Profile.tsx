import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';

export function Profile({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { appUser, signOut, token } = useAuth();
  
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });
  const [isChanging, setIsChanging] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setIsChanging(true);
    setMessage({ text: '', type: '' });
    
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordForm)
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: 'Password berhasil diubah', type: 'success' });
        setPasswordForm({ oldPassword: '', newPassword: '' });
      } else {
        setMessage({ text: data.error || 'Gagal mengubah password', type: 'error' });
      }
    } catch (error) {
      console.error('Failed to change password', error);
      setMessage({ text: 'Terjadi kesalahan sistem', type: 'error' });
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <>
      <Header title="Profil Saya" onNavigate={onNavigate} />
      <main className="px-6 pt-6 pb-8 flex-1 overflow-y-auto space-y-6">
        
        {/* User Info Section */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="w-20 h-20 bg-pkk-primary-light text-pkk-primary rounded-full flex items-center justify-center text-2xl font-bold mb-3">
            {appUser?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h2 className="text-xl font-bold text-gray-900">{appUser?.name}</h2>
          <p className="text-sm text-gray-500 mt-1">{appUser?.nik}</p>
          <div className="mt-3 px-3 py-1 bg-gray-100 rounded-lg text-xs text-gray-600 font-medium capitalize">
            {appUser?.role?.replace('_', ' ')}
          </div>
        </section>

        {/* Change Password Section */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Ubah Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {message.text && (
              <div className={`p-3 text-sm rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message.text}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Lama</label>
              <input 
                type="password" 
                required
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-pkk-primary focus:ring-1 focus:ring-pkk-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
              <input 
                type="password" 
                required
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-pkk-primary focus:ring-1 focus:ring-pkk-primary"
              />
            </div>

            <button 
              type="submit"
              disabled={isChanging || !passwordForm.oldPassword || !passwordForm.newPassword}
              className="w-full mt-2 py-3 rounded-xl bg-pkk-primary text-white font-bold hover:bg-pkk-primary/90 transition-colors disabled:opacity-50"
            >
              {isChanging ? 'Menyimpan...' : 'Simpan Password'}
            </button>
          </form>
        </section>

        <section>
          <button 
            onClick={signOut}
            className="w-full py-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            Sign Out
          </button>
        </section>

      </main>
    </>
  );
}
