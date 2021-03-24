const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const cp = require('child_process');
const yaml = require('js-yaml');


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


    shell.echo(payload.ssh_key.join('\n')).to('/code/id_rsa');   

    shell.exec(`wget -O - https://raw.githubusercontent.com/FLARE-forecast/FLARE-containers/${payload.FLARE_VERSION}/commons/flare-install.sh | /usr/bin/env bash -s ${payload.container_name} ${payload.FLARE_VERSION}`);



    shell.exec(`wget https://raw.githubusercontent.com/Jyuqi/FLARE_DEBUG_NODEJS/master/functions/commons/flare_pullworkdir.sh`);
    const process1 = cp.spawnSync('/bin/bash', ['/code/flare_pullworkdir.sh'], { stdio: 'inherit' });
    if(!process1.status){ 

        const process2 = cp.spawnSync('/bin/bash', [`/opt/flare/${payload.container_name}/flare-host.sh`, '-d', '--openwhisk'], { stdio: 'inherit' });
        if(!process2.status){
                shell.exec(`wget https://raw.githubusercontent.com/Jyuqi/FLARE_DEBUG_NODEJS/master/functions/commons/flare_pushworkdir.sh`);
                const process3 = cp.spawnSync('/bin/bash', ['/code/flare_pushworkdir.sh'], { stdio: 'inherit' });
                if(!process3.status){
                    shell.exec(`wget https://raw.githubusercontent.com/Jyuqi/FLARE_DEBUG_NODEJS/master/functions/commons/flare_triggernext.sh`);
                    const process4 = cp.spawnSync('/bin/bash', ['/code/flare_triggernext.sh'], { stdio: 'inherit' });
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
            ret += "error in running flare-host.sh; ";
        }
    }
    else{
        ret = "error in running flare_pullworkdir.sh; ";
    }


    shell.rm('/code/id_rsa');
    shell.rm('flare_*');

    var result = { ret:ret };
    res.status(200).json(result);

});

app.listen(8080, function () {
    console.log('Listening on port 8080')
})