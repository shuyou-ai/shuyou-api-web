import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import './globals.css';
import { ToasterProvider } from './providers/toaster';

export const metadata: Metadata = {
  title: {
    default: 'ShuYou AI',
    template: '%s | All-In-One API for Global AI',
  },
  keywords: [
    'ShuYou',
    'ShuYou AI',
    'AI API Aggregation',
    'LLM Relay',
    'OpenAI',
    'GPT API',
    'Claude API',
    'Unified LLM Interface',
  ],
  description:
    'ShuYou-API provides developers with a unified AI large model API relay and aggregation service. It supports models including GPT, Claude, Gemini, Grok, as well as Chinese models such as DeepSeek, Doubao, Kimi, and GLM. Featuring low latency and high concurrency, it helps you efficiently connect to global intelligence.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-dark-secondary min-h-screen flex flex-col font-sans">
        <ThemeProvider disableTransitionOnChange>
          <ToasterProvider />
          <div className="isolate flex flex-col flex-1">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
