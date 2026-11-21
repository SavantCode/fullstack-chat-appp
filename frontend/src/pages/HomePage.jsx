import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import ContactDetailPanel from "../components/ContactDetailPanel";

const HomePage = () => {
  const { selectedUser, isRightPanelOpen } = useChatStore();

  return (
    <div className="h-screen w-screen overflow-hidden bg-base-300 flex">
      <div className="flex w-full h-full overflow-hidden bg-base-100">
        {/* Left Navigation Rail + Messages Sidebar */}
        <Sidebar />

        {/* Center Chat Canvas */}
        {!selectedUser ? <NoChatSelected /> : <ChatContainer />}

        {/* Right Colleague Info, Custom Labels, Shared Media & Links Panel */}
        {selectedUser && isRightPanelOpen && <ContactDetailPanel />}
      </div>
    </div>
  );
};
export default HomePage;