
import MainLayout from "@/components/layout/MainLayout";
import ChatInterface from "@/components/communication/ChatInterface";

const MessagingPage = () => {
  return (
    <MainLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6">Communications</h1>
        <ChatInterface />
      </div>
    </MainLayout>
  );
};

export default MessagingPage;
