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

git config --global user.email "${USERNAME}@ufl.edu"
git config --global user.name "${USERNAME}"


if [[ ! -e "${DIRECTORY_HOST}/${LAKE}" ]]; then
     error_exit "$LINENO: No ${LAKE} gitlab directory."
fi
cd ${DIRECTORY_HOST}/${LAKE}/

git remote add gitlab ssh://git@${GITLAB_SERVER}:${GITLAB_PORT}/${USERNAME}/${LAKE}.git
git fetch gitlab ${CONTAINER}
git checkout ${CONTAINER}

cd
tar -czvf ${DIRECTORY_HOST}/${LAKE}/${CONTAINER}-output.tar.gz -C ${DIRECTORY_CONTAINER_SHARED} ${CONTAINER}
cd ${DIRECTORY_HOST}/${LAKE}/
git add ${CONTAINER}-output.tar.gz
git clean -f
git commit -m "$(date +"%D %T") - update output"
git push gitlab ${CONTAINER}