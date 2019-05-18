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
const cacheFileName='cachedData.json'
const url = 'https://api.exchangeratesapi.io/latest?base=EUR';
var cachedData = {}
var outputRate=0;

function readCacheData(){
    let returnVal={}
    fs.readFile(cacheFileName, 'utf8', function(err, data){
        if (err){
            console.log('no cache file');
        }
        else {
            console.log('success! read file from cache');
            parsedData = JSON.parse(data);
            console.log(parsedData);
            returnVal=parsedData
        }
    })
    return returnVal
}

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
    cachedData = readCacheData();
    res.render('index', {output: null, error: null});
})

app.post('/', function (req, res) {
    let amount = req.body.amount;
    let today = new Date()
    let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();   
    if (date in cachedData){
        console.log('using cached value to calculate output')
        let outputRate=cachedData[date]
        let outputText = outputRate*amount;
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
                    cachedData[date]=outputRate;
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