#!/bin/bash

# Configuration
API_URL="http://localhost:8080/api"
EMAIL="test_chat_user_$(date +%s)@example.com"
PASSWORD="password123"

echo "1. Registering a test user ($EMAIL)..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"role\": \"job_seeker\",
    \"fullName\": \"Test Chat User\"
  }")

# Extract token (assuming standard JSON response structure)
# If you have jq installed, this is better: TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.accessToken')
# For now, using grep/sed for compatibility
TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "Registration might have failed or returned no token. Trying to login..."
    LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"$EMAIL\",
        \"password\": \"$PASSWORD\"
      }")
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ]; then
    echo "Error: Could not obtain access token."
    echo "Response: $REGISTER_RESPONSE"
    echo "Login Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "Access Token obtained: ${TOKEN:0:20}..."

echo -e "\n2. Testing Chatbot Endpoint for Job Seeker..."
echo "Question: 'What jobs are available?'"

curl -v -X POST "$API_URL/chatbot/ask" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "question": "What jobs are available?", 
    "model": "mistral"
  }'

echo -e "\n\nDone."
