import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Camera, MapPin, Save, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function Registration({ onBack }: { onBack: () => void }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    pekerjaan: '',
    address: '',
    tanggalLahir: '',
    jenisKelamin: '',
    agama: '',
    statusPerkawinan: '',
    nomorKtp: '',
    nomorHp: '',
    imageUrl: '',
  });
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolokasi tidak didukung oleh browser Anda');
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocoding using Nominatim API
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          const address = data.display_name || `Lokasi: ${latitude}, ${longitude}`;
          setFormData(prev => ({ ...prev, address: address }));
        } catch (error) {
          console.error("Gagal mendapatkan alamat:", error);
          setFormData(prev => ({ ...prev, address: `Lokasi: ${latitude}, ${longitude}` }));
          alert('Gagal mendapatkan alamat lengkap, menyimpan koordinat.');
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        console.error("Geolokasi error:", error);
        alert('Gagal mendapatkan lokasi. Pastikan izin lokasi diberikan.');
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error('Failed to create member');
      
      alert('Member registered successfully!');
      onBack();
    } catch (error) {
      console.error(error);
      alert('Error registering member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header showBack onBack={onBack} title="Pendaftaran" />
      <main className="px-6 pt-2 pb-8 flex-1 overflow-y-auto">
        <div className="space-y-1 mb-8">
          <h1 className="text-[28px] font-bold text-pkk-text-main tracking-tight">Gabung KBSM</h1>
          <p className="text-[15px] text-pkk-text-muted leading-relaxed">
            Lengkapi data diri Anda untuk menjadi bagian dari komunitas kami yang harmonis.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Data Pribadi Section */}
          <Card className="p-5 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <User size={18} className="text-pkk-primary" />
              <h2 className="text-[15px] font-bold text-pkk-text-main">Data Pribadi</h2>
            </div>

            {/* Photo Upload */}
            <div className="border-2 border-dashed border-pkk-border rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-pkk-bg/50 relative overflow-hidden">
              {formData.imageUrl ? (
                <div className="relative w-24 h-24 mb-3">
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover rounded-full border-4 border-white shadow-sm" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-pkk-primary-light flex items-center justify-center text-pkk-primary mb-3">
                  <Camera size={24} />
                </div>
              )}
              <h3 className="text-sm font-bold text-pkk-primary">
                {formData.imageUrl ? 'Ubah Foto Wajah' : 'Unggah Foto Wajah'}
              </h3>
              <p className="text-[11px] text-pkk-text-muted mt-1">Pastikan wajah terlihat jelas</p>
              <input 
                type="file" 
                accept="image/*" 
                capture="user"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-pkk-text-muted ml-1">Nomor KTP (NIK)</label>
                <input 
                  type="text" 
                  required
                  maxLength={16}
                  value={formData.nomorKtp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 16) {
                      setFormData({...formData, nomorKtp: val});
                    }
                  }}
                  placeholder="16 Digit NIK" 
                  className="w-full bg-pkk-surface border border-pkk-border rounded-xl py-3 px-4 text-[15px] text-pkk-text-main focus:outline-none focus:border-pkk-primary focus:ring-1 focus:ring-pkk-primary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-pkk-text-muted ml-1">Nama Lengkap Sesuai KTP</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Masukkan nama lengkap" 
                  className="w-full bg-pkk-surface border border-pkk-border rounded-xl py-3 px-4 text-[15px] text-pkk-text-main focus:outline-none focus:border-pkk-primary focus:ring-1 focus:ring-pkk-primary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-pkk-text-muted ml-1">Tanggal Lahir</label>
                <input 
                  type="date" 
                  required
                  value={formData.tanggalLahir}
                  onChange={(e) => setFormData({...formData, tanggalLahir: e.target.value})}
                  className="w-full bg-pkk-surface border border-pkk-border rounded-xl py-3 px-4 text-[15px] text-pkk-text-main focus:outline-none focus:border-pkk-primary focus:ring-1 focus:ring-pkk-primary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-pkk-text-muted ml-1">Jenis Kelamin</label>
                <select 
                  required
                  value={formData.jenisKelamin}
                  onChange={(e) => setFormData({...formData, jenisKelamin: e.target.value})}
                  className="w-full bg-pkk-surface border border-pkk-border rounded-xl py-3 px-4 text-[15px] text-pkk-text-main focus:outline-none focus:border-pkk-primary focus:ring-1 focus:ring-pkk-primary transition-all appearance-none"
                >
                  <option value="" disabled>Pilih Jenis Kelamin</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-pkk-text-muted ml-1">Agama</label>
                <select 
                  required
                  value={formData.agama}
                  onChange={(e) => setFormData({...formData, agama: e.target.value})}
                  className="w-full bg-pkk-surface border border-pkk-border rounded-xl py-3 px-4 text-[15px] text-pkk-text-main focus:outline-none focus:border-pkk-primary focus:ring-1 focus:ring-pkk-primary transition-all appearance-none"
                >
                  <option value="" disabled>Pilih Agama</option>
                  <option value="Islam">Islam</option>
                  <option value="Kristen Protestan">Kristen Protestan</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddha">Buddha</option>
                  <option value="Konghucu">Konghucu</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-pkk-text-muted ml-1">Status Perkawinan</label>
                <select 
                  required
                  value={formData.statusPerkawinan}
                  onChange={(e) => setFormData({...formData, statusPerkawinan: e.target.value})}
                  className="w-full bg-pkk-surface border border-pkk-border rounded-xl py-3 px-4 text-[15px] text-pkk-text-main focus:outline-none focus:border-pkk-primary focus:ring-1 focus:ring-pkk-primary transition-all appearance-none"
                >
                  <option value="" disabled>Pilih Status</option>
                  <option value="Belum Kawin">Belum Kawin</option>
                  <option value="Kawin">Kawin</option>
                  <option value="Cerai Hidup">Cerai Hidup</option>
                  <option value="Cerai Mati">Cerai Mati</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Kontak & Pekerjaan Section */}
          <Card className="p-5 space-y-5">
            <h2 className="text-[15px] font-bold text-pkk-text-main mb-2">Kontak & Pekerjaan</h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-pkk-text-muted ml-1">Nomor HP</label>
                <input 
                  type="tel"
                  required
                  value={formData.nomorHp}
                  onChange={(e) => setFormData({...formData, nomorHp: e.target.value})}
                  placeholder="Contoh: 08123456789" 
                  className="w-full bg-pkk-surface border border-pkk-border rounded-xl py-3 px-4 text-[15px] text-pkk-text-main focus:outline-none focus:border-pkk-primary focus:ring-1 focus:ring-pkk-primary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-pkk-text-muted ml-1">Pekerjaan</label>
                <select 
                  required
                  value={formData.pekerjaan}
                  onChange={(e) => setFormData({...formData, pekerjaan: e.target.value})}
                  className="w-full bg-pkk-surface border border-pkk-border rounded-xl py-3 px-4 text-[15px] text-pkk-text-main focus:outline-none focus:border-pkk-primary focus:ring-1 focus:ring-pkk-primary transition-all appearance-none"
                >
                  <option value="" disabled>Pilih Pekerjaan</option>
                  <option value="Belum/Tidak Bekerja">Belum/Tidak Bekerja</option>
                  <option value="Mengurus Rumah Tangga">Mengurus Rumah Tangga</option>
                  <option value="Pelajar/Mahasiswa">Pelajar/Mahasiswa</option>
                  <option value="PNS">Pegawai Negeri Sipil (PNS)</option>
                  <option value="TNI/POLRI">TNI/POLRI</option>
                  <option value="Karyawan Swasta">Karyawan Swasta</option>
                  <option value="Wiraswasta/Pengusaha">Wiraswasta/Pengusaha</option>
                  <option value="Pensiunan">Pensiunan</option>
                  <option value="Petani/Peternak">Petani/Peternak</option>
                  <option value="Nelayan">Nelayan</option>
                  <option value="Buruh/Pekerja Harian">Buruh/Pekerja Harian</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-pkk-text-muted ml-1">Alamat Lengkap</label>
                <textarea 
                  rows={3}
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Nama jalan, RT/RW, Kelurahan..." 
                  className="w-full bg-pkk-surface border border-pkk-border rounded-xl py-3 px-4 text-[15px] text-pkk-text-main focus:outline-none focus:border-pkk-primary focus:ring-1 focus:ring-pkk-primary transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-medium text-pkk-text-muted ml-1">Lokasi Domisili</label>
                <div className="h-32 bg-pkk-bg rounded-xl border border-pkk-border relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cartographer.png")' }}></div>
                  <button 
                    type="button" 
                    onClick={handleGetLocation}
                    disabled={gettingLocation}
                    className="relative z-10 bg-white/90 backdrop-blur shadow-md py-2 px-4 rounded-full flex items-center gap-2 text-sm font-semibold text-pkk-text-main disabled:opacity-70"
                  >
                    {gettingLocation ? <Loader2 size={16} className="text-pkk-primary animate-spin" /> : <MapPin size={16} className="text-pkk-primary" />}
                    {gettingLocation ? 'Mencari...' : 'Cari Lokasi Saya'}
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-pkk-primary py-4 px-6 rounded-2xl text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-lg shadow-pkk-primary/20 active:scale-[0.98] transition-transform disabled:opacity-70 disabled:scale-100"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {loading ? 'Menyimpan...' : 'Simpan Data Anggota'}
          </button>
          
          <p className="text-center text-[11px] text-pkk-text-muted px-4">
            Data Anda aman dan hanya digunakan untuk keperluan komunitas.
          </p>
        </form>
      </main>
    </>
  );
}
