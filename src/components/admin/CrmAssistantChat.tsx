import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Plus, AlertCircle, RefreshCw, Sparkles, X, Move } from 'lucide-react';

type ChatMessage =
  | { id: string; role: 'user'; content: string }
  | { id: string; role: 'assistant'; content: string }
  | { id: string; role: 'error'; content: string; retryOf: string };

const uid = () => Math.random().toString(36).slice(2, 10);

const BUTTON_SIZE = 56;
const VIEWPORT_MARGIN = 12;
const POSITION_STORAGE_KEY = 'crm-assistant-button-position';

type ButtonPosition = { x: number; y: number };
type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  moved: boolean;
};

const clampPosition = ({ x, y }: ButtonPosition): ButtonPosition => ({
  x: Math.min(Math.max(VIEWPORT_MARGIN, x), Math.max(VIEWPORT_MARGIN, window.innerWidth - BUTTON_SIZE - VIEWPORT_MARGIN)),
  y: Math.min(Math.max(VIEWPORT_MARGIN, y), Math.max(VIEWPORT_MARGIN, window.innerHeight - BUTTON_SIZE - VIEWPORT_MARGIN)),
});

const initialButtonPosition = (bottomOffset: number): ButtonPosition => {
  const fallback = clampPosition({
    x: window.innerWidth - BUTTON_SIZE - 24,
    y: window.innerHeight - BUTTON_SIZE - Math.max(96, bottomOffset),
  });

  try {
    const saved = JSON.parse(window.localStorage.getItem(POSITION_STORAGE_KEY) || 'null');
    if (Number.isFinite(saved?.x) && Number.isFinite(saved?.y)) return clampPosition(saved);
  } catch {
    // A blocked storage must not prevent the assistant from opening.
  }
  return fallback;
};

const saveButtonPosition = (position: ButtonPosition) => {
  try {
    window.localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(position));
  } catch {
    // The new position still applies for the current session.
  }
};

export default function CrmAssistantChat({ bottomOffset = 24 }: { bottomOffset?: number } = {}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [buttonPosition, setButtonPosition] = useState<ButtonPosition>(() => initialButtonPosition(bottomOffset));
  const [isDragging, setIsDragging] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    const keepButtonVisible = () => setButtonPosition((position) => clampPosition(position));
    window.addEventListener('resize', keepButtonVisible);
    return () => window.removeEventListener('resize', keepButtonVisible);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendText = async (text: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('crm-assistant', {
        body: { message: text, conversation_id: conversationId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.conversation_id) setConversationId(data.conversation_id);
      const reply = (data?.reply as string) || 'Nessuna risposta ricevuta.';
      setMessages((m) => [...m, { id: uid(), role: 'assistant', content: reply }]);
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        {
          id: uid(),
          role: 'error',
          content: e?.message || 'Errore nella richiesta all\'assistente.',
          retryOf: text,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages((m) => [...m, { id: uid(), role: 'user', content: text }]);
    await sendText(text);
  };

  const handleRetry = async (text: string) => {
    if (loading) return;
    await sendText(text);
  };

  const handleNewConversation = () => {
    setMessages([]);
    setConversationId(undefined);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleDragStart = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: buttonPosition.x,
      originY: buttonPosition.y,
      moved: false,
    };
  };

  const handleDragMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(deltaX, deltaY) < 5) return;

    drag.moved = true;
    setIsDragging(true);
    event.preventDefault();
    setButtonPosition(clampPosition({ x: drag.originX + deltaX, y: drag.originY + deltaY }));
  };

  const handleDragEnd = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    setIsDragging(false);
    if (drag.moved) {
      setButtonPosition((position) => {
        saveButtonPosition(position);
        return position;
      });
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
  };

  const handlePositionKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const directions: Record<string, ButtonPosition> = {
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
    };
    const direction = directions[event.key];
    if (!direction) return;

    event.preventDefault();
    const distance = event.shiftKey ? 48 : 12;
    setButtonPosition((position) => {
      const next = clampPosition({
        x: position.x + direction.x * distance,
        y: position.y + direction.y * distance,
      });
      saveButtonPosition(next);
      return next;
    });
  };

  return (
    <>
      {/* Floating button: drag to move, click to open. Position is remembered. */}
      <button
        ref={buttonRef}
        onClick={() => {
          if (suppressClickRef.current) {
            suppressClickRef.current = false;
            return;
          }
          setOpen(true);
        }}
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
        onKeyDown={handlePositionKeyDown}
        aria-label="Apri assistente CRM. Trascina per spostare il pulsante"
        title="Assistente CRM · trascina per spostare"
        className={`fixed z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform touch-none select-none ${isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:scale-105'}`}
        style={{
          left: buttonPosition.x,
          top: buttonPosition.y,
          background: 'linear-gradient(135deg, #0F172A 0%, #2A1F5C 100%)',
          color: '#F5F1E8',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute -right-1 -top-1 w-5 h-5 rounded-full bg-background text-foreground ring-1 ring-border flex items-center justify-center" aria-hidden="true">
          <Move className="w-3 h-3" />
        </span>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col [&>button]:hidden">
          <SheetHeader
            className="px-5 py-4 border-b shrink-0"
            style={{
              background: 'linear-gradient(180deg, #0F172A 0%, #2A1F5C 100%)',
              paddingTop: 'calc(1rem + env(safe-area-inset-top))',
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, #C4A882 0%, #8B6F4E 100%)', color: '#0F172A' }}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <SheetTitle className="text-[16px] font-semibold truncate" style={{ color: '#F5F1E8' }}>
                  Assistente CRM
                </SheetTitle>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNewConversation}
                  className="text-white/80 hover:text-white hover:bg-white/10 h-9 px-2 text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Nuova
                </Button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Chiudi assistente"
                  className="h-9 w-9 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </SheetHeader>


          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: '#F1F5F9' }}>
            {messages.length === 0 && !loading && (
              <div className="text-center text-sm text-muted-foreground mt-8 px-6">
                Chiedi qualcosa al tuo assistente CRM: lead, preventivi, cantieri, disponibilità squadre, sconti…
              </div>
            )}

            {messages.map((m) => {
              if (m.role === 'user') {
                return (
                  <div key={m.id} className="flex justify-end">
                    <div
                      className="max-w-[80%] rounded-2xl rounded-tr-sm px-3.5 py-2 text-sm whitespace-pre-wrap break-words"
                      style={{ background: '#0F172A', color: '#F5F1E8' }}
                    >
                      {m.content}
                    </div>
                  </div>
                );
              }
              if (m.role === 'assistant') {
                return (
                  <div key={m.id} className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm px-3.5 py-2 text-sm whitespace-pre-wrap break-words bg-crm-primary text-white shadow-crm-sm border border-black/5 shadow-sm">
                      {m.content}
                    </div>
                  </div>
                );
              }
              // error
              return (
                <div key={m.id} className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm px-3.5 py-2 text-sm bg-destructive/10 text-destructive border border-destructive/20">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <div>{m.content}</div>
                        <button
                          onClick={() => handleRetry(m.retryOf)}
                          className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium hover:underline"
                          disabled={loading}
                        >
                          <RefreshCw className="w-3 h-3" />
                          Riprova
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-white border border-black/5 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-2 h-2 rounded-full bg-[#0F172A]/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#0F172A]/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#0F172A]/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t bg-white p-3 shrink-0">
            <div className="flex gap-2 items-end">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Chiedi qualcosa al tuo assistente CRM..."
                disabled={loading}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                size="icon"
                style={{ background: '#0F172A', color: '#F5F1E8' }}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
