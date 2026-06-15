const SNIPPET = `const client = new API({
  apiKey: process.env.API_KEY,
});

const response = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: prompt }],
});

export async function POST(req: Request) {
  const { model, messages } = await req.json();
  return streamText({ model, messages });
}`;

function WatermarkColumn({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute top-0 bottom-0 w-[min(28vw,320px)] overflow-hidden opacity-[0.07] dark:opacity-[0.04] select-none ${className ?? ''}`}
    >
      <pre className="font-mono text-[10px] leading-relaxed text-gray-800 dark:text-gray-300 blur-[1px] whitespace-pre-wrap p-4">
        {SNIPPET}
        {'\n\n'}
        {SNIPPET}
        {'\n\n'}
        {SNIPPET}
      </pre>
    </div>
  );
}

export function CodeWatermarks() {
  return (
    <>
      <WatermarkColumn className="left-0 hidden sm:block" />
      <WatermarkColumn className="right-0 hidden sm:block text-right" />
    </>
  );
}
