import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Smile, 
  Paperclip, 
  MoreVertical, 
  Languages,
  Volume2,
  Copy,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  text: string;
  translatedText?: string;
  sender: "me" | "other";
  timestamp: string;
  isTranslated?: boolean;
  originalLanguage?: string;
  targetLanguage?: string;
  isSarcasm?: boolean;
}

interface ChatAreaProps {
  conversationId?: string;
}

// Mock messages
const messages: Message[] = [
  {
    id: "1",
    text: "Hey! How's your day going?",
    sender: "other",
    timestamp: "10:30 AM",
  },
  {
    id: "2", 
    text: "Pretty good! Just working on this new translation app. It's lit! 🔥",
    translatedText: "Pretty good! Just working on this new translation app. It's amazing! 🔥",
    sender: "me",
    timestamp: "10:32 AM",
    isTranslated: true,
    isSarcasm: false,
    originalLanguage: "en",
    targetLanguage: "en"
  },
  {
    id: "3",
    text: "That sounds interesting! What features are you adding?",
    sender: "other", 
    timestamp: "10:33 AM",
  },
  {
    id: "4",
    text: "Well, it can translate messages in real-time, detect sarcasm, and expand shortforms like 'idk' to 'I don't know'",
    sender: "me",
    timestamp: "10:35 AM",
  },
  {
    id: "5",
    text: "वह बहुत अच्छा लगता है! मैं इसे आज़माना चाहूंगा।",
    translatedText: "That sounds very good! I would like to try it.",
    sender: "other",
    timestamp: "10:37 AM",
    isTranslated: true,
    originalLanguage: "hi",
    targetLanguage: "en"
  }
];

const supportedLanguages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", flag: "🇮🇳" },
  { code: "te", name: "Telugu", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", flag: "🇮🇳" },
];

export function ChatArea({ conversationId }: ChatAreaProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isTranslationEnabled, setIsTranslationEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // In a real app, this would send the message via API/WebSocket
    console.log("Sending message:", newMessage);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center">
            <Languages className="h-8 w-8 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Welcome to VoxTranslate</h3>
          <p className="text-muted-foreground max-w-sm">
            Select a conversation to start chatting with real-time translation
          </p>
        </div>
      </div>
    );
  }

  const selectedLang = supportedLanguages.find(lang => lang.code === selectedLanguage);

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b9d2adb6?w=150" />
            <AvatarFallback>AJ</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">Alice Johnson</h3>
            <p className="text-sm text-muted-foreground">Online</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Translation Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={isTranslationEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setIsTranslationEnabled(!isTranslationEnabled)}
              className="h-8"
            >
              <Languages className="h-4 w-4 mr-1" />
              {isTranslationEnabled ? "ON" : "OFF"}
            </Button>
            
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {selectedLang?.flag} {selectedLang?.name}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {supportedLanguages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={cn(
                      selectedLanguage === lang.code && "bg-primary/10"
                    )}
                  >
                    {lang.flag} {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 max-w-[80%] animate-message-slide-in",
                message.sender === "me" ? "ml-auto flex-row-reverse" : ""
              )}
            >
              {message.sender === "other" && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b9d2adb6?w=150" />
                  <AvatarFallback>AJ</AvatarFallback>
                </Avatar>
              )}
              
              <div className={cn(
                "group relative",
                message.sender === "me" ? "text-right" : ""
              )}>
                <div
                  className={cn(
                    "inline-block px-4 py-2 rounded-2xl text-sm shadow-chat transition-all duration-200 hover:shadow-lg",
                    message.sender === "me"
                      ? "bg-chat-sent text-chat-sent-foreground rounded-br-md"
                      : "bg-chat-received text-chat-received-foreground rounded-bl-md"
                  )}
                >
                  <p className="leading-relaxed">{message.text}</p>
                  
                  {/* Translated text */}
                  {message.isTranslated && message.translatedText && isTranslationEnabled && (
                    <div className="mt-2 pt-2 border-t border-current/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Languages className="h-3 w-3 opacity-70" />
                        <span className="text-xs opacity-70">Translated</span>
                        {message.isSarcasm && (
                          <Badge variant="secondary" className="text-xs h-4">
                            Sarcasm
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm opacity-90 italic">
                        {message.translatedText}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Message actions */}
                <div className={cn(
                  "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1",
                  message.sender === "me" ? "right-full mr-2" : "left-full ml-2"
                )}>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Volume2 className="h-3 w-3" />
                  </Button>
                </div>
                
                <p className={cn(
                  "text-xs text-muted-foreground mt-1",
                  message.sender === "me" ? "text-right" : ""
                )}>
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t bg-card/30 backdrop-blur-sm">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="pr-20 py-3 rounded-full bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Smile className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            variant="gradient"
            size="icon"
            className="h-10 w-10 rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}