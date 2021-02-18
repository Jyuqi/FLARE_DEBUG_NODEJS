# Developing and Debugging Node.js OpenWhisk Functions in VS Code

I follow this  project (https://github.com/nheidloff/openwhisk-debug-nodejs) which clearly shows how [Apache OpenWhisk](http://openwhisk.org/) functions can be developed and debugged locally via [Visual Studio Code](https://code.visualstudio.com/). 


Watch the [video](https://www.youtube.com/watch?v=P9hpcOqQ3hw) to see this in action.

The following screenshot shows how functions that run in Docker can be debugged from Visual Studio Code. In order to do this, a volume is used to share the files between the IDE and the container and VS Code attaches a remote debugger to the Docker container. The functions can be changed in the IDE without having to restart the container. [nodemon](https://github.com/remy/nodemon) restarts the Node application in the container automatically when files change.

![alt text](https://github.com/Jyuqi/FLARE_DEBUG_NODEJS/raw/master/images/debugging-docker-3.png "Debugging")



## Prerequisites and Setup

In order to run the code you need the following prerequisites and you need to set up your system.

**Prerequisites**

Make sure you have the following tools installed:

* [Visual Studio Code](https://code.visualstudio.com/)
* [Node](https://nodejs.org/en/download/)
* [Docker](https://docs.docker.com/engine/installation/)
* [git](https://git-scm.com/downloads)


**Setup**

Run the following commands:

```sh
$ git clone https://github.com/nheidloff/FLARE_DEBUG_NODEJS.git
$ cd FLARE_DEBUG_NODEJS
$ npm install
$ code .
```

**Debugging from Visual Studio Code**

There are two ways to start the debugger in VS Code:

* From the [debug page](https://github.com/Jyuqi/FLARE_DEBUG_NODEJS/blob/master/images/start-debugger-ui.png) choose the specific launch configuration
* Open the [command palette](https://github.com/Jyuqi/FLARE_DEBUG_NODEJS/blob/master/images/start-debugger-palette-1.png) (⇧⌘P) and search for 'Debug: Select and Start Debugging' or enter 'debug se'. After this select the specific [launch configuration](https://github.com/Jyuqi/FLARE_DEBUG_NODEJS/blob/master/images/start-debugger-palette-2.png)



## Debugging Functions in Docker Containers

There is a sample function [function.js](https://github.com/nheidloff/openwhisk-debug-nodejs/blob/master/functions/docker/function.js) that shows how to write an OpenWhisk function running in a container by implementing the endpoints '/init' and '/run'.

The function can be changed in the IDE without having to restart the container after every change. Instead a mapped volume is used to share the files between the IDE and the container and [nodemon](https://github.com/remy/nodemon) restarts the Node application in the container automatically when files change.


**Debugging**

Run the following commands in a terminal to run the container - see [screenshot](https://github.com/Jyuqi/FLARE_DEBUG_NODEJS/blob/master/images/debugging-docker-1.png):

```sh
$ cd FLARE_DEBUG_NODEJS/functions/$FLARE_CONTAINER_NAME
$ docker-compose up --build
```

Run the launch configurations 'function in container' to attach the debugger - see [screenshot](https://github.com/Jyuqi/FLARE_DEBUG_NODEJS/blob/master/images/debugging-docker-2.png).

You can define the input as JSON in [payload.json](payloads/payload.json). Set breakpoints in [function.js](functions/docker/function.js). After this invoke the endpoints in the container by running these commands from a second terminal - see [screenshot](https://github.com/Jyuqi/FLARE_DEBUG_NODEJS/blob/master/images/debugging-docker-3.png).

```sh
$ cd FLARE_DEBUG_NODEJS
$ node runDockerFunction.js
```

You'll see the output of the function in the terminal - see [screenshot](https://github.com/Jyuqi/FLARE_DEBUG_NODEJS/blob/master/images/debugging-docker-4.png).

After you're done stop the container via these commands in the first terminal - see [screenshot](https://github.com/Jyuqi/FLARE_DEBUG_NODEJS/blob/master/images/debugging-docker-5.png):

```sh
$ cd FLARE_DEBUG_NODEJS/functions/$FLARE_CONTAINER_NAME
$ docker-compose down
```

**Deployment**

Here is how to deploy the function locally.
```sh
$ cd FLARE_DEBUG_NODEJS/functions/$FLARE_CONTAINER_NAME
$ docker build -t <dockerhub-name>/openwhisk-$FLARE_CONTAINER_NAME .
$ docker push <dockerhub-name>/openwhisk-$FLARE_CONTAINER_NAME
### if the openwhisk action is not created before, '-t' is timeout flag
$ wsk -i action create $FLARE_CONTAINER_NAME --docker <dockerhub-name>/openwhisk-$FLARE_CONTAINER_NAME -t 18000000
### if the openwhisk action is already existed
$ wsk -i action update $FLARE_CONTAINER_NAME --docker <dockerhub-name>/openwhisk-$FLARE_CONTAINER_NAME -t 18000000
```

**Invocation and Payload**

The payload.json should contain all the parameters we need to pass while invoking the action through the /run endpoint.
* a lake name (a string, e.g. "fcre"), a container name (also a string, e.g. flare-download-noaa), a server IP and port,  and an SSH key. For example,

```json
{
    "type": "payload",
    "lake": "fcre",
    "gitlab_server": "XXX.XXX.XXX.XXX",
    "gitlab_port": "2289",
    "username": "acis",
    "container_name": "flare-download-noaa",
    "ssh_key": ["-----BEGIN RSA PRIVATE KEY-----", "...", "-----END RSA PRIVATE KEY-----"]
}
```

To invoke the action, you can either invoke by passing a json file or passing all parameters one by one.
```sh
$ wsk -i action invoke $FLARE_CONTAINER_NAME -P payload.json
```

## Developing Functions about Flare Containers in openwhisk

* The function.js is the starting point for each container. 
* When it finishes initialization, it will run flare_pullworkdir.sh that pulls flare-config.yml and all the dependencies from remote storage through scp commands. You can refer to https://github.com/FLARE-forecast/FLAREv1/wiki/Naming-scheme-for-container-data for more infomation.
* Then it runs FLARE-containers as described here: https://github.com/FLARE-forecast/FLAREv1/wiki/How-to-Run-FLARE-Containers
* After finishes the job, the function run flare_pushworkdir.sh that pushes current working directory with time stamp to the remote storage. You can refer to https://github.com/FLARE-forecast/FLAREv1/wiki/Naming-scheme-for-container-data for more infomation.
* Finally it should use flare_triggernext.sh to trigger next action. The scheme is described here: https://docs.google.com/drawings/d/1vuVv8oTUOf1VD017zIsQ6Jdoys8al-Zy_55RJZvDK2Y/edit

The information about next trigger should be included at the end of flare-config.yml, which is stored at the remote storage 
```yaml
## Openwhisk Settings
openwhisk:
  apihost: 
  auth: 
  next-trigger:
    name: flare-download-data-ready-fcre
    payload: 
```

