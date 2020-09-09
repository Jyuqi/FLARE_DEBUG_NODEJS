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

TIMESTAMP=$(date +"%d_%m_%y")

cd /root/${LAKE}/
git config user.email "acis@ufl.edu"
git config user.name ${USERNAME}
git add state.json
git commit -m "$(date +"%D %T") - Update trigger state"
git push origin ${CONTAINER}