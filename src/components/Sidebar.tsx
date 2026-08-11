import { X, Shield, Bell, User, LogOut, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { TabType } from '@/types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: TabType) => void;
}

export function Sidebar({ isOpen, onClose, onNavigate }: SidebarProps) {
  const { appUser, signOut } = useAuth();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[60] transition-opacity max-w-md mx-auto"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar Drawer */}
      <div 
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white z-[70] transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col max-w-md mx-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <span className="text-xl font-bold text-pkk-primary">Menu</span>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-2 px-4">
          <div className="mb-4 px-2">
            <p className="text-sm text-gray-500">Logged in as</p>
            <p className="font-semibold text-gray-800 truncate">{appUser?.name || appUser?.email}</p>
          </div>

          <div className="h-px w-full bg-gray-100 mb-2"></div>

          {appUser?.role === 'super_admin' && (
            <button
              onClick={() => {
                onNavigate('admin');
                onClose();
              }}
              className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-50 transition-colors text-left text-gray-700 font-medium"
            >
              <Shield size={20} className="text-pkk-primary" />
              Manajemen User
            </button>
          )}

          <button
            onClick={() => {
              onNavigate('kegiatan');
              onClose();
            }}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-50 transition-colors text-left text-gray-700 font-medium"
          >
            <Calendar size={20} className="text-pkk-primary" />
            Kegiatan
          </button>

          <button
            onClick={() => {
              onNavigate('alerts');
              onClose();
            }}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-50 transition-colors text-left text-gray-700 font-medium"
          >
            <Bell size={20} className="text-pkk-primary" />
            Alerts
          </button>

          <button
            onClick={() => {
              onNavigate('profile');
              onClose();
            }}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-50 transition-colors text-left text-gray-700 font-medium"
          >
            <User size={20} className="text-pkk-primary" />
            Profile
          </button>
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => {
              signOut();
              onClose();
            }}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors text-left font-medium"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
