export type TabType = 'home' | 'members' | 'join' | 'alerts' | 'profile' | 'admin' | 'kegiatan' | 'berita';

export type UserRole = 'super_admin' | 'operator' | 'pending_operator' | 'non_aktif';

export interface AppUser {
  uid: string;
  email: string | null;
  name: string | null;
  photoURL: string | null;
  role: UserRole;
  createdAt: string;
  nik?: string;
}

export interface Member {
  id: string;
  name: string;
  pekerjaan: string | null;
  address: string | null;
  imageUrl: string | null;
  tanggalLahir: string | null;
  jenisKelamin: string | null;
  agama: string | null;
  statusPerkawinan: string | null;
  nomorKtp: string | null;
  nomorHp: string | null;
}

export interface KegiatanEvent {
  id: number;
  title: string;
  description: string | null;
  date: string;
  createdAt: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  authorId: number;
  createdAt: string;
  authorName?: string;
}
