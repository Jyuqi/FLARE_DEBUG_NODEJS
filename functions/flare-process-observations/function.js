const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const cp = require('child_process');
const yaml = require('js-yaml');
const { config } = require('process');

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
    let ret = "";
    let prerunpull = false;
    let postrunpush = false;

    shell.echo(payload.ssh_key.join('\n')).to('/code/id_rsa');   

    shell.exec(`wget -O - https://raw.githubusercontent.com/FLARE-forecast/FLARE-containers/commons/flare-install.sh | /usr/bin/env bash -s ${payload.container_name}`);


    fs.readFile(`/opt/flare/shared/${payload.container_name}/flare-config.yml`, 'utf8', function (e, data) {
        var file;
        if (e) {
            console.log('flare-config.yml not found.');
        } else {
            var file = yaml.load(data, 'utf8');
            const indentedJson = JSON.parse(JSON.stringify(file, null, 4));
            prerunpull = indentedJson["container"]["working-directory"]["pre-run-pull"];
            // var gitlab_server = indentedJson["container"]["working-directory"]["git"]["remote"]["server"];
            // var gitlab_port = indentedJson["container"]["working-directory"]["git"]["remote"]["port"];
            // var lake = indentedJson["container"]["working-directory"]["git"]["remote"]["fcre"];
            // var container_name = indentedJson["container"]["name"];
        }
    });

    const process1 = cp.spawnSync('/bin/bash', ['/code/flare_pullworkdir.sh', `${payload.gitlab_server}`, `${payload.gitlab_port}`, `${payload.lake}`, `${payload.container_name}`, `${payload.username}`], { stdio: 'inherit' });
    if(!process1.status){ 
        // update the config file
        const data = fs.readFileSync(`/opt/flare/shared/${payload.container_name}/flare-config.yml`, 'utf8');
        var file = yaml.load(data, 'utf8');
        const indentedJson = JSON.parse(JSON.stringify(file, null, 4));
        // var gitlab_port = indentedJson["container"]["working-directory"]["git"]["remote"]["port"];
        // console.log(gitlab_port);
        postrunpush = indentedJson["container"]["working-directory"]["post-run-push"];



        const process2 = cp.spawnSync('/bin/bash', [`/opt/flare/${payload.container_name}/flare-host.sh`, '-d', '--openwhisk'], { stdio: 'inherit' });
        if(!process2.status){
            if (postrunpush) {
                const process3 = cp.spawnSync('/bin/bash', ['/code/flare_pushworkdir.sh', `${payload.gitlab_server}`, `${payload.gitlab_port}`, `${payload.lake}`, `${payload.container_name}`, `${payload.username}`], { stdio: 'inherit' });
                if(!process3.status){
                    const process4 = cp.spawnSync('/bin/bash', ['/code/flare_triggernext.sh', `${payload.container_name}`, `${payload.lake}`], { stdio: 'inherit' });
                    if(!process4.status){
                        ret += "success";
                    }
                    else{
                        ret += "error in running flare_triggernext.sh; ";
                    }    
                }
                else{
                    ret += "error in running flare_pushworkdir.sh; ";
                }
            }
            else{
                const process4 = cp.spawnSync('/bin/bash', ['/code/flare_triggernext.sh', `${payload.container_name}`, `${payload.lake}`], { stdio: 'inherit' });
                if(!process4.status){
                    ret += "success";
                }
                else{
                    ret += "error in running flare_triggernext.sh; ";
                }  
            }

        }
        else{
            ret += "error in running flare-host.sh; ";
        }
    }
    else{
        ret = "error in running flare_pullworkdir.sh; ";
    }


    shell.rm('/code/id_rsa');

    var result = { ret:ret };
    res.status(200).json(result);

});

app.listen(8080, function () {
    console.log('Listening on port 8080')
})