#!/bin/bash

echo "Testing AI Service Health..."
curl -v http://localhost:8000/health

echo -e "\n\nTesting Chat Endpoint (this might fail if memory is low)..."
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"Hello, are you working?", "context":"User is testing the service."}'

echo -e "\n\nChecking Ollama Models..."
curl http://localhost:11434/api/tags
