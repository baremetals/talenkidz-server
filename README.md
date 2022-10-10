# Strapi application

A quick description of your strapi application

App engine
gcloud app deploy app.yaml --project

Cloud Build
**Get current project**
gcloud config get-value project

**Set required project**
gcloud config set project PROJECT_ID

**Enable the required APIs**
gcloud services enable cloudbuild.googleapis.com compute.googleapis.com

**Build custom image**
  gcloud builds submit --tag gcr.io/talentkids/dev