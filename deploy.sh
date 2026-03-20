#!/bin/bash
echo "Starting simultaneous deployment to Google Cloud Run..."

PROJECT_ID="your-project-id" # Replace this before running!
REGION="us-central1"

echo "Deploying Backend..."
gcloud run deploy jeevansetu-backend \
  --source ./backend \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated &
BACKEND_PID=$!

echo "Deploying Frontend..."
gcloud run deploy jeevansetu-frontend \
  --source ./frontend \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated &
FRONTEND_PID=$!

# Wait for both background deployments to finish
wait $BACKEND_PID
wait $FRONTEND_PID

echo "Both services successfully deployed!"
