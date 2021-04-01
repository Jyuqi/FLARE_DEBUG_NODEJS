const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const shell = require('shelljs');

function getFormattedTime() {
    var today = new Date();
    var y = today.getFullYear();
    // JavaScript months are 0-based.
    var m = today.getMonth() + 1;
    var d = today.getDate();
    var h = today.getHours();
    var mi = today.getMinutes();
    var s = today.getSeconds();
    return y + "-" + m + "-" + d + "-" + h + "-" + mi + "-" + s;
}

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
    
    shell.exec(`wget https://raw.githubusercontent.com/Jyuqi/FLARE_DEBUG_NODEJS/master/functions/commons/flare_pullworkdir.sh`);
    const process1 = cp.spawnSync('/bin/bash', ['/code/flare_pullworkdir.sh', `${payload.s3_endpoint}`, `${payload.s3_access_key}`, `${payload.s3_secret_key}`, `${payload.container_name}`, `${payload.lake}`], { stdio: 'inherit' });
    if(!process1.status){ 

        const fileName = `/opt/flare/shared/${payload.container_name}/state.json`;
        const state = require(fileName);
    
    
        if (payload.type == 'noaa' && state.noaa == "false") {
            //change the value in the in-memory object
            state.noaa = "true";
            //Serialize as JSON and Write it to a file
            fs.writeFileSync(fileName, JSON.stringify(state));
        }
        else if(payload.type == 'observations' && state.observations == "false") {
            state.observations = "true";
            fs.writeFileSync(fileName, JSON.stringify(state));
        }

        // save the updated state.json to workdir
        shell.exec(`/code/mc cp /opt/flare/shared/${payload.container_name}/state.json flare/${payload.lake}/${payload.container_name}/state.json`);
 

        // Ready to trigger
        if (state.noaa == "true"  && state.observations == "true") {
            shell.exec(`wget https://raw.githubusercontent.com/Jyuqi/FLARE_DEBUG_NODEJS/master/functions/commons/flare_triggernext.sh`);
            const process4 = cp.spawnSync('/bin/bash', ['/code/flare_triggernext.sh', `${payload.openwhisk_apihost}`, `${payload.openwhisk_auth}`, `${payload.container_name}`, `${payload.lake}`], { stdio: 'inherit' });
            if(!process4.status){

                // save the old state.json file with timestamp
                shell.exec(`/code/mc cp /opt/flare/shared/${payload.container_name}/state.json flare/${payload.lake}/${payload.container_name}/state_${getFormattedTime()}.json`);

                // trigger successfully, reinitiate state
                state.noaa = "false";
                state.observations = "false";
                fs.writeFileSync(fileName, JSON.stringify(state));
                ret="success";
                // push the new state.json file to
                shell.exec(`/code/mc cp /opt/flare/shared/${payload.container_name}/state.json flare/${payload.lake}/${payload.container_name}/state.json`);

            }
            else{
                ret="error in running flare_triggernext.sh; ";
            }  
        }
        else{
            ret="not ready; ";
        }
        


    }
    else{
        ret="error in running flare_pullworkdir.sh; ";
    }

    shell.rm('flare_*');
    shell.rm('/code/id_rsa');

    var result = { ret:ret };
    if(ret == "success")
    {
        res.status(200).json(result);
    }
    else{
        res.status(403).json(result);
    }
    

});

app.listen(8080, function () {
    console.log('Listening on port 8080')
})