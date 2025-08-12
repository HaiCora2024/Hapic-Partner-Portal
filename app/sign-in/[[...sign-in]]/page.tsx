import { SignIn } from '@clerk/nextjs';
import { HapicLogo } from '@/components/hapic-logo';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <HapicLogo className="h-16 w-auto" />
        </div>
        <SignIn />
      </div>
    </div>
  );
}