'use client';

import type { UseChatHelpers } from '@ai-sdk/react';
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useStickToBottom } from 'use-stick-to-bottom';
import { AssistantMessage } from './text/assistant-message';
import AiResponse from './text/ai-response';
import UserMessage from './text/user-message';

type PropsType = {
  useChat: UseChatHelpers & {
    addToolResult: ({
      toolCallId,
      result,
    }: {
      toolCallId: string;
      result: unknown;
    }) => void;
  };
  isThinking: boolean;
  onEditResubmit?: (messageId: string, newMessage: string) => Promise<void> | void;
  animatingAnswerMessageId?: string | null;
  onAnswerRevealComplete?: () => void;
};

type ChatPartLike = { type?: string; text?: string };
type ChatMessageLike = {
  id: string;
  role?: string;
  parts?: ChatPartLike[];
  modelLabel?: string;
  modelAuthorIcon?: string | null;
};

export function RenderMessage({
  useChat,
  isThinking,
  onEditResubmit,
  animatingAnswerMessageId = null,
  onAnswerRevealComplete,
}: PropsType) {
  const { messages, setMessages, error } = useChat;
  const { contentRef, scrollRef, scrollToBottom } = useStickToBottom({
    resize: 'instant',
    initial: 'instant',
  });
  const scrollToBottomRef = useRef(scrollToBottom);
  scrollToBottomRef.current = scrollToBottom;

  const stickChatToBottom = useCallback((force = false) => {
    void scrollToBottomRef.current({
      animation: 'instant',
      ignoreEscapes: force,
    });
  }, []);

  useEffect(() => {
    stickChatToBottom(true);
  }, [messages, isThinking, stickChatToBottom]);

  useEffect(() => {
    if (error?.message.includes('Incorrect API')) {
      toast.error('Incorrect API key provided', {
        description: 'Please check your API key and try again.',
      });
    }
  }, [error]);

  return (
    <div
      className="min-h-0 flex-1 overflow-y-auto custom-scrollbar px-5 pt-12 pb-6 md:px-12"
      ref={scrollRef}
    >
      <div
        className="text-gray-800 dark:text-white/90 space-y-6 max-w-none prose dark:prose-invert"
        ref={contentRef}
      >
        {messages.map((message, messageIdx) => {
          const m = message as unknown as ChatMessageLike;
          const role = m.role;
          const parts = (m.parts ?? []) as ChatPartLike[];

          if (role === 'user') {
            const textPart = parts.find((p) => p?.type === 'text');
            if (!textPart?.text) return <div key={message.id} />;
            return (
              <div key={message.id}>
                <UserMessage
                  message={textPart.text}
                  showActions={
                    messages.length - 1 === messageIdx ||
                    messages.length - 2 === messageIdx
                  }
                  onEdit={async (newMessage) => {
                    if (onEditResubmit) {
                      await onEditResubmit(message.id, newMessage);
                      return;
                    }

                    setMessages((prev) =>
                      prev.map((prevMsg) => {
                        if (prevMsg.id !== message.id) return prevMsg;
                        return {
                          ...prevMsg,
                          parts: prevMsg.parts?.map((part) => ({
                            ...part,
                            text: newMessage,
                          })),
                        };
                      })
                    );
                  }}
                />
              </div>
            );
          }

          if (role === 'assistant') {
            const reasoning = parts.find((p) => p?.type === 'reasoning')?.text ?? '';
            const answer = parts.find((p) => p?.type === 'text')?.text ?? '';
            const animateAnswer = animatingAnswerMessageId === message.id;
            return (
              <AssistantMessage
                key={message.id}
                messageId={message.id}
                reasoning={reasoning}
                answer={answer}
                modelLabel={m.modelLabel}
                modelAuthorIcon={m.modelAuthorIcon}
                animateAnswer={animateAnswer}
                onRevealComplete={
                  animateAnswer ? onAnswerRevealComplete : undefined
                }
                onRevealProgress={
                  animateAnswer ? () => stickChatToBottom(true) : undefined
                }
              />
            );
          }

          return (
            <div key={message.id}>
              <AiResponse response={parts.find((p) => p?.type === 'text')?.text ?? ''} />
            </div>
          );
        })}

        {isThinking && (
          <div className="text-gray-500 font-medium">
            💭 Model is thinking...
          </div>
        )}
        <div aria-hidden className="h-px w-full shrink-0" />
      </div>
    </div>
  );
}
