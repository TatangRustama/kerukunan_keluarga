import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { AppUser, UserRole } from '@/types';
import { ShieldAlert, Users, Shield, UserX, UserCheck, Trash2, Plus, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function AdminDashboard({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { token, appUser } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', nik: '', password: '', role: 'operator' as UserRole });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (!token) return;
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const fetchedUsers = await res.json();
        setUsers(fetchedUsers);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appUser?.role === 'super_admin') {
      fetchUsers();
    }
  }, [appUser, token]);

  const updateUserRole = async (uid: string, newRole: UserRole) => {
    try {
      if (!token) return;
      const res = await fetch(`/api/users/${uid}/role`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to update user role', error);
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete || !token) return;
    
    try {
      const res = await fetch(`/api/users/${userToDelete}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchUsers();
        setUserToDelete(null);
      } else {
        const data = await res.json();
        console.error(data.error || "Gagal menghapus pengguna");
        setUserToDelete(null);
      }
    } catch (error) {
      console.error('Failed to delete user', error);
      setUserToDelete(null);
    }
  };

  const handleAddUser = async (e: any) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    
    try {
      if (!token) return;
      // We can use the existing register endpoint, but since it's admin, we need a special endpoint to set role directly?
      // Wait, register endpoint defaults to pending_operator.
      // We can just call register, then update role! Or better, create a new endpoint.
      // For now, let's just use register, and then update role.
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nik: addForm.nik,
          name: addForm.name,
          password: addForm.password
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setFormError(data.error || "Gagal menambahkan user");
        setIsSubmitting(false);
        return;
      }
      
      // Update role
      await fetch(`/api/users/${data.user.uid}/role`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: addForm.role })
      });
      
      setAddForm({ name: '', nik: '', password: '', role: 'operator' });
      setShowAddUser(false);
      fetchUsers();
    } catch (error) {
      console.error('Failed to add user', error);
      setFormError('Terjadi kesalahan sistem');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (appUser?.role !== 'super_admin') {
    return (
      <div className="flex-1 flex items-center justify-center text-pkk-text-muted px-6 text-center">
        Anda tidak memiliki akses ke halaman ini.
      </div>
    );
  }

  const roleLabels: Record<UserRole, string> = {
    super_admin: 'Admin',
    operator: 'Operator Aktif',
    pending_operator: 'Menunggu Persetujuan',
    non_aktif: 'Non Aktif'
  };

  return (
    <>
      <Header title="Manajemen User" onNavigate={onNavigate as any} />
      <main className="px-6 pt-2 pb-8 flex-1 overflow-y-auto space-y-4 relative">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-bold text-gray-500">Daftar Pengguna ({users.length})</h2>
          <button 
            onClick={() => setShowAddUser(true)}
            className="flex items-center gap-1 text-sm bg-pkk-primary text-white px-3 py-1.5 rounded-lg hover:bg-pkk-primary/90 transition-colors"
          >
            <Plus size={16} /> Tambah User
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-center text-gray-500 mt-10">Memuat data user...</p>
        ) : (
          <div className="space-y-4">
            {users.map(user => (
              <Card key={user.uid} className="p-4 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold ${user.role === 'super_admin' ? 'bg-purple-100 text-purple-600' : user.role === 'operator' ? 'bg-green-100 text-green-600' : user.role === 'non_aktif' ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-600'}`}>
                    {user.role === 'super_admin' ? <Shield size={20} /> : user.role === 'operator' ? <UserCheck size={20} /> : user.role === 'non_aktif' ? <UserX size={20} /> : <ShieldAlert size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-pkk-text-main truncate">{user.name || 'No Name'}</p>
                    <p className="text-[12px] text-pkk-text-muted truncate">{user.email}</p>
                  </div>
                  
                  {user.uid !== appUser.uid && (
                    <button
                      onClick={() => setUserToDelete(user.uid)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      title="Hapus Pengguna"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                
                {user.uid !== appUser.uid && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Ubah Role:</span>
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.uid, e.target.value as UserRole)}
                      className="flex-1 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-pkk-primary focus:border-pkk-primary block p-2"
                    >
                      <option value="super_admin">Admin</option>
                      <option value="operator">Operator Aktif</option>
                      <option value="pending_operator">Menunggu Persetujuan</option>
                      <option value="non_aktif">Non Aktif</option>
                    </select>
                  </div>
                )}
                {user.uid === appUser.uid && (
                  <div className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs text-gray-500 text-center font-medium">
                    (Anda Sendiri - {roleLabels[user.role]})
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {userToDelete && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Pengguna</h3>
              <p className="text-sm text-gray-600 mb-6">Apakah Anda yakin ingin menghapus pengguna ini secara permanen? Pengguna ini dapat mendaftar kembali nantinya.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setUserToDelete(null)}
                  className="flex-1 py-2 rounded-xl border border-gray-200 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmDeleteUser}
                  className="flex-1 py-2 rounded-xl bg-red-600 font-medium text-white hover:bg-red-700"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showAddUser && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Tambah Pengguna Baru</h3>
                <button onClick={() => setShowAddUser(false)} className="p-1 text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              
              {formError && (
                <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg">
                  {formError}
                </div>
              )}

              <form onSubmit={handleAddUser} className="space-y-4 overflow-y-auto pr-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    required
                    value={addForm.name}
                    onChange={e => setAddForm({...addForm, name: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-pkk-primary focus:ring-1 focus:ring-pkk-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">16 Digit NIK</label>
                  <input 
                    type="text" 
                    required
                    maxLength={16}
                    value={addForm.nik}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 16) {
                        setAddForm({...addForm, nik: val});
                      }
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-pkk-primary focus:ring-1 focus:ring-pkk-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input 
                    type="password" 
                    required
                    value={addForm.password}
                    onChange={e => setAddForm({...addForm, password: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-pkk-primary focus:ring-1 focus:ring-pkk-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role Awal</label>
                  <select
                    value={addForm.role}
                    onChange={e => setAddForm({...addForm, role: e.target.value as UserRole})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-pkk-primary focus:ring-1 focus:ring-pkk-primary"
                  >
                    <option value="operator">Operator Aktif</option>
                    <option value="pending_operator">Menunggu Persetujuan</option>
                    <option value="super_admin">Admin</option>
                    <option value="non_aktif">Non Aktif</option>
                  </select>
                </div>
                
                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={isSubmitting || addForm.nik.length !== 16}
                    className="w-full py-3 rounded-xl bg-pkk-primary text-white font-bold hover:bg-pkk-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Pengguna'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
