import { Bell, User, Shield, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { TabType } from '@/types';
import { useState } from 'react';
import { Sidebar } from './Sidebar';

interface HeaderProps {
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
  className?: string;
  onNavigate?: (tab: TabType) => void;
}

export function Header({ showBack, onBack, title = "Kerukunan Basanohi SUA", className, onNavigate }: HeaderProps) {
  const { appUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <header className={cn("sticky top-0 z-50 w-full px-6 py-4 flex justify-between items-center bg-pkk-bg/80 backdrop-blur-md", className)}>
        <div className="flex items-center gap-3">
          {showBack ? (
            <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-pkk-border/50 transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>
          ) : (
            <div className="w-10 h-10 rounded-full bg-pkk-primary-light flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop" alt="Profile" className="w-full h-full object-cover" />
            </div>
          )}
          <span className="text-xl font-bold text-pkk-primary tracking-tight truncate max-w-[200px]">{title}</span>
        </div>
        
        {!showBack && onNavigate && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-pkk-primary-light/50 text-pkk-primary transition-colors hover:bg-pkk-primary-light active:scale-95 duration-150"
            >
              <Menu size={24} />
            </button>
          </div>
        )}
      </header>

      {onNavigate && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          onNavigate={onNavigate} 
        />
      )}
    </>
  );
}
