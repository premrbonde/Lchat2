import { useState } from "react";
import { Header } from "@/components/Header";
import { ConversationList } from "@/components/ConversationList";
import { ChatArea } from "@/components/ChatArea";

const Index = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string>();

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <ConversationList 
          selectedConversationId={selectedConversationId}
          onConversationSelect={setSelectedConversationId}
        />
        <ChatArea conversationId={selectedConversationId} />
      </div>
    </div>
  );
};

export default Index;
