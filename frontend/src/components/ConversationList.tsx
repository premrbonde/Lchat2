import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, UserPlus, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  isTyping?: boolean;
}

// Mock data
const conversations: Conversation[] = [
  {
    id: "1",
    name: "Alice Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b9d2adb6?w=150",
    lastMessage: "Hey! How's the translation feature coming along?",
    lastMessageTime: "2m",
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: "2", 
    name: "Bob Wilson",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150",
    lastMessage: "मुझे वह दस्तावेज़ चाहिए",
    lastMessageTime: "5m",
    unreadCount: 0,
    isOnline: false,
    isTyping: true,
  },
  {
    id: "3",
    name: "Carol Davis", 
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    lastMessage: "Thanks for the help yesterday!",
    lastMessageTime: "1h",
    unreadCount: 0,
    isOnline: true,
  },
];

interface ConversationListProps {
  selectedConversationId?: string;
  onConversationSelect: (conversationId: string) => void;
}

export function ConversationList({ selectedConversationId, onConversationSelect }: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 border-r bg-card/30 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Chats</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary h-9"
          />
        </div>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => onConversationSelect(conversation.id)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-muted/50 group",
                selectedConversationId === conversation.id && "bg-primary/10 border border-primary/20"
              )}
            >
              {/* Avatar with status */}
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={conversation.avatar} />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                    {conversation.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Online status */}
                <div className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background",
                  conversation.isOnline ? "bg-status-online" : "bg-status-offline"
                )} />
              </div>

              {/* Conversation Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-sm truncate">{conversation.name}</h3>
                  <span className="text-xs text-muted-foreground">{conversation.lastMessageTime}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {conversation.isTyping ? (
                      <div className="flex items-center text-xs text-primary">
                        <div className="typing-indicator mr-2">
                          <span>●</span>
                          <span>●</span>
                          <span>●</span>
                        </div>
                        typing...
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground truncate">
                        {conversation.lastMessage}
                      </p>
                    )}
                  </div>
                  
                  {conversation.unreadCount > 0 && (
                    <Badge className="ml-2 h-5 min-w-[20px] bg-primary text-primary-foreground text-xs">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}