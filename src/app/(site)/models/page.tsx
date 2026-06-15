import type { Metadata } from 'next';
import { ModelsPage } from './_components/models-page';

export const metadata: Metadata = {
  title: 'Models',
};

export default function Page() {
  return <ModelsPage />;
}
