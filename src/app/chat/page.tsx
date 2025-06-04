'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect } from 'react';

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
		<main className="w-dvw flex min-h-screen pt-24 px-3 sm:items-start">
			<div className="flex flex-col max-w-screen w-[700px] mx-auto stretch">
				<div className="space-y-4 h-full mb-36 overflow-y-scroll">
					{messages.map(m => (
						<div key={m.id} className="whitespace-pre-wrap">
							<div>
								<div className="font-bold">{m.role}</div>
								<p>
									{m.content.length > 0 ? (
										m.content
									) : (
										<span className="italic font-light">
											{'calling tool: ' + m?.toolInvocations?.[0].toolName}
										</span>
									)}
								</p>
							</div>
						</div>
					))}

					<div className="shrink-0 min-w-[24px] min-h-[24px]" />
				</div>
				<form onSubmit={handleSubmit}>
					<textarea id="chatTextArea"
						rows={3}
						className="bg-muted fixed bottom-0 w-[700px] max-w-screen p-2 mb-8 border border-gray-300 rounded shadow-xl"
						value={input}
						placeholder="Say something..."
						onChange={handleInputChange}
					/>
				</form>
			</div>
		</main>
	);
}
