import type { Metadata } from 'next';
import ModelDetail from '../../../../../components/sections/model-detail/model-detail';

export const metadata: Metadata = {
  title: 'Model',
};

export default async function ModelDetailByIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ModelDetail id={decodeURIComponent(id)} />;
}
