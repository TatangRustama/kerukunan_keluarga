import { useState } from 'react';
import { ArrowLeft, MapPin, X } from 'lucide-react';
import { Member } from '@/types';
import { Header } from '@/components/Header';

interface MemberDetailProps {
  member: Member;
  onBack: () => void;
}

export function MemberDetail({ member, onBack }: MemberDetailProps) {
  const [isFullscreenImage, setIsFullscreenImage] = useState(false);
  // Generate a Google Maps embed URL based on the member's address
  const addressQuery = encodeURIComponent(member.address || 'Basanohi SUA');
  const mapUrl = `https://maps.google.com/maps?q=${addressQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const defaultImageUrl = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop';
  const imageUrl = member.imageUrl || defaultImageUrl;

  return (
    <>
      <div className="bg-white px-6 py-4 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-pkk-bg flex items-center justify-center text-pkk-text-main hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-pkk-text-main">Detail Anggota</h1>
      </div>

      <main className="flex-1 overflow-y-auto bg-pkk-bg pb-10">
        <div className="relative h-64 w-full cursor-pointer" onClick={() => setIsFullscreenImage(true)}>
          <img 
            src={imageUrl} 
            alt={member.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <h2 className="text-3xl font-bold">{member.name}</h2>
            <p className="opacity-90 text-[15px] font-medium mt-1">{member.pekerjaan || 'Anggota'}</p>
          </div>
        </div>

        <div className="px-6 py-6 -mt-4 relative z-10 bg-pkk-bg rounded-t-3xl space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-[12px] font-bold text-pkk-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin size={14} /> Lokasi & Alamat
            </h3>
            <p className="text-[15px] text-pkk-text-main font-medium mb-4 leading-relaxed">{member.address || '-'}</p>
            
            <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100 relative shadow-inner">
              <iframe 
                src={mapUrl}
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-[12px] font-bold text-pkk-primary uppercase tracking-wider mb-4">Informasi Pribadi</h3>
            
            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
              <div>
                <p className="text-[11px] font-semibold text-pkk-text-muted uppercase tracking-wider mb-1">Nomor HP</p>
                <p className="text-[14px] text-pkk-text-main font-medium">{member.nomorHp || '-'}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-pkk-text-muted uppercase tracking-wider mb-1">No KTP</p>
                <p className="text-[14px] text-pkk-text-main font-medium">{member.nomorKtp || '-'}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-pkk-text-muted uppercase tracking-wider mb-1">Tanggal Lahir</p>
                <p className="text-[14px] text-pkk-text-main font-medium">{member.tanggalLahir || '-'}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-pkk-text-muted uppercase tracking-wider mb-1">Jenis Kelamin</p>
                <p className="text-[14px] text-pkk-text-main font-medium">{member.jenisKelamin || '-'}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-pkk-text-muted uppercase tracking-wider mb-1">Agama</p>
                <p className="text-[14px] text-pkk-text-main font-medium">{member.agama || '-'}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-pkk-text-muted uppercase tracking-wider mb-1">Status Kawin</p>
                <p className="text-[14px] text-pkk-text-main font-medium">{member.statusPerkawinan || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {isFullscreenImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-in fade-in duration-200">
          <button 
            onClick={() => setIsFullscreenImage(false)}
            className="absolute top-4 right-4 z-[110] w-10 h-10 flex items-center justify-center bg-black/50 rounded-full text-white hover:bg-black/80 transition-colors"
          >
            <X size={24} />
          </button>
          <img 
            src={imageUrl} 
            alt={member.name} 
            className="w-full max-h-full object-contain"
          />
        </div>
      )}
    </>
  );
}
