CONFIG_FILE="flare-config.yml"
DIRECTORY="/opt/flare/fcre"
CONTAINER_NAME=$1
AUTH=$(yq r ${DIRECTORY}/${CONFIG_FILE} openwhisk.auth)
APIHOST=$(yq r ${DIRECTORY}/${CONFIG_FILE} openwhisk.apihost)
NEXR_TRIGGER=$(yq r ${DIRECTORY}/${CONFIG_FILE} openwhisk.next-trigger.name)
NEXR_TRIGGER_PAYLOAD=$(yq r ${DIRECTORY}/${CONFIG_FILE} openwhisk.next-trigger.payload)

apt-get update && apt-get install curl -y

curl -u $AUTH https://$APIHOST/api/v1/namespaces/_/triggers/$NEXR_TRIGGER \
-X POST -H "Content-Type: application/json" \
-d $NEXR_TRIGGER_PAYLOAD