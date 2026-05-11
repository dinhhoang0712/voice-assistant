import { FaMicrophone, FaStop } from "react-icons/fa6";
import { IoSend } from "react-icons/io5";

export function ChatComposer({
  input,
  onInputChange,
  busy,
  recording,
  onSend,
  onToggleRecord,
}) {
  return (
<<<<<<< HEAD
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
      <div className="flex-1 flex gap-2 rounded-3xl border border-white/15 bg-black/30 p-2 pl-4 focus-within:ring-2 focus-within:ring-sky-500/40">
        <input
          type="text"
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/35 py-3"
=======
    <div className="flex gap-2 items-center">
      <div className="flex-1 flex gap-2 rounded-2xl border border-white/15 bg-black/30 p-1.5 pl-4 focus-within:ring-2 focus-within:ring-sky-500/40">
        <input
          type="text"
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/35 py-2"
>>>>>>> origin/thanhhoa
          placeholder="Nhập yêu cầu…"
          value={input}
          disabled={busy}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />
<<<<<<< HEAD
        <button
          type="button"
          className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
            recording
              ? "bg-red-500 text-white"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
          aria-label={recording ? "Dừng ghi âm" : "Ghi âm"}
          disabled={busy && !recording}
          onClick={onToggleRecord}
        >
          {recording ? (
            <FaStop className="w-4 h-4" />
          ) : (
            <FaMicrophone className="w-4 h-4" />
          )}
        </button>
      </div>
      <button
        type="button"
        className="sm:w-14 h-12 sm:h-14 rounded-3xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold flex items-center justify-center gap-2 px-6 sm:px-0 disabled:opacity-50"
        disabled={busy || !input.trim()}
        onClick={onSend}
      >
        <IoSend className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="sm:hidden">Gửi</span>
=======

      </div>
      <button
        type="button"
        className="w-11 h-11 shrink-0 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold flex items-center justify-center disabled:opacity-50 transition-transform active:scale-95"
        disabled={busy || !input.trim()}
        onClick={onSend}
      >
        <IoSend className="w-4 h-4" />
>>>>>>> origin/thanhhoa
      </button>
    </div>
  );
}
