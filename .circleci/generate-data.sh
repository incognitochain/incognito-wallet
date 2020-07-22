#!/usr/bin/env bash

echo "
PASSWORD_SECRET_KEY=$PASSWORD_SECRET_KEY
PASSPHRASE_WALLET_DEFAULT=$PASSPHRASE_WALLET_DEFAULT
API_MINER_URL=$API_MINER_URL
PASS_HOSPOT=$PASS_HOSPOT
" > .env

# Generate android keystore file
echo $KEYSTORE | base64 -di | tee android/app/wallet-app-release-key.keystore
echo $PLAY_STORE_JSON | base64 -di | tee play_store.json