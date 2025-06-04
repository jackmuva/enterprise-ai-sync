'use client';

import { useChat } from '@ai-sdk/react';
import { Bot } from 'lucide-react';
import { useEffect } from 'react';
import Markdown from 'react-markdown';

export default function Chat() {
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
		<main className="w-dvw h-screen flex pt-28 px-3">
			<div className="flex flex-col max-w-screen w-[700px] mx-auto h-full">
				<div className="space-y-4 flex-1 overflow-y-auto pr-2">
					{messages.map(m => (
						<div key={m.id} className={`rounded-md p-2 whitespace-pre-wrap ${m.role === "user" ? "bg-muted" : ""}`}>
							<div>
								<div className="font-bold flex items-center">{m.role !== "user" && <Bot className='mr-1' size={20} />}{m.role}</div>
								<div className='flex flex-col space-y-0'>
									{m.content.length > 0 ? (
										<Markdown>
											{m.content}
										</Markdown>
									) : (
										<span className="italic font-light">
											{'calling tool: ' + m?.toolInvocations?.[0].toolName}
										</span>
									)}
								</div>
							</div>
						</div>
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
		</main>
	);
}
