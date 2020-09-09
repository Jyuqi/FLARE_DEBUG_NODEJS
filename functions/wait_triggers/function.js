const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const shell = require('shelljs');

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
    let result;
    
    shell.echo(payload.ssh_key.join('\n')).to('/code/id_rsa'); 
    const process1 = cp.spawnSync('/bin/bash', ['/code/flare_pullworkdir.sh', `${payload.gitlab_server}`, `${payload.gitlab_port}`, `${payload.lake_name}`, "triggers_state", `${payload.username}`], { stdio: 'inherit' });


    const fileName = `/root/${payload.lake_name}/state.json`;
    const state = require(fileName);


    if (payload.type == 'alarm' && state.alarm == "false") {
        //change the value in the in-memory object
        state.alarm = "true";
        //Serialize as JSON and Write it to a file
        fs.writeFileSync(fileName, JSON.stringify(state));
    }
    else if(payload.type == 'webhook' && state.webhook == "false") {
        state.webhook = "true";
        fs.writeFileSync(fileName, JSON.stringify(state));
    }
    else if(payload.type == 'payload') {
        state.output = payload;
        fs.writeFileSync(fileName, JSON.stringify(state));
    }

    cp.spawnSync('/bin/bash', ['/code/flare_pushworkdir.sh', `${payload.gitlab_server}`, `${payload.gitlab_port}`, `${payload.lake_name}`, "triggers_state", `${payload.username}`], { stdio: 'inherit' });
    shell.rm('/code/id_rsa');

    if (state.alarm == "true"  && state.webhook == "true" && state.output != "") {
        console.log(Date());
        result = state.output;
        state.alarm = "false";
        state.webhook = "false";
        state.output = "";
        fs.writeFileSync(fileName, JSON.stringify(state));
        cp.spawnSync('/bin/bash', ['/code/flare_pushworkdir.sh', `${payload.gitlab_server}`, `${payload.gitlab_port}`, `${payload.lake_name}`, "triggers_state", `${payload.username}`], { stdio: 'inherit' });
        res.status(200).json(result);
    }
    else{
        res.status(403).json({"result":"not ready"});
    }


});

app.listen(8080, function () {
    console.log('Listening on port 8080')
})