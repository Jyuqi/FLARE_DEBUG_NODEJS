const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
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

    let contents;
    let AUTH = 'd4558532-f53c-44cb-a4a0-3090cfd63880:fr7A1LGN1cA47u14Z37FVhIYLG7Z9pJLJwTM0Csn9bIL2DUvGFRF1NKpd9eXuqhQ';
    let APIHOST = 'js-129-114-104-10.jetstream-cloud.org';
    console.log(`Start sleep ${payload.time} miliseconds`);
    console.log(Date());
    sleep(`${payload.time}`);
    console.log(Date());

    // fire an trigger at the end of an action
    const process1 = cp.spawnSync('/bin/bash', ['/code/create_trigger.sh', `${AUTH}`, `${APIHOST}`], { stdio: 'inherit' });

    var result = { contents:contents };
    res.status(200).json(result);

    function sleep(milliseconds) {
        const date = Date.now();
        let currentDate = null;
        do {
          currentDate = Date.now();
        } while (currentDate - date < milliseconds);
      }

});

app.listen(8080, function () {
    console.log('Listening on port 8080')
})