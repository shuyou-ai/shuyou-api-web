import GeneratorWrapper from '../../components/generator/generator-wrapper';

export default async function GeneratorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <GeneratorWrapper>{children}</GeneratorWrapper>;
}
