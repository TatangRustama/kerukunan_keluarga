import { Home, Users, UserPlus, Bell, User, Shield } from 'lucide-react';
import { TabType } from '@/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface BottomNavProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export function BottomNav({ currentTab, onChangeTab }: BottomNavProps) {
  const { appUser } = useAuth();
  
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'join', icon: UserPlus, label: 'Join' },
    { id: 'members', icon: Users, label: 'Members' },
  ] as { id: TabType; icon: any; label: string }[];

  return (
    <nav className="fixed bottom-0 w-full max-w-md mx-auto z-50 bg-pkk-surface/90 backdrop-blur-xl border-t border-pkk-border/50 rounded-t-3xl shadow-nav pb-safe">
      <div className="flex justify-around items-center px-2 pt-3 pb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id as TabType)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-16 transition-all duration-200",
                isActive ? "text-pkk-primary scale-105" : "text-pkk-text-muted hover:text-pkk-primary/70"
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={cn(isActive && "fill-pkk-primary/10")} />
              <span className={cn(
                "text-[10px] font-medium transition-colors",
                isActive ? "text-pkk-primary font-semibold" : ""
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
