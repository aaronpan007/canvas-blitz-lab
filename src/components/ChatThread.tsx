import React from "react";

export type ChatMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; imageUrl: string; text?: string };

function download(url: string, name = "output.jpg") {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function ChatThread({ items }: { items: ChatMessage[] }) {
  return (
    <div className="w-full space-y-8">
      {items.map((m) =>
        m.role === "user" ? (
          <div key={m.id} className="flex flex-col gap-2 mb-4">
            <div className="text-sm text-neutral-400">User</div>
            <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4 text-neutral-100">
              {m.text}
            </div>
          </div>
        ) : (
          <div key={m.id} className="flex flex-col gap-2 mb-4">
            <div className="text-sm text-neutral-400">Model response</div>
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden">
              {/* 如果有图像URL，显示图像 */}
              {m.imageUrl ? (
                <>
                  <a href={m.imageUrl} target="_blank" rel="noreferrer">
                    <img src={m.imageUrl} alt="" className="block w-full max-w-full" />
                  </a>
                  <div className="p-4">
                    <button className="px-3 py-1.5 rounded-md bg-neutral-800 text-neutral-100 text-sm" onClick={() => download(m.imageUrl)}>下载</button>
                    {m.text ? (
                      <div className="text-sm text-neutral-400 mt-2">{m.text}</div>
                    ) : null}
                  </div>
                </>
              ) : (
                /* 如果没有图像URL，显示纯文本消息 */
                <div className="p-4">
                  <div className="text-neutral-100 whitespace-pre-wrap">{m.text || "No response"}</div>
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}