import React from 'react';
import { TabType } from '@/types';
import { BottomNav } from './BottomNav';

interface LayoutProps {
  children: React.ReactNode;
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export function Layout({ children, currentTab, onChangeTab }: LayoutProps) {
  return (
    <div className="w-full min-h-screen bg-pkk-bg flex justify-center">
      <div className="w-full max-w-md bg-pkk-bg min-h-screen relative shadow-2xl overflow-x-hidden flex flex-col">
        <div className="flex-1 pb-24 flex flex-col relative">
          {children}
        </div>
        <BottomNav currentTab={currentTab} onChangeTab={onChangeTab} />
      </div>
    </div>
  );
}
