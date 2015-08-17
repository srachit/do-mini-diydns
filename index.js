/**
 * Author : Rachit Sengupta
 * Description: This program updates the ip address of a specific A Name DNS to your computer's ip address
 *              thus providing a proper url to your localhost
 */

// var sys = require('sys');
// var exec = require('child_process').exec;
// var child;
var os = require('os');
var https = require('https');
var colors = require('colors');

// CHANGE VARIABLE TO YOUR PERSONAL DIGITAL OCEAN TOKEN
var personal_token = 'YOUR_PERSONAL_TOKEN_HERE';
//CHANGE VARIABLE BELOW TO YOUR A Name ID
var a_id = 8180456;

get_domain_info();


function get_domain_info()
{
    var options = {
      host: 'api.digitalocean.com',
        path: '/v2/domains/srachit.com/records/'+a_id,
        headers: {
            'Authorization': 'Bearer ' + personal_token,
            'Content-Type': 'application/json'
        }
    };
    var returnedData = "";

    https.get(options, function(res){
        res.on('data', function(data){
            returnedData += data;
        });

        res.on('end', function(){
            var dns_record = null;
            returnedData = JSON.parse(returnedData);
            dns_record = returnedData.domain_record;
            check_ip(dns_record);
        });
    }).on('error', function(error){
        console.log(error);
    });
}

function check_ip(dns_record)
{
    var computerIP = os.networkInterfaces().en0[1].address;
    if(dns_record.data != computerIP)
    {
        console.log("Correcting the ip, server has: ".red + dns_record.data.yellow);
        console.log("Your computer's ip is: ".red + computerIP.yellow);
        correct_the_ip();
    }
    else
    {
        console.log("IP on server is correct ".green);
    }
}

function correct_the_ip()
{
    var computerIP = os.networkInterfaces().en0[1].address;
    var returnedData = "";
    var options = {
        host: 'api.digitalocean.com',
        path: '/v2/domains/srachit.com/records/'+a_id,
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + personal_token,
            'Content-Type': 'application/json'
        }
    };

    var inputData = JSON.stringify({
        type: 'A',
        name: 'family',
        data: computerIP.toString()
    });

    var req = https.request(options, function(res){
        res.on('data', function(data){
            returnedData += data;
        });

        res.on('end', function(){
            returnedData = JSON.parse(returnedData);
            if(returnedData.domain_record.data == computerIP)
            {
                console.log("IP successfully updated".green);
            }
            else
            {
                console.log("IP update failed".red);
            }
        });
    });
    req.write(inputData);
    req.end();

    req.on('error', function(error){
        console.log(error);
    });
}

// three hundred thousand miliseconds = 5mins
setInterval(get_domain_info, 2000);