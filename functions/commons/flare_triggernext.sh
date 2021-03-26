CONFIG_FILE="flare-config.yml"
LAKE=$(yq r ${CONFIG_FILE} lake_name_code)
CONTAINER=$(yq r ${CONFIG_FILE} container.name)
DIRECTORY="/root/flare/shared/$CONTAINER"
APIHOST=$1
AUTH=$2

NEXR_TRIGGER=$(yq r ${DIRECTORY}/${CONFIG_FILE} openwhisk.next-trigger.name)
NEXR_TRIGGER_PAYLOAD=$(yq r ${DIRECTORY}/${CONFIG_FILE} openwhisk.next-trigger.payload)

apt-get update && apt-get install curl -y

curl -u $AUTH https://$APIHOST/api/v1/namespaces/_/triggers/$NEXR_TRIGGER \
-X POST -H "Content-Type: application/json" \
-d $NEXR_TRIGGER_PAYLOAD