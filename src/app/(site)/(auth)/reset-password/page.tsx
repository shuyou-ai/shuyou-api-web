import { GradientBlob2 } from '../../../../components/gradient-blob';
import type { Metadata } from 'next';
import ForgotPasswordForm from './_components/forgot-password';
import ResetPasswordForm from './_components/reset-password';

type PageProps = {
  searchParams: Promise<{ token: string | undefined }>;
};

export const metadata: Metadata = {
  title: 'Reset Password',
};

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { token } = await searchParams;
  let tokenVerified = false;

  if (token) {
    // Handle token verification logic here
    // For example, you might call an API or server-action to verify the token

    tokenVerified = true;
  }

  return (
    <section className="py-28 relative overflow-hidden">
      <div className="wrapper">
        <div className="relative max-w-[592px] mx-auto">
          <div className="contact-wrapper border p-14 relative z-30 bg-white dark:bg-dark-primary dark:border-dark-primary border-gray-100">
            {tokenVerified ? (
              <ResetPasswordForm resetToken={token!} />
            ) : (
              <ForgotPasswordForm
                invalidToken={Boolean(token && !tokenVerified)}
              />
            )}
          </div>
        </div>
      </div>

      <GradientBlob2 className="absolute -bottom-32 left-1/2 -translate-x-1/2 z-0" />
    </section>
  );
}
