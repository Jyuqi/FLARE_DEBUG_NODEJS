#!/bin/bash
PROGNAME=$(basename $0)

error_exit()
{
	echo "${PROGNAME}: ${1:-"Unknown Error"}" 1>&2
	exit 1
}

DIRECTORY_CONTAINER_SHARED="/root/flare/shared"
DIRECTORY_HOST="/opt/flare"
GITLAB_SERVER=$1    #first argument
GITLAB_PORT=$2      #second argument
LAKE=$3             #third argument
CONTAINER=$4        #fourth argument
USERNAME=$5         #fifth argument

TIMESTAMP=$(date +"%d_%m_%y")
mkdir ~/.ssh/
cp /code/id_rsa ~/.ssh/id_rsa
chmod 400 ~/.ssh/id_rsa
ssh-keyscan -t rsa ${GITLAB_SERVER} >> ~/.ssh/known_hosts

tar -czvf ${CONTAINER}-output.tar.gz -C ${DIRECTORY_CONTAINER_SHARED} ${CONTAINER}
scp ${CONTAINER}-output.tar.gz ubuntu@${GITLAB_SERVER}:/home/ubuntu/fcre/${CONTAINER}/
rm ${CONTAINER}-output.tar.gz