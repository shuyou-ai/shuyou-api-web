'use client';

import { TextGeneratorStudio } from '../../../../components/generator/text-generator/text-generator-studio';

export default function Page({
  params,
}: {
  params: { chatId: string };
}) {
  return <TextGeneratorStudio initialChatId={params.chatId} />;
}
