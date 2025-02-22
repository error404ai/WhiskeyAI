
if [ -f .env ]; then
    . ./.env
else
    echo ".env file not found!"
    exit 1
fi
ngrok http --url="$AUTH_URL" 3000
