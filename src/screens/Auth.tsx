import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldCheck, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Auth() {
  const { loginWithNik, registerWithNik } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [nik, setNik] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await loginWithNik(nik, password);
      } else {
        if (!name.trim()) throw new Error("Nama harus diisi");
        await registerWithNik(nik, password, name);
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pkk-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto w-20 h-20 bg-pkk-primary-light text-pkk-primary rounded-3xl flex items-center justify-center mb-6">
          <ShieldCheck size={40} />
        </div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-pkk-text-main">
          Kerukunan Basanohi SUA
        </h2>
        <p className="mt-2 text-center text-[15px] text-pkk-text-muted">
          {isLogin ? 'Masuk ke akun Anda' : 'Daftar akun baru'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-6">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
          
          {error && (
            <div className="mb-6 bg-red-50 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pkk-primary focus:border-pkk-primary sm:text-sm transition-colors"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nomor Induk Kependudukan (NIK)</label>
              <input
                type="text"
                required
                value={nik}
                onChange={(e) => setNik(e.target.value.replace(/\D/g, '').slice(0, 16))}
                className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pkk-primary focus:border-pkk-primary sm:text-sm transition-colors"
                placeholder="16 Digit NIK"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pkk-primary focus:border-pkk-primary sm:text-sm transition-colors"
                placeholder="Minimal 6 karakter"
              />
            </div>

            <button
              type="submit"
              disabled={loading || nik.length < 16 || password.length < 6}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-pkk-primary hover:bg-pkk-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pkk-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Memproses...' : isLogin ? 'Masuk' : 'Daftar Sekarang'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 font-bold text-pkk-primary hover:text-pkk-primary/80 transition-colors"
              >
                {isLogin ? 'Daftar' : 'Masuk'}
              </button>
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
