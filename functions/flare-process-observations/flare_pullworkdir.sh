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
ssh-keyscan -p ${GITLAB_PORT} -t rsa ${GITLAB_SERVER} >> ~/.ssh/known_hosts
cd ${DIRECTORY_HOST}

git config --global ssh.postBuffer 524288000

if [[ ! -e "${DIRECTORY_HOST}/${LAKE}" ]]; then
    git clone --depth 1 ssh://git@${GITLAB_SERVER}:${GITLAB_PORT}/${USERNAME}/${LAKE}.git -b ${CONTAINER}|| error_exit "$LINENO: An error has occurred in git clone."
fi
cd ${LAKE}/
# git fetch --depth 1 origin ${CONTAINER}
# git checkout ${CONTAINER}

if [ -f "flare-config.yml" ]; then 
    cp flare-config.yml ${DIRECTORY_HOST_SHARED}/${CONTAINER}/flare-config.yml || error_exit "$LINENO: An error has occurred in copy config file."
fi

export FLARE_CONTAINER_NAME=flare-download-data
git remote set-branches origin ${FLARE_CONTAINER_NAME}
git fetch --depth 1 origin ${FLARE_CONTAINER_NAME}
git checkout ${FLARE_CONTAINER_NAME}
if [ -f "$FLARE_CONTAINER_NAME-output.tar.gz" ]; then 
    tar xvzf ${FLARE_CONTAINER_NAME}-output.tar.gz -C ${DIRECTORY_HOST_SHARED} || error_exit "$LINENO: An error has occurred in tar ${FLARE_CONTAINER_NAME}-output.tar.gz."
fi
