const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true}));
app.set('view engine', 'ejs');

var outputRate=0;

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
        console.log('here');
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