/**
 * Main application file...
 */
 
var dba = require('./data/adapter_sqlite');
dba.status();


var Buffer = require('buffer').Buffer;
var dgram = require('dgram');


//sock = dgram.createSocket("udp4", recvMsg);
var recvMsg = function (msg, rinfo) {
  console.log('got message from '+ rinfo.address +':'+ rinfo.port);
  console.log('data len: '+ rinfo.size + " data: "+ msg.toString('ascii', 0, rinfo.size));
  var parts = msg.split('|');
  console.dir(parts);
};


var testMsg = "|NullServer|"+new Date().getTime()+"|TESTAPP|[[12,12,12],[13,13,13]]";
testMsg = testMsg.length + testMsg;
console.log(testMsg);
recvMsg(
    testMsg,
    {address:'ADDRESS',port:0,size:testMsg.length},
    this
);
//sock.bind(8000, '0.0.0.0');
