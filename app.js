/**
 * Main application file...
 */

var dba = require('./data/adapter_sqlite');
dba.status();

var Buffer = require('buffer').Buffer;
var dgram = require('dgram');

var recvMsg = function (msg, rinfo) {
  console.log('got message from '+ rinfo.address +':'+ rinfo.port);
  
  dba.processMessage(msg.toString());    
};

if(0){
  var testMsg = "|NullServer|"+new Date().getTime()+"|TESTAPP|[[12,12,12],[13,13,13]]";
  testMsg = testMsg.length + testMsg;
  console.log(testMsg);
  recvMsg(testMsg,{address:'ADDRESS',port:0,size:testMsg.length},this);
}else{
  sock = dgram.createSocket("udp4", recvMsg);
  sock.bind(5224, '0.0.0.0');
}