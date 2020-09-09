#!/bin/bash
PROGNAME=$(basename $0)

error_exit()
{
	echo "${PROGNAME}: ${1:-"Unknown Error"}" 1>&2
	exit 1
}

GITLAB_SERVER=$1    #first argument
GITLAB_PORT=$2      #second argument
LAKE=$3             #third argument
CONTAINER=$4        #fourth argument
USERNAME=$5         #fifth argument

mkdir -p ~/.ssh/
cp /code/id_rsa ~/.ssh/id_rsa
chmod 400 ~/.ssh/id_rsa
ssh-keyscan -p ${GITLAB_PORT} -t rsa ${GITLAB_SERVER} >> ~/.ssh/known_hosts
cd

git clone -b ${CONTAINER} ssh://git@${GITLAB_SERVER}:${GITLAB_PORT}/${USERNAME}/${LAKE}.git || error_exit "$LINENO: An error has occurred in git clone."