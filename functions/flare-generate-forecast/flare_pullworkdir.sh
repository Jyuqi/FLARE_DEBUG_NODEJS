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

# copy work dir
Ndays_steps=0
current_date=$(date +%Y%m%d)
set_of_dependencies=("flare-download-data" "flare-download-noaa" "flare-process-observations")

for FLARE_CONTAINER_NAME in ${set_of_dependencies[*]};
do
	downloaded=false
	for daysback in `seq 0 $Ndays_steps`
	do
    	scandate=$(date -d "$current_date - $daysback days" +%Y%m%d)
		if (downloaded==false) 
		then
			scp ubuntu@${GITLAB_SERVER}:/home/ubuntu/fcre/$FLARE_CONTAINER_NAME/${LAKE}_${scandate}_${FLARE_CONTAINER_NAME}_workingdirectory.tar.gz ${DIRECTORY_HOST_SHARED}/
			if [ "$?" -eq "0" ]; # copy work dir success
			then
				echo "OK"
				downloaded=true
				cd ${DIRECTORY_HOST_SHARED}/
				tar -xzf ${LAKE}_${scandate}_${FLARE_CONTAINER_NAME}_workingdirectory.tar.gz
				break
			else
				echo "NotOK"
			fi
		fi
    done
	downloaded==true || error_exit "$LINENO: An error has occurred in copy $FLARE_CONTAINER_NAME working directory."
done
