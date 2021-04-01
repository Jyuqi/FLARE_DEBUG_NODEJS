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
    let result;
    
    shell.exec(`wget https://raw.githubusercontent.com/Jyuqi/FLARE_DEBUG_NODEJS/master/functions/commons/flare_pullworkdir.sh`);
    const process1 = cp.spawnSync('/bin/bash', ['/code/flare_pullworkdir.sh', `${payload.s3_endpoint}`, `${payload.s3_access_key}`, `${payload.s3_secret_key}`, `${payload.container_name}`, `${payload.lake}`], { stdio: 'inherit' });
    if(!process1.status){ 

        const fileName = `/code/state.json`;
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

        // Ready to trigger
        if (state.noaa == "true"  && state.observations == "true") {
            console.log(Date());
            result = state.output;
            fs.copyFile(fileName, `/root/${payload.lake_name}/state_${getFormattedTime()}.json`, (err) => {
                if (err) throw err;
                console.log('OK! Copy state.json');
            });

            // save the updated state.json to workdir
            shell.exec(`wget https://raw.githubusercontent.com/Jyuqi/FLARE_DEBUG_NODEJS/master/functions/commons/flare_pushworkdir.sh`);
            const process3 = cp.spawnSync('/bin/bash', ['/code/flare_pushworkdir.sh', `${payload.s3_endpoint}`, `${payload.s3_access_key}`, `${payload.s3_secret_key}`, `${payload.container_name}`, `${payload.lake}`], { stdio: 'inherit' });
            if(!process3.status){
                shell.exec(`wget https://raw.githubusercontent.com/Jyuqi/FLARE_DEBUG_NODEJS/master/functions/commons/flare_triggernext.sh`);
                const process4 = cp.spawnSync('/bin/bash', ['/code/flare_triggernext.sh', `${payload.openwhisk_apihost}`, `${payload.openwhisk_auth}`, `${payload.container_name}`, `${payload.lake}`], { stdio: 'inherit' });
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

            // reinitiate state
            state.alarm = "false";
            state.webhook = "false";
            state.output = "";
            fs.writeFileSync(fileName, JSON.stringify(state));
    
            res.status(200).json({"result":"success"});
        }
        else{
            res.status(403).json({"result":"not ready"});
        }

    }
    else{
        ret = "error in running flare_pullworkdir.sh; ";
    }


    shell.rm('/code/id_rsa');




});

app.listen(8080, function () {
    console.log('Listening on port 8080')
})