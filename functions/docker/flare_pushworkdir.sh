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
ssh-keyscan -p ${GITLAB_PORT} -t rsa ${GITLAB_SERVER} >> ~/.ssh/known_hosts

if [[ ! -e "${DIRECTORY_HOST}/${LAKE}" ]]; then
     error_exit "$LINENO: No ${LAKE} gitlab directory."
fi
cd ${DIRECTORY_HOST}/${LAKE}/
git remote add gitlab ssh://git@${GITLAB_SERVER}:${GITLAB_PORT}/${USERNAME}/${LAKE}.git
git fetch gitlab ${CONTAINER}
git checkout ${CONTAINER}

if [[ ! -e "${DIRECTORY_CONTAINER_SHARED}/test-data/${LAKE}" ]]; then
     error_exit "$LINENO: No test-data directory."
fi
tar -czvf workdir_${TIMESTAMP}.tar.gz ${DIRECTORY_CONTAINER_SHARED}/test-data/${LAKE}
git add workdir_${TIMESTAMP}.tar.gz
git clean -f
git commit -m "$(date +"%D %T") - Add NOAA Forecast"
git push gitlab ${CONTAINER}