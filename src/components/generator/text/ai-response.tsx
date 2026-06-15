'use client';

import { CopyToClipboard } from '../../copy-to-clipboard';
import { MarkdownContent } from './markdown-content';

type PropsType = {
  response: string;
  copyText?: string;
};

/** 助手回复：展示阶段与完成后均�?Markdown 渲染（部分文本经 sanitize 避免空代码块�?*/
export default function AiResponse({ response, copyText }: PropsType) {
  const fullText = copyText ?? response; // markdown during reveal + after complete

  return (
    <div className="max-w-3xl">
      <div className="not-prose bg-white dark:bg-white/5 shadow-theme-xs rounded-3xl rounded-bl-lg py-4 px-5 max-w-3xl leading-7">
        <MarkdownContent source={response} />
      </div>

      <div className="mt-3 text-gray-500 dark:text-gray-400">
        <CopyToClipboard text={fullText} />
      </div>
    </div>
  );
}

