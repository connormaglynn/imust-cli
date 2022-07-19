#!/bin/bash
LINE="-----------------------------------------------------------------------------------------------------------------"
RED='\033[0;31m'
LIGHTRED='\033[1;31m'
BLACK='\033[0;30m'
DARKGREY='\033[1;30m'
LIGHTGRAY='\033[0;37m'
GREEN='\033[0;32m'
LIGHTGREEN='\033[1;32m'
BROWN='\033[0;33m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
LIGHTBLUE='\033[1;34m'
PURPLE='\033[0;35m'
LIGHTPURPLE='\033[1;35m'
CYAN='\033[0;36m'
LIGHTCYAN='\033[1;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Check all parameters are passed in
if [ $# -eq 0  ]
then
  echo $LINE
  echo "- Please call the script as 'connect-to-db {namespace} {secret with db connection details(defaults to [dps-rds-instance-output])} {[rds_instance_address]}'"
  echo $LINE
  exit 1
fi

# Set parameters to local variables
NAMESPACE=$1
SECRET_WITH_DB_CONNECTION_DETAILS=$2
SECRET_WITH_DB_ADDRESS=$3
DEFAULT_SECRET="dps-rds-instance-output"
DEFAULT_DB_ADDRESS="rds_instance_address"

# Check the namespace exists
echo $LINE
echo -e "${LIGHTGRAY}1. Checking the namespace exists${NC}"
if [[ -z $(kubectl get namespaces | grep "$NAMESPACE") ]]; then
  echo "- the namespace [ $NAMESPACE ] doesn't exist. Exiting the program"
  echo $LINE
  exit 1
fi
echo "- [ $NAMESPACE ] exists. Continuing..."
echo $LINE

# Get secrets for connect to DB
echo -e "${LIGHTGRAY}2. Get secrets for DB connection${NC}"
DB_SECRETS=$(kubectl --namespace $NAMESPACE get secret ${SECRET_WITH_DB_CONNECTION_DETAILS:-$DEFAULT_SECRET} -o json | jq '.data | map_values(@base64d)')
DB_ADDRESS=$(echo "$DB_SECRETS" | jq -r '.'${SECRET_WITH_DB_ADDRESS:-$DEFAULT_DB_ADDRESS}'')
echo -e "- DB Secrets: ${LIGHTRED}$DB_SECRETS${NC}"
echo "- Connecting to: $DB_ADDRESS"
echo $LINE

# Check if port-forwarding pod exists, create if not
echo -e "${LIGHTGRAY}3. Create a port-forward-pod if one doesn't already exist in [ $NAMESPACE ]${NC}"
PORT_FORWARD_POD=$(kubectl -n "$NAMESPACE" get pods | grep port-forward-pod)
if [ -z "$PORT_FORWARD_POD" ]
then
  echo "- No port-forward-pod - creating one in [ $NAMESPACE ]..."
  echo -e "$LIGHTBLUE"
  kubectl --namespace "$NAMESPACE" \
    run port-forward-pod \
      --image=ministryofjustice/port-forward \
      --env="REMOTE_HOST=$DB_ADDRESS" \
      --env="REMOTE_PORT=5432" \
      --env="LOCAL_PORT=5432"
  echo -e $NC
else
  echo "- port-forward-pod already exists in [ $NAMESPACE ]. Continuing..."
fi
echo $LINE

# Verify port forward pod exists
echo -e "${LIGHTGRAY}4. Verify port-forward-pod exists in [ $NAMESPACE ]${NC}"
echo "- Waiting for port-forward-pod to load..."
sleep 5
echo "- port-forward-pod should exist..."
echo -e "$YELLOW"
kubectl -n "$NAMESPACE" get pods
echo -e $NC
echo $LINE

# Connect to the port-forward-pod. Keep reconnecting (due to timeouts) until the user decides to stop re-connecting
echo -e "${LIGHTGRAY}5. Connect to port-forward-pod in [ $NAMESPACE ]${NC}"
condition=r
while [ "$condition" = "r" ]
do
  echo "- Connecting to port-forward-pod..."
  echo "- Press [ CTRL+C ] to manually exit the connection..."
  echo -e "$LIGHTBLUE"
  kubectl -n "$NAMESPACE" port-forward port-forward-pod 5433:5432
  echo -e "$NC"
  echo "- The connection has timed out or has been manually disconected. Enter 'r' to reconnect - or any other key to delete the pod..."
  read -r condition
done
echo $LINE

# When user is done, delete the pod
echo -e "${LIGHTGRAY}6. Delete port-forward-pod in [ $NAMESPACE ]${NC}"
kubectl -n "$NAMESPACE" delete pod port-forward-pod
echo "- port-forward-pod should now be deleted"
echo -e "$YELLOW"
kubectl -n "$NAMESPACE" get pods
echo -e "$NC"
echo $LINE

exit 1
