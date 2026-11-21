#!/usr/bin/env bash
# One time setup, run in Google Cloud Shell: lets this GitHub repo deploy to Firebase Hosting with no stored keys.
set -e
P=shield-electrical-az; REPO=ByCre8tion/shield-electrical-site; SA=github-deploy@$P.iam.gserviceaccount.com
gcloud config set project $P
gcloud services enable iamcredentials.googleapis.com sts.googleapis.com firebasehosting.googleapis.com cloudresourcemanager.googleapis.com
gcloud iam service-accounts describe $SA >/dev/null 2>&1 || gcloud iam service-accounts create github-deploy --display-name="GitHub deploy (Shield site)"
sleep 5
for R in roles/firebasehosting.admin roles/serviceusage.serviceUsageConsumer roles/firebase.viewer; do
  gcloud projects add-iam-policy-binding $P --member=serviceAccount:$SA --role=$R --condition=None --quiet >/dev/null
done
gcloud iam workload-identity-pools describe github --location=global >/dev/null 2>&1 || gcloud iam workload-identity-pools create github --location=global --display-name=GitHub
gcloud iam workload-identity-pools providers describe github --location=global --workload-identity-pool=github >/dev/null 2>&1 || \
  gcloud iam workload-identity-pools providers create-oidc github --location=global --workload-identity-pool=github --display-name=GitHub \
  --issuer-uri=https://token.actions.githubusercontent.com \
  --attribute-mapping=google.subject=assertion.sub,attribute.repository=assertion.repository \
  --attribute-condition="assertion.repository=='$REPO'"
N=$(gcloud projects describe $P --format='value(projectNumber)')
gcloud iam service-accounts add-iam-policy-binding $SA --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/$N/locations/global/workloadIdentityPools/github/attribute.repository/$REPO" --quiet >/dev/null
echo "SETUP COMPLETE  provider=projects/$N/locations/global/workloadIdentityPools/github/providers/github"
