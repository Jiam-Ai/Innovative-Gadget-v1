
import React, { useEffect, useState, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { getNotifications, markNotificationRead, getCurrentUser } from '../services/storageService';
import { AppNotification } from '../types';
import { supabase } from '../services/supabaseClient';

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const user = getCurrentUser();

  const loadNotifications = useCallback(async () => {
      if (user) {
          const notes = await getNotifications(user.id);
          setNotifications(notes);
          setUnreadCount(notes.filter(n => !n.read).length);
      }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // 1. Initial Load
    loadNotifications();

    // 2. Setup Supabase Realtime Subscription
    const channel = supabase
      .channel(`user-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('New live notification:', payload);
          const newNote = payload.new as AppNotification;
          
          // Prepend new notification
          setNotifications(prev => [newNote, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Trigger visual ping
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 2000);
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadNotifications]);

  const handleToggle = async () => {
      setIsOpen(!isOpen);
      if (!isOpen) {
          await loadNotifications();
      }
  };

  const handleMarkRead = async (id: string) => {
      await markNotificationRead(id);
      // Update local state immediately for snappy UI
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="relative">
      <button 
        onClick={handleToggle}
        className={`relative w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-300 border ${
          isAnimating 
          ? 'bg-emerald-500 scale-110 shadow-[0_0_20px_rgba(16,185,129,0.5)] border-emerald-400' 
          : 'bg-white/10 hover:bg-white/20 border-white/5'
        }`}
      >
        <Bell size={20} className={isAnimating ? 'animate-bounce' : ''} />
        {unreadCount > 0 && (
            <span className={`absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-black flex items-center justify-center text-[7px] font-bold text-white transition-transform ${isAnimating ? 'scale-125' : ''}`}>
                {unreadCount > 9 ? '9+' : unreadCount}
            </span>
        )}
      </button>

      {isOpen && (
        <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            <div className="absolute right-0 top-12 w-80 z-50 glass-card rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-white/10">
                <div className="p-5 border-b border-white/10 bg-black/40 backdrop-blur-xl flex justify-between items-center">
                    <div>
                      <h3 className="font-black text-white text-xs uppercase tracking-widest">Live Feed</h3>
                      <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-1">System Telemetry</p>
                    </div>
                    <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-lg">
                        {unreadCount} UNREAD
                    </span>
                </div>
                <div className="max-h-[350px] overflow-y-auto custom-scrollbar bg-[#050505]/95">
                    {notifications.length === 0 ? (
                        <div className="p-10 text-center text-gray-700">
                            <Bell size={32} className="mx-auto mb-4 opacity-10" />
                            <p className="font-black uppercase text-[10px] tracking-widest">Zero Messages</p>
                        </div>
                    ) : (
                        notifications.map(note => (
                            <div 
                                key={note.id} 
                                onClick={() => handleMarkRead(note.id)}
                                className={`p-5 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-all relative ${!note.read ? 'bg-emerald-500/[0.03]' : ''}`}
                            >
                                {!note.read && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                                )}
                                <div className="flex justify-between items-start mb-1.5">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                                        note.type === 'success' ? 'text-emerald-400' : 
                                        note.type === 'error' ? 'text-rose-400' : 
                                        note.type === 'warning' ? 'text-orange-400' : 'text-blue-400'
                                    }`}>{note.title}</span>
                                    <span className="text-[9px] text-gray-600 font-bold">{new Date(note.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <p className={`text-xs leading-relaxed font-medium ${!note.read ? 'text-white' : 'text-gray-500'}`}>
                                    {note.message}
                                </p>
                            </div>
                        ))
                    )}
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-full p-4 bg-white/5 text-[9px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-colors border-t border-white/5"
                >
                    Dismiss Feed
                </button>
            </div>
        </>
      )}
    </div>
  );
};
