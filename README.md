# Developing and Debugging Node.js OpenWhisk Functions in VS Code

I follow this [project](https://github.com/nheidloff/openwhisk-debug-nodejs) which shows how [Apache OpenWhisk](http://openwhisk.org/) functions can be developed and debugged locally via [Visual Studio Code](https://code.visualstudio.com/).


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

There is a sample function [function.js](functions/docker/function.js) that shows how to write an OpenWhisk function running in a container by implementing the endpoints '/init' and '/run'.

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

**Deployment and Invocation**

```sh
$ cd FLARE_DEBUG_NODEJS/functions/$FLARE_CONTAINER_NAME
$ docker build -t <dockerhub-name>/openwhisk-$FLARE_CONTAINER_NAME .
$ docker push <dockerhub-name>/openwhisk-$FLARE_CONTAINER_NAME
$ wsk -i action update $FLARE_CONTAINER_NAME --docker <dockerhub-name>/openwhisk-$FLARE_CONTAINER_NAME -t 18000000
$ wsk -i action invoke $FLARE_CONTAINER_NAME -P payload.json
```



## Resources

To find out more about how to develop OpenWhisk functions locally, check out the following resources:

* [Advanced debugging of OpenWhisk actions](https://medium.com/openwhisk/advanced-debugging-of-openwhisk-actions-518414636932)
* [wskdb: The OpenWhisk Debugger](https://github.com/apache/incubator-openwhisk-debugger)
* [Testing node.js functions locally](https://github.com/apache/incubator-openwhisk-devtools/tree/master/node-local)
