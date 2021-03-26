#!/bin/bash
PROGNAME=$(basename $0)

error_exit()
{
	echo "${PROGNAME}: ${1:-"Unknown Error"}" 1>&2
	exit 1
}

DIRECTORY_CONTAINER_SHARED="/root/flare/shared"
DIRECTORY_HOST="/opt/flare"
CONFIG_FILE="flare-config.yml"
s3_endpoint=$1
s3_access_key=$2
s3_secret_key=$3
LAKE=$(yq r ${CONFIG_FILE} lake_name_code)
CONTAINER=$(yq r ${CONFIG_FILE} container.name)


TIMESTAMP=$(date +"%Y%m%d")
mkdir ~/.ssh/
cp /code/id_rsa ~/.ssh/id_rsa
chmod 400 ~/.ssh/id_rsa

tar -czvf ${LAKE}_${TIMESTAMP}_${CONTAINER}_workingdirectory.tar.gz -C ${DIRECTORY_CONTAINER_SHARED} ${CONTAINER}
/code/mc cp ${LAKE}_${TIMESTAMP}_${CONTAINER}_workingdirectory.tar.gz flare/${LAKE}/${CONTAINER}/ || error_exit "$LINENO: An error has occurred in pyush $FLARE_CONTAINER_NAME working directory."
rm ${LAKE}_${TIMESTAMP}_${CONTAINER}_workingdirectory.tar.gz
rm /code/mc