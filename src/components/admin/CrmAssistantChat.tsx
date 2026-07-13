import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Plus, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

type ChatMessage =
  | { id: string; role: 'user'; content: string }
  | { id: string; role: 'assistant'; content: string }
  | { id: string; role: 'error'; content: string; retryOf: string };

const uid = () => Math.random().toString(36).slice(2, 10);

export default function CrmAssistantChat({ bottomOffset = 24 }: { bottomOffset?: number } = {}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Apri assistente CRM"
        title="Assistente CRM"
        className="fixed right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
        style={{
          bottom: bottomOffset,
          background: 'linear-gradient(135deg, #1E1B4B 0%, #2A1F5C 100%)',
          color: '#F5F1E8',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
          <SheetHeader
            className="px-5 py-4 border-b shrink-0"
            style={{ background: 'linear-gradient(180deg, #1E1B4B 0%, #2A1F5C 100%)' }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #C4A882 0%, #8B6F4E 100%)', color: '#1E1B4B' }}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <SheetTitle className="text-[16px] font-semibold" style={{ color: '#F5F1E8' }}>
                  Assistente CRM
                </SheetTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewConversation}
                className="text-white/80 hover:text-white hover:bg-white/10 h-8 px-2 text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Nuova
              </Button>
            </div>
          </SheetHeader>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: '#F5F0EA' }}>
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
                      style={{ background: '#1E1B4B', color: '#F5F1E8' }}
                    >
                      {m.content}
                    </div>
                  </div>
                );
              }
              if (m.role === 'assistant') {
                return (
                  <div key={m.id} className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm px-3.5 py-2 text-sm whitespace-pre-wrap break-words bg-white text-[#1E1B4B] border border-black/5 shadow-sm">
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
                    <span className="w-2 h-2 rounded-full bg-[#1E1B4B]/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#1E1B4B]/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#1E1B4B]/40 animate-bounce" style={{ animationDelay: '300ms' }} />
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
                style={{ background: '#1E1B4B', color: '#F5F1E8' }}
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
