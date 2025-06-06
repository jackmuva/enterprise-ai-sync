import { useChat } from "@ai-sdk/react";
import { useEffect } from "react";
import { MarkdownMessage } from "./markdown-message";

export const Chat = () => {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    maxSteps: 3
  });

  useEffect(() => {
    const chatTextArea = document.getElementById("chatTextArea");
    if (!chatTextArea) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();

        handleSubmit(e as any);
      }
    };

    chatTextArea.addEventListener("keypress", handleKeyPress);

    return () => {
      chatTextArea.removeEventListener("keypress", handleKeyPress);
    };
  }, [handleSubmit]);

  return (
    <div className="flex flex-col max-w-screen w-[700px] mx-auto h-full">
      <div className="space-y-4 flex-1 overflow-y-auto pr-2">
        {messages.map(m => (
          <MarkdownMessage m={m} key={m.id} />
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex-shrink-0 py-4">
        <textarea id="chatTextArea"
          rows={3}
          className="bg-muted w-full p-2 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  )
}
