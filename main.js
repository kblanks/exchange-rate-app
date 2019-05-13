//node js modules
const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');

//setup express framework
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true}));
app.set('view engine', 'ejs');

//initialize variables
var outputRate=0;
const cacheFileName='cachedData.json'

var cachedData = {
}

fs.readFile(cacheFileName, 'utf8', function readFileCallback(err, data){
    if (err){
        console.log('cache file doesnt exist yet');
        //writeCacheData(cachedData)
    }
    else {
        cachedData = JSON.parse(data);
        let currentDate=Date.now();
        if (cachedData.currentDate!="") {
            console.log('value exists in cache');
        }
        else {
            console.log('value does not exist in cache');
        }
    }
})

function writeCacheData(data){
    fs.writeFile(cacheFileName, JSON.stringify(data), 'utf8', function(err){
        if (err){
            console.log('Error writing cache file');
        }
        else{
            console.log('Successfully wrote cache file');
        }
    });
}


app.get('/', function (req, res){
    res.render('index', {output: null, error: null});
})

app.post('/', function (req, res) {
    let amount = req.body.amount;
    let url = 'https://api.exchangeratesapi.io/latest?base=EUR';

    if (outputRate != 0){
        outputText = outputRate*amount;
        res.render('index', { output: outputText, error: null});
    }
    else {
        request(url, function(err, response, body) {
            if (err) {
                res.render('index', { output: null, error: 'ERROR - ruh roh'});
            }
            else {
                let output = JSON.parse(body);
                outputRate = output.rates.USD;
                if(outputRate == undefined){
                    res.render('index', {output: null, error: 'Error, problem with request'});
                }
                else {
                    cachedData[Date.now()]=outputRate;
                    writeCacheData(cachedData);
                    console.log(cachedData);
                    outputText = outputRate*amount;
                    res.render('index', { output: outputText, error: null});
                }
            }
        })
    
    }
})

app.listen(3000, function() {
    console.log('Server listening on port 3000');
})

;