#!/bin/bash
echo "Starting simultaneous deployment to Google Cloud Run..."

PROJECT_ID="jeevansetu-490807"
REGION="europe-west1"

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
  --allow-unauthenticated \
  --set-build-env-vars="VITE_API_BASE_URL=https://jeevansetu-backend-842227041877.europe-west1.run.app" &
FRONTEND_PID=$!

# Wait for both background deployments to finish
wait $BACKEND_PID
wait $FRONTEND_PID

echo "Both services successfully deployed!"
