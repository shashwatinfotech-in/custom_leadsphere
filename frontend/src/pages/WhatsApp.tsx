import { useState } from "react";
import { MessageCircle, Send, Plus, Phone, Paperclip, Smile, Search, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  online: boolean;
}

interface Message {
  id: string;
  text: string;
  time: string;
  sent: boolean;
}

const demoChats: Chat[] = [
  { id: "1", name: "Anil Kumar", lastMessage: "Sure, I'll share the event details.", time: "10:32 AM", unread: 2, avatar: "AK", online: true },
  { id: "2", name: "Meena Patel", lastMessage: "Thank you for the proposal!", time: "9:15 AM", unread: 0, avatar: "MP", online: true },
  { id: "3", name: "Vikram Singh", lastMessage: "Can we schedule a demo call?", time: "Yesterday", unread: 1, avatar: "VS", online: false },
  { id: "4", name: "Sunita Rao", lastMessage: "The campaign results look great!", time: "Yesterday", unread: 0, avatar: "SR", online: true },
  { id: "5", name: "Rajesh Nair", lastMessage: "Sending the menu catalog now.", time: "Mar 5", unread: 0, avatar: "RN", online: false },
  { id: "6", name: "Deepak Sharma", lastMessage: "Payment confirmed. Thanks!", time: "Mar 4", unread: 0, avatar: "DS", online: false },
  { id: "7", name: "Kavita Joshi", lastMessage: "Interested in the gym campaign.", time: "Mar 3", unread: 3, avatar: "KJ", online: true },
];

const demoMessages: Record<string, Message[]> = {
  "1": [
    { id: "m1", text: "Hi Anil! We have some exciting event solutions for your company.", time: "10:00 AM", sent: true },
    { id: "m2", text: "That sounds great! Can you share more details?", time: "10:15 AM", sent: false },
    { id: "m3", text: "Absolutely! I'm sending the brochure now. It covers corporate events, team building, and annual galas.", time: "10:20 AM", sent: true },
    { id: "m4", text: "Perfect, looking forward to it.", time: "10:28 AM", sent: false },
    { id: "m5", text: "Sure, I'll share the event details.", time: "10:32 AM", sent: false },
  ],
  "2": [
    { id: "m1", text: "Dear Meena, here's the admission campaign proposal for Bright Future School.", time: "8:30 AM", sent: true },
    { id: "m2", text: "Thank you for the proposal!", time: "9:15 AM", sent: false },
  ],
  "7": [
    { id: "m1", text: "Hi Kavita! We have a special member acquisition campaign for FitLife Gym.", time: "Mar 3, 2:00 PM", sent: true },
    { id: "m2", text: "Sounds interesting! What does it include?", time: "Mar 3, 2:15 PM", sent: false },
    { id: "m3", text: "It includes targeted ads, social media posts, and WhatsApp outreach to potential members in Hyderabad.", time: "Mar 3, 2:20 PM", sent: true },
    { id: "m4", text: "Interested in the gym campaign.", time: "Mar 3, 2:30 PM", sent: false },
  ],
};

const campaignStats = [
  { id: 1, template: "Event Invitation", sent: 245, delivered: 238, failed: 7, date: "2026-03-01" },
  { id: 2, template: "Follow-up Reminder", sent: 180, delivered: 175, failed: 5, date: "2026-02-27" },
  { id: 3, template: "Product Update", sent: 320, delivered: 310, failed: 10, date: "2026-02-20" },
  { id: 4, template: "Special Offer", sent: 145, delivered: 142, failed: 3, date: "2026-02-15" },
];

export default function WhatsAppPage() {
  const [selectedChat, setSelectedChat] = useState<string>("1");
  const [messageInput, setMessageInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>(demoMessages);
  const [searchChat, setSearchChat] = useState("");

  const currentChat = demoChats.find(c => c.id === selectedChat);
  const messages = chatMessages[selectedChat] || [];

  const filteredChats = demoChats.filter(c =>
    c.name.toLowerCase().includes(searchChat.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    const newMsg: Message = {
      id: `m-${Date.now()}`,
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      sent: true,
    };
    setChatMessages(prev => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), newMsg],
    }));
    setMessageInput("");

    // Simulate reply after 1.5s
    setTimeout(() => {
      const autoReply: Message = {
        id: `m-reply-${Date.now()}`,
        text: "Thanks for your message! I'll get back to you shortly. 👍",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sent: false,
      };
      setChatMessages(prev => ({
        ...prev,
        [selectedChat]: [...(prev[selectedChat] || []), autoReply],
      }));
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">WhatsApp</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage conversations and bulk messaging</p>
        </div>
        <Button size="sm">
          <Send className="w-4 h-4 mr-2" /> New Broadcast
        </Button>
      </div>

      <Tabs defaultValue="chat" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chat" className="gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> Chat</TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-1.5"><Send className="w-3.5 h-3.5" /> Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          {/* WhatsApp-style chat UI */}
          <div className="glass-card rounded-xl overflow-hidden flex" style={{ height: "520px" }}>
            {/* Chat List */}
            <div className="w-80 border-r border-border/50 flex flex-col">
              <div className="p-3 border-b border-border/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search chats..."
                    value={searchChat}
                    onChange={e => setSearchChat(e.target.value)}
                    className="pl-9 h-8 text-xs"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredChats.map(chat => (
                  <div
                    key={chat.id}
                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/40 transition-colors ${selectedChat === chat.id ? "bg-primary/10" : ""}`}
                    onClick={() => setSelectedChat(chat.id)}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-xs font-bold text-success">
                        {chat.avatar}
                      </div>
                      {chat.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{chat.name}</p>
                        <span className="text-[10px] text-muted-foreground">{chat.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                        {chat.unread > 0 && (
                          <span className="ml-1 w-5 h-5 rounded-full bg-success text-[10px] font-bold text-white flex items-center justify-center shrink-0">
                            {chat.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              {currentChat && (
                <div className="p-3 border-b border-border/50 flex items-center justify-between bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-success/20 flex items-center justify-center text-xs font-bold text-success">
                        {currentChat.avatar}
                      </div>
                      {currentChat.online && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success border-2 border-background" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{currentChat.name}</p>
                      <p className="text-[10px] text-muted-foreground">{currentChat.online ? "Online" : "Offline"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Phone className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, hsl(var(--muted)/0.3) 0%, transparent 100%)" }}>
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sent ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-xl px-3 py-2 ${msg.sent ? "bg-success/20 text-foreground rounded-br-sm" : "bg-muted rounded-bl-sm"}`}>
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${msg.sent ? "text-success/70 text-right" : "text-muted-foreground"}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-3 border-t border-border/50 flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><Smile className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><Paperclip className="w-4 h-4" /></Button>
                <Input
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message..."
                  className="h-9 text-sm"
                />
                <Button size="icon" className="h-9 w-9 shrink-0 rounded-full" onClick={handleSendMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid gap-4">
            {campaignStats.map((msg) => {
              const deliveryRate = Math.round((msg.delivered / msg.sent) * 100);
              return (
                <div key={msg.id} className="glass-card rounded-xl p-5 flex items-center justify-between animate-fade-up">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{msg.template}</h3>
                      <p className="text-xs text-muted-foreground">{msg.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-lg font-bold">{msg.sent}</p>
                      <p className="text-xs text-muted-foreground">Sent</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{deliveryRate}%</p>
                      <p className="text-xs text-muted-foreground">Delivered</p>
                    </div>
                    <Badge variant="outline" className={msg.failed > 5 ? "text-warning border-warning/20" : "text-success border-success/20"}>
                      {msg.failed} failed
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
