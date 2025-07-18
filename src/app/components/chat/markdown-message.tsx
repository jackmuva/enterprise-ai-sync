import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { UIMessage } from 'ai';
import { Bot } from 'lucide-react';
import { SourceTile } from './source-tile';

export const MarkdownMessage = ({ m }: { m: UIMessage }) => {
  const components = {
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <pre
          {...props}
          className={`${className} text-sm w-[50dvw] overflow-x-scroll bg-zinc-100 p-3 rounded-lg mt-2 dark:bg-zinc-800`}
        >
          <code className={match[1]}>{children}</code>
        </pre>
      ) : (
        <code
          className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
          {...props}
        >
          {children}
        </code>
      );
    },
    ol: ({ node, children, ...props }: any) => {
      return (
        <ol className="list-decimal list-outside ml-4" {...props}>
          {children}
        </ol>
      );
    },
    li: ({ node, children, ...props }: any) => {
      return (
        <li className="py-1" {...props}>
          {children}
        </li>
      );
    },
    ul: ({ node, children, ...props }: any) => {
      return (
        <ul className="list-decimal list-outside ml-4" {...props}>
          {children}
        </ul>
      );
    },
    strong: ({ node, children, ...props }: any) => {
      return (
        <span className="font-semibold" {...props}>
          {children}
        </span>
      );
    },
    a: ({ node, children, ...props }: any) => {
      return (
        <a
          className="text-blue-500 hover:underline"
          target="_blank"
          rel="noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    },
  };
  return (
    <div key={m.id} className={`rounded-md p-2 ${m.role === "user" ? "bg-muted" : ""}`}>
      <div>
        <div className="font-bold flex items-center">{m.role !== "user" && <Bot className='mr-1' size={20} />}{m.role}</div>
        <div className='flex flex-col space-y-0'>
          {m.content.length > 0 ? (
            <div className="flex flex-col gap-2">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={components}
              >
                {m.content}
              </ReactMarkdown>
              {(m.toolInvocations && m.toolInvocations.length > 0) &&
                <div className='mt-4 flex flex-col space-y-2'>
                  <div className='font-bold text-xl'>Sources:</div>
                  <div className='flex flex-col space-y-2'>
                    {
                      m.toolInvocations.map((invoke) => {
                        return invoke?.result?.result?.hits?.map((hit: any) => {
                          return (
                            <SourceTile key={hit._id}
                              chunk_text={hit.fields.chunk_text}
                              source={hit.fields.source}
                              url={hit.fields.url}
                              record_name={hit.fields.record_name} />
                          );
                        }) ?? []
                      })
                    }
                  </div>
                </div>
              }
            </div>
          ) : (
            <span className="italic font-light">
              {'calling tool: ' + m?.toolInvocations?.[0].toolName}
            </span>
          )}
        </div>
      </div>
    </div>

  );
}
