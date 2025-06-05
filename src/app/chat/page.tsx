'use client';

import { useChat } from '@ai-sdk/react';
import { Bot } from 'lucide-react';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

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
										<div className="prose prose-sm max-w-none dark:prose-invert mt-2 leading-tight">
											<ReactMarkdown
												remarkPlugins={[remarkGfm]}
												rehypePlugins={[rehypeRaw]}
												components={{
													h1: ({ children }) => <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{children}</h1>,
													h2: ({ children }) => <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{children}</h2>,
													h3: ({ children }) => <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{children}</h3>,
													h4: ({ children }) => <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">{children}</h4>,
													p: ({ children }) => <p className="text-gray-700 dark:text-gray-300 leading-tight">{children}</p>,
													ul: ({ children }) => <ul className="list-disc pl-6 space-y-0">{children}</ul>,
													ol: ({ children }) => <ol className="list-decimal pl-6 space-y-0">{children}</ol>,
													li: ({ children }) => <li className="text-gray-700 dark:text-gray-300 leading-tight">{children}</li>,
													blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-0.5 text-gray-600 dark:text-gray-400 leading-tight">{children}</blockquote>,
													code: ({ children, className }) => {
														const isInline = !className;
														if (isInline) {
															return <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-gray-200">{children}</code>;
														}
														return <code className={className}>{children}</code>;
													},
													pre: ({ children }) => <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg overflow-x-auto my-0.5 border">{children}</pre>,
													strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-gray-100">{children}</strong>,
													em: ({ children }) => <em className="italic text-gray-700 dark:text-gray-300">{children}</em>,
													a: ({ children, href }) => <a href={href} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
													table: ({ children }) => <div className="overflow-x-auto my-0.5"><table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">{children}</table></div>,
													thead: ({ children }) => <thead className="bg-gray-50 dark:bg-gray-700">{children}</thead>,
													tbody: ({ children }) => <tbody>{children}</tbody>,
													tr: ({ children }) => <tr className="border-b border-gray-300 dark:border-gray-600">{children}</tr>,
													th: ({ children }) => <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-100">{children}</th>,
													td: ({ children }) => <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">{children}</td>,
												}}
											>
												{m.content}
											</ReactMarkdown>
										</div>
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
