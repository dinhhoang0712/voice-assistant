import { useEffect, useRef } from "react";
import axios from "axios";

export function ReminderBanner({
  message,
  reminderId,
  ackLoading,
  onAcknowledge,
  onDismiss,
}) {
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!message) return;

    const speakReminder = async () => {
      try {
        // stop audio cũ
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }

        const response = await axios.post(
          "/api/assistant/speak",
          {
            text: message,
          },
          {
            responseType: "blob",
          },
        );

        const audioUrl = URL.createObjectURL(response.data);

        const audio = new Audio(audioUrl);

        audioRef.current = audio;

        await audio.play();
      } catch (err) {
        console.error("Speak reminder failed:", err);
      }
    };

    // đọc ngay
    speakReminder();

    // đọc lại mỗi 10 giây
    intervalRef.current = setInterval(() => {
      speakReminder();
    }, 10000);

    return () => {
      clearInterval(intervalRef.current);

      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [message]);

  const stopReminder = () => {
    clearInterval(intervalRef.current);

    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleDismiss = () => {
    stopReminder();
    onDismiss?.();
  };

  const handleAcknowledge = () => {
    stopReminder();
    onAcknowledge?.();
  };

  if (!message) return null;

  return (
    <div
      className="mb-3 rounded-2xl border border-amber-400/50 bg-amber-500/15 px-4 py-3 text-sm text-amber-50 flex flex-col sm:flex-row sm:items-center gap-3"
      role="status"
    >
      <p className="flex-1">{message}</p>

      <div className="flex gap-2 shrink-0">
        {reminderId != null && (
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-amber-400 text-slate-900 text-xs font-semibold disabled:opacity-50"
            disabled={ackLoading}
            onClick={handleAcknowledge}
          >
            {ackLoading ? "…" : "Đã nhận"}
          </button>
        )}

        <button
          type="button"
          className="px-4 py-2 rounded-xl bg-white/15 text-xs"
          onClick={handleDismiss}
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
