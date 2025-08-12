#!/bin/bash

echo "Update Clerk to Production Keys"
echo "==============================="
echo ""
echo "1. Go to https://dashboard.clerk.com"
echo "2. Create a production instance"
echo "3. Get your production keys (pk_live_... and sk_live_...)"
echo ""
echo "Then update these in Vercel:"
echo ""

# Remove old test keys
echo "Removing old test keys..."
vercel env rm NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env rm CLERK_SECRET_KEY production

echo ""
echo "Now add your new production keys:"
echo "vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production"
echo "vercel env add CLERK_SECRET_KEY production"
echo ""
echo "After updating, redeploy with: vercel --prod"