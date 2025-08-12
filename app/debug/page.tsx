
import React from 'react';

export default function DebugPage() {
  const envVars = {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ? '[REDACTED - Present]' : 'Missing',
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
    NODE_ENV: process.env.NODE_ENV,
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Information</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-4">Environment Variables</h2>
        <pre className="text-sm overflow-x-auto">
          {JSON.stringify(envVars, null, 2)}
        </pre>
      </div>

      <div className="bg-blue-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-4">Client-side Debug</h2>
        <div className="text-sm">
          <p>Check browser console for client-side Clerk debugging</p>
          <p>Check server logs for middleware debugging</p>
        </div>
      </div>

      <div className="bg-yellow-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Quick Tests</h2>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Visit <a href="/sign-in" className="text-blue-600 underline">/sign-in</a> to test sign-in page</li>
          <li>Visit <a href="/sign-up" className="text-blue-600 underline">/sign-up</a> to test sign-up page</li>
          <li>Visit <a href="/dashboard" className="text-blue-600 underline">/dashboard</a> to test protected route</li>
        </ul>
      </div>
    </div>
  );
}
