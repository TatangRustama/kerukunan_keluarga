import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Clock, Send } from 'lucide-react';

export function MessageBlast({ onBack }: { onBack: () => void }) {
  return (
    <>
      <Header showBack onBack={onBack} title="Kerukunan Basanohi SUA" />
      <main className="px-6 pt-2 pb-8 flex-1 overflow-y-auto">
        <div className="space-y-1 mb-8">
          <h1 className="text-[28px] font-bold text-pkk-text-main tracking-tight">Message Blast</h1>
          <p className="text-[15px] text-pkk-text-muted leading-relaxed">
            Send an urgent update or announcement to all association members instantly.
          </p>
        </div>

        {/* Input Form */}
        <Card className="p-5 space-y-4 mb-6">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-pkk-text-muted ml-1">Message Title</label>
            <input 
              type="text" 
              placeholder="e.g., Annual Dues Reminder" 
              className="w-full bg-pkk-bg border border-pkk-border rounded-xl py-3 px-4 text-[15px] text-pkk-text-main focus:outline-none focus:border-pkk-primary focus:ring-1 focus:ring-pkk-primary transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-pkk-text-muted ml-1">Content</label>
            <textarea 
              rows={5}
              placeholder="Write your message here..." 
              className="w-full bg-pkk-bg border border-pkk-border rounded-xl py-3 px-4 text-[15px] text-pkk-text-main focus:outline-none focus:border-pkk-primary focus:ring-1 focus:ring-pkk-primary transition-all resize-none"
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <button className="flex items-center gap-2 text-[13px] font-medium text-pkk-primary hover:text-pkk-primary-dark transition-colors">
              <Clock size={16} />
              Schedule for later
            </button>
            <span className="text-[12px] text-pkk-text-muted">0/500 characters</span>
          </div>
        </Card>

        <button className="w-full bg-pkk-primary py-4 px-6 rounded-2xl text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-lg shadow-pkk-primary/20 active:scale-[0.98] transition-transform mb-8">
          <Send size={18} />
          Blast to All Members
        </button>

        {/* Live Preview Section */}
        <div>
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-[15px] font-semibold text-pkk-text-main">Live Preview</h3>
            <span className="text-[13px] font-bold text-pkk-primary">Lock Screen</span>
          </div>

          <div className="relative w-full h-[320px] bg-[#1a1a1a] rounded-[32px] overflow-hidden border-8 border-[#333] shadow-2xl">
            {/* Phone Wallpaper (Gradient) */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#2a3b4c] to-[#121820]"></div>
            
            {/* Fake Time */}
            <div className="absolute top-12 w-full text-center space-y-1">
              <h2 className="text-[56px] font-light text-white leading-none tracking-tighter">10:40</h2>
              <p className="text-[15px] font-medium text-white/90">Thursday, Oct 24</p>
            </div>

            {/* Fake Notification */}
            <div className="absolute top-40 inset-x-4 bg-white/95 backdrop-blur-md rounded-[20px] p-3.5 shadow-lg">
              <div className="flex justify-between items-start mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-pkk-primary flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  </div>
                  <span className="text-[13px] font-bold text-pkk-primary tracking-tight">Kerukunan Basanohi SUA</span>
                </div>
                <span className="text-[11px] text-pkk-text-muted">Now</span>
              </div>
              <h4 className="text-[14px] font-semibold text-pkk-text-main leading-snug mb-0.5">Upcoming General Meeti...</h4>
              <p className="text-[13px] text-pkk-text-muted leading-tight line-clamp-2">
                Dear members, we are excited to announce our upcoming...
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
