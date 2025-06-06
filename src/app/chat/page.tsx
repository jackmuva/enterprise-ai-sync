'use client';

import { useChat } from '@ai-sdk/react';
import { Bot } from 'lucide-react';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { SourceTile } from '../components/chat/source-tile';
import { Chat } from '../components/chat/chat';

export default function ChatPage() {
	return (
		<main className="w-dvw h-screen flex pt-28 px-3">
			<Chat />
		</main>
	);
}
