import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

const MarkdownRenderer = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          
          if (inline) {
            return (
              <code 
                className="bg-gray-900 text-gray-200 px-1.5 py-0.5 rounded-md text-sm font-mono" 
                {...props}
              >
                {children}
              </code>
            );
          }
          
          return match ? (
            <div className="my-4 inline-block max-w-full">
              <SyntaxHighlighter
                style={materialDark}
                language={match[1]}
                PreTag="div"
                className="rounded-lg overflow-x-auto text-sm inline-block max-w-full"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            </div>
          ) : (
            <pre 
              className="bg-gray-900 text-gray-200 px-2 py-1 rounded-lg inline-block max-w-full text-sm font-mono my-1"
            >
              <code {...props}>{children}</code>
            </pre>
          );
        },
        h1: ({ node, ...props }) => (
          <h1 className="text-3xl font-bold mb-4 border-b pb-2" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-2xl font-semibold mb-3 border-b pb-1" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-xl font-semibold mb-2" {...props} />
        ),
        a: ({ node, ...props }) => (
          <a 
            className="text-blue-600 hover:underline" 
            target="_blank" 
            rel="noopener noreferrer" 
            {...props} 
          />
        ),
        ul: ({ node, ...props }) => (
          <ul className="list-disc pl-5 mb-3" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal pl-5 mb-3" {...props} />
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote 
            className="border-l-4 border-gray-300 pl-4 py-2 my-4 italic text-gray-600" 
            {...props} 
          />
        ),
        table: ({ node, ...props }) => (
          <table 
            className="w-full border-collapse border border-gray-300 mb-4" 
            {...props} 
          />
        ),
        th: ({ node, ...props }) => (
          <th 
            className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold" 
            {...props} 
          />
        ),
        td: ({ node, ...props }) => (
          <td 
            className="border border-gray-300 px-4 py-2" 
            {...props} 
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;