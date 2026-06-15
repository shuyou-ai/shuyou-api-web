import type { Metadata } from 'next';
import { AboutPage } from '../../../components/sections/about/about-page';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Developer API aggregation platform for indie builders. Integrate Claude Code, Codex, and more with a single Base URL.',
};

export default function Page() {
  return <AboutPage />;
}
