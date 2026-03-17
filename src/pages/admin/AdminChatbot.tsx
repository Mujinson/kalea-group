import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Bot, MessageSquare, Users, TrendingUp, Globe, Instagram, MessageCircle } from "lucide-react";

const CHANNEL_ICONS: Record<string, any> = {
  website: Globe,
  instagram: Instagram,
  whatsapp: MessageCircle,
  facebook: MessageSquare,
};

const CHANNEL_COLORS: Record<string, string> = {
  website: "bg-blue-100 text-blue-700",
  instagram: "bg-pink-100 text-pink-700",
  whatsapp: "bg-green-100 text-green-700",
  facebook: "bg-indigo-100 text-indigo-700",
};

const AdminChatbot = () => {
  const { data: conversations } = useQuery({
    queryKey: ["chatbot-conversations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chatbot_conversations")
        .select("*, leads(name, company_name), chatbot_messages(id, role, content, created_at)")
        .order("updated_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const totalConversations = conversations?.length || 0;
  const convertedLeads = conversations?.filter(c => c.lead_id).length || 0;
  const channelBreakdown = conversations?.reduce((acc: Record<string, number>, c) => {
    acc[c.channel] = (acc[c.channel] || 0) + 1;
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Chatbot</h1>
        <p className="text-muted-foreground text-sm mt-1">Monitora le conversazioni del chatbot AI su tutti i canali</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalConversations}</p>
              <p className="text-xs text-muted-foreground">Conversazioni</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{convertedLeads}</p>
              <p className="text-xs text-muted-foreground">Lead convertiti</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {totalConversations > 0 ? Math.round((convertedLeads / totalConversations) * 100) : 0}%
              </p>
              <p className="text-xs text-muted-foreground">Tasso conversione</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Bot className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{Object.keys(channelBreakdown).length}</p>
              <p className="text-xs text-muted-foreground">Canali attivi</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Channel breakdown */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(channelBreakdown).map(([channel, count]) => {
          const Icon = CHANNEL_ICONS[channel] || Globe;
          return (
            <Badge key={channel} variant="outline" className={`${CHANNEL_COLORS[channel] || ""} gap-1.5 px-3 py-1.5`}>
              <Icon className="w-3.5 h-3.5" /> {channel}: {count}
            </Badge>
          );
        })}
      </div>

      {/* Conversations list */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Conversazioni recenti</h2>
        {conversations?.map((conv) => {
          const messages = conv.chatbot_messages || [];
          const lastMsg = messages[messages.length - 1];
          const Icon = CHANNEL_ICONS[conv.channel] || Globe;

          return (
            <Card key={conv.id} className="bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${CHANNEL_COLORS[conv.channel] || "bg-gray-100"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">
                          {conv.leads ? (conv.leads.company_name || conv.leads.name) : `Sessione ${conv.session_id.slice(0, 8)}...`}
                        </p>
                        {conv.lead_id && <Badge className="bg-green-100 text-green-700 text-[10px]">Lead creato</Badge>}
                      </div>
                      {lastMsg && (
                        <p className="text-xs text-muted-foreground mt-1 truncate max-w-[400px]">
                          {lastMsg.role === "assistant" ? "🤖 " : "👤 "}
                          {lastMsg.content}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {messages.length} messaggi • {format(new Date(conv.created_at), "dd MMM yyyy HH:mm", { locale: it })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{conv.status}</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {(!conversations || conversations.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">
            <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nessuna conversazione ancora. Il chatbot è attivo sul sito!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatbot;
