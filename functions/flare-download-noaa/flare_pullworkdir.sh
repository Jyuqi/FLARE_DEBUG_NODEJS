#!/bin/bash
PROGNAME=$(basename $0)

error_exit()
{
	echo "${PROGNAME}: ${1:-"Unknown Error"}" 1>&2
	exit 1
}

DIRECTORY_HOST="/opt/flare"
DIRECTORY_HOST_SHARED="/opt/flare/shared"
DIRECTORY_CONTAINER_SHARED="/root/flare/shared"
GITLAB_SERVER=$1    #first argument
GITLAB_PORT=$2      #second argument
LAKE=$3             #third argument
CONTAINER=$4        #fourth argument
USERNAME=$5         #fifth argument

mkdir -p ~/.ssh/
cp /code/id_rsa ~/.ssh/id_rsa
chmod 400 ~/.ssh/id_rsa
ssh-keyscan -t rsa ${GITLAB_SERVER} >> ~/.ssh/known_hosts
# copy config file
scp ubuntu@${GITLAB_SERVER}:/home/ubuntu/fcre/${CONTAINER}/flare-config.yml ${DIRECTORY_HOST_SHARED}/${CONTAINER}/ || error_exit "$LINENO: An error has occurred in copy config file."
