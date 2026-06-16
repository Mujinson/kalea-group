import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';

const NotificationsBell = () => {
  const { items, unreadCount, markAllRead, markRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) markAllRead();
  };

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="relative text-white/80 hover:text-white p-2"
        aria-label="Notifiche"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-[#DC2626] text-white text-[10px] font-semibold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-[320px] max-h-[70vh] overflow-auto bg-white rounded-xl shadow-2xl border border-[#E5E2DD]">
            <div className="px-4 py-3 border-b border-[#E5E2DD]">
              <p className="text-[13px] font-semibold text-[#1E1B4B]">Notifiche</p>
            </div>
            {items.length === 0 ? (
              <div className="p-6 text-center text-[13px] text-[#8C7B6B]">Nessuna notifica</div>
            ) : (
              <ul className="divide-y divide-[#F1EEE9]">
                {items.map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => {
                        markRead(n.id);
                        setOpen(false);
                        if (n.link) navigate(n.link);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-[#FAF7F2] flex gap-2"
                    >
                      {!n.read_at && <span className="mt-1.5 w-2 h-2 rounded-full bg-[#1E1B4B] shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[#1E1B4B] truncate">{n.title}</p>
                        {n.body && <p className="text-[12px] text-[#6B6258] truncate">{n.body}</p>}
                        <p className="text-[11px] text-[#A89B8E] mt-1">
                          {new Date(n.created_at).toLocaleString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsBell;
