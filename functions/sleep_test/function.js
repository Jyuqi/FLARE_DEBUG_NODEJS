const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
var shell = require('shelljs');
require('shelljs-plugin-sleep');

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

    // var result = {
    //     "result": {
    //         "echo": payload
    //     }
    // }  
    let contents;
    console.log(`Start sleep ${payload.time} miliseconds`);
    console.log(Date());
    // shell.sleep(`${payload.time}`);
    sleep(`${payload.time}`);
    console.log(Date());

      
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