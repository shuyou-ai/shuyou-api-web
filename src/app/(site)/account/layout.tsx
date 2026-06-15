import AccountSidebar from '../../../components/account/account-sidebar';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-61px)] w-full flex-col bg-[#F9FAFB] dark:bg-[#0c111d] md:flex-row">
      <AccountSidebar />
      <main className="min-w-0 flex-1 bg-white dark:bg-dark-primary">
        {children}
      </main>
    </div>
  );
}
