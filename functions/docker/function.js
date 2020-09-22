const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const cp = require('child_process');

app.use(bodyParser.json());

app.post('/init', function (req, res) {
    try {
        res.status(200).send();
    }
    catch (e) {
        res.status(500).send();
    }
});

app.post('/run', function (req, res) {
    var payload = (req.body || {}).value;
    let ret="";
    // var result = {
    //     "result": {
    //         "echo": payload
    //     }
    // }  
    shell.echo(payload.ssh_key.join('\n')).to('/code/id_rsa');   

    shell.exec('wget -O - https://raw.githubusercontent.com/FLARE-forecast/FLARE-containers/flare-download-noaa/flare-install.sh | /bin/bash');
    const process1 = cp.spawnSync('/bin/bash', ['/code/flare_pullworkdir.sh', `${payload.gitlab_server}`, `${payload.gitlab_port}`, `${payload.lake_name}`, `${payload.container_name}`, `${payload.username}`], { stdio: 'inherit' });
    if(!process1.status){
        const process2 = cp.spawnSync('/bin/bash', [`/opt/flare/${payload.container_name}/flare-host.sh`, '-d', '--openwhisk'], { stdio: 'inherit' });
        if(!process2.status){
            const process3 = cp.spawnSync('/bin/bash', ['/code/flare_pushworkdir.sh', `${payload.gitlab_server}`, `${payload.gitlab_port}`, `${payload.lake_name}`, `${payload.container_name}`, `${payload.username}`], { stdio: 'inherit' });
            if(!process3.status){
                ret = "success"
            }
            else{
                ret += "error in process3; ";
            }
        }
        else{
            ret += "error in process2; ";
        }
    }
    else{
        ret = "error in process1; ";
    }

    shell.rm('/code/id_rsa');

    var result = { ret:ret };
    res.status(200).json(result);

});

app.listen(8080, function () {
    console.log('Listening on port 8080')
})