# Invoke FLARE NOAA container images in openwhisk mode

This article is about how to invoke flareforecast/flare-external-driver-interface-noaa Dockerhub container with Openwhisk mode. Manual mode is introduced here: https://github.com/FLARE-forecast/FLARE/wiki/FLARE-external-driver-interface-NOAA

In Openwhisk mode, the container does not run FLARE code upon container startup - FLARE code is invoked through the API stub upon receiving the /init REST call from Openwhisk. This may involve some pre-FLARE-execution steps (e.g. download a snapshot of git local files), and post-FLARE-execution steps (e.g. upload new snapshot of git local files)

Openwhisk is already set on one of ACIS clusters: cibr-flare1. Couchdb and gitlab is on cibr-flare3. Gitlab is already here: http://[ip address of cibr-flare1]:8929. You can see more details about gitlab configurations here: https://github.com/FLARE-forecast/FLARE/wiki/gitlab-server-configuration-and-use. Couchdb is already here: http://[ip address of cibr-flare3]:5984/_utils/#. You can ssh to cibr-flare1 to use wsk command lines. If you are interested in how to set up openwhisk, please refer to this article: https://github.com/FLARE-forecast/FLARE/wiki/Openwhisk-setup-on-local-environment.

You can see the source code here: https://github.com/Jyuqi/FLARE_DEBUG_NODEJS/tree/master/functions/docker. And if you want to try this yourself, you can clone the source code, build the docker image and push it to your docker hub account as following.

```sh
$ cd FLARE_DEBUG_NODEJS/functions/docker
$ docker build -t <dockerhub-name>/flare-openwhisk-nodejs-debug .
$ docker push <dockerhub-name>/flare-openwhisk-nodejs-debug
### if the openwhisk action is not created before, '-t' is timeout flag
$ wsk -i action create pushtest --docker <dockerhub-name>/flare-openwhisk-nodejs-debug -t 18000000
### if the openwhisk action is already existed
$ wsk -i action update pushtest --docker <dockerhub-name>/flare-openwhisk-nodejs-debug -t 18000000
```

We need to create the payload.json. It should contain all the parameters we need to pass while invoking the action through the /run endpoint. 

* a lake name (a string, e.g. "fcre"), a container name (also a string, e.g. flare-download-noaa-dev), a server IP and port, a user name, and an SSH key. For example,

```
{
    "lake": "fcre",
    "gitlab_server": [ip address of cibr-flare3],
    "gitlab_port": "2289",
    "username": "acis",
    "lake_name": "fcre",
    "container_name": "flare-download-noaa-dev",
    "ssh_key": ["-----BEGIN RSA PRIVATE KEY-----", "MIIJJwIBAAKCAgEAwUcArjhUsg5IgN0lKUgaSB2yomKJjhTLupTj+aPpttC2ILsP", "...", ..., "-----END RSA PRIVATE KEY-----"]

}
```

Then, we can invoke pushtest action using payload.json file we just created.

```sh
$ wsk -i action invoke pushtest --param-file payload.json
```

## Openwhisk will then run `function.js` with payload.json with three main steps.

**Pre Step:** Run the `flare-install.sh` script to copy the required files into `/opt/flare` directory:

```bash
wget -O - https://raw.githubusercontent.com/FLARE-forecast/FLARE-containers/flare-download-noaa-dev/flare-install.sh | /bin/bash
```

**Step 1:** Run the `flare_pullworkdir.sh` script. A repository is on the GitLab server with the lake name, and a branch with the container name, and store a tar.gz file there that contains just a config.yml file.  This step does the following:
* Uses the gitlab server IP, port, lake name, container name, username and SSH key to connect to the GitLab server. We have already sent the SSH key when invoking the openwhisk action. So we can use the key stored in /root/.ssh/id_rsa within the container.
* Checks out the container name branch from the lake name repository
* Unzip/untar the file in a working directory(/opt/flare/shared/flare-download-noaa-dev/) within the container.

**Step 2:** Run the `flare-host.sh` script in openwhisk. This script can be run in both manual and openwhisk mode, so we could run this with `--openwhisk` flag, or `-o` for short:

```bash
/opt/flare/flare-download-noaa-dev/flare-host.sh -d --openwhisk
```

**Step 3:** Run the `flare_pushworkdir.sh` script that does the following: 
* Uses the gitlab server IP, port, lake name, container name, username and SSH key to connect to the GitLab server
* Checks out the container name branch from the lake name repository
* tar the downloaded/generated files in the working directory with a daily timestamp, in the format: working_directory_DD_MM_YYYY.tgz. so, every day there will be one working directory file created. 

## Error handling

If one of these three steps fails, stop executing and return with code 1 and error message will tell you which step fails. If succeed, return with code 0.


## Useful wsk Cli

```sh
### see all activaions
$ wsk -i activation list
### see single activaion's log and return
$ wsk -i activation get <activation ID>
````
