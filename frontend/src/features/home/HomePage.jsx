import { useHomeAssistant } from "./useHomeAssistant";
import { HomeHeader } from "./components/HomeHeader";
import { HomeDrawer } from "./components/HomeDrawer";
import { HomeHero } from "./components/HomeHero";
import { ReminderBanner } from "./components/ReminderBanner";
import { ChatThread } from "./components/ChatThread";
import { ChatComposer } from "./components/ChatComposer";

export default function HomePage() {
  const {
    userData,
    logout,
    navigate,
    drawerOpen,
    setDrawerOpen,
    history,
    input,
    setInput,
    busy,
    recording,
    speaking,
    error,
    reminderToast,
    ackLoading,
    assistantLabel,
    avatarSrc,
    sendText,
    toggleRecording,
    dismissReminder,
    acknowledgeReminder,
  } = useHomeAssistant();

  const handleLogout = async () => {
    await logout();
    navigate("/signin");
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#030a1a] via-[#0a1628] to-black text-white flex flex-col">
      <HomeHeader
        userName={userData?.name}
        avatarSrc={avatarSrc}
        onOpenDrawer={() => setDrawerOpen(true)}
        onCustomize={() => navigate("/customize")}
        onLogout={handleLogout}
      />

      <HomeDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCustomize={() => navigate("/customize")}
        onLogout={handleLogout}
        history={history}
        assistantLabel={assistantLabel}
      />

      <main className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-4 pb-6 pt-4">
        <HomeHero
          assistantLabel={assistantLabel}
          avatarSrc={avatarSrc}
          recording={recording}
          speaking={speaking}
          busy={busy}
        />

        {reminderToast && (
          <ReminderBanner
            message={reminderToast.message}
            reminderId={reminderToast.reminderId}
            ackLoading={ackLoading}
            onAcknowledge={acknowledgeReminder}
            onDismiss={dismissReminder}
          />
        )}

        {error && (
          <div className="mb-3 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <ChatThread history={history} />

        <ChatComposer
          input={input}
          onInputChange={setInput}
          busy={busy}
          recording={recording}
          onSend={() => {
            sendText(input);
            setInput("");
          }}
          onToggleRecord={toggleRecording}
        />
      </main>
    </div>
  );
}
