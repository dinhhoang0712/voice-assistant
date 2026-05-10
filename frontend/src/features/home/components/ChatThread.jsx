export function ChatThread({ history }) {
  return (
    <div className="flex-1 min-h-[200px] max-h-[42vh] overflow-y-auto rounded-3xl border border-white/10 bg-black/25 p-4 space-y-3 mb-4">
      {history.length === 0 && (
        <p className="text-center text-white/40 text-sm py-12">
          Bắt đầu bằng một câu chào hoặc yêu cầu thử ví dụ: “Hôm nay thứ mấy?”
          hoặc “Mở YouTube”.
        </p>
      )}
      {history.map((row) => (
        <div
          key={row.id}
          className={`flex ${row.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              row.role === "user"
                ? "bg-sky-600 text-white"
                : "bg-white/10 text-white/90"
            }`}
          >
            {row.content}
          </div>
        </div>
      ))}
    </div>
  );
}
