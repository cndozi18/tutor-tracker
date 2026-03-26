#!/usr/bin/env bash
set -e

export PATH="$HOME/.nvm/versions/node/v20.20.1/bin:$PATH"

# Load env vars from .env.local
export NEXT_PUBLIC_SUPABASE_URL=https://pclekdofrqhowtkcmujz.supabase.co
export NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ci4bHGTKtgL57fwStXbWjw_Q_67jZXH

echo "Building..."
npm run build

echo "Starting..."
npm run start
