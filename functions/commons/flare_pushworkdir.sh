#!/bin/bash
PROGNAME=$(basename $0)

error_exit()
{
	echo "${PROGNAME}: ${1:-"Unknown Error"}" 1>&2
	exit 1
}

DIRECTORY_CONTAINER_SHARED="/root/flare/shared"
DIRECTORY_HOST="/opt/flare"
STORAGE_SERVER=$1    #first argument
LAKE=$2   
CONTAINER=$3 


TIMESTAMP=$(date +"%Y%m%d")
mkdir ~/.ssh/
cp /code/id_rsa ~/.ssh/id_rsa
chmod 400 ~/.ssh/id_rsa

ssh-keyscan -t rsa ${STORAGE_SERVER} >> ~/.ssh/known_hosts
tar -czvf ${LAKE}_${TIMESTAMP}_${CONTAINER}_workingdirectory.tar.gz -C ${DIRECTORY_CONTAINER_SHARED} ${CONTAINER}
scp ${LAKE}_${TIMESTAMP}_${CONTAINER}_workingdirectory.tar.gz ubuntu@${STORAGE_SERVER}:/home/ubuntu/fcre/${CONTAINER}/
rm ${LAKE}_${TIMESTAMP}_${CONTAINER}_workingdirectory.tar.gz