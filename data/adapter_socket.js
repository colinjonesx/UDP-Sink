/*
 *
 * BROKEN!
 *
 */
var EventEmitter = require('events').EventEmitter;

var Buffer = require('buffer').Buffer;
var dgram = require('dgram');
var port = process.env.C9_PORT;
//var log = require('sys').log;
var util = require('util');
misc = {
    debug: false,
    log: function () {
        if (misc.debug) {
            for (var i=0,l=arguments.length; i<l; ++i) {
                if (arguments[i] === fs)
                    Array.prototype.splice.call(arguments,i,1);
            }
            if (arguments) {
                console.log.apply(console,arguments);
            }
        }
    },
    bind: function (context, fn){
        return function(){
            context.that = this;
            misc.log('bind callback');
            return fn.apply(context, arguments);
        };
    },
    extend: function (obj,source) {
        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                obj[key] = source[key];
            }
        };
    return obj;
    }
};



function Socket(){
  EventEmitter.call(this);
  this.super = EventEmitter;
  //this.testMessage = console.dir;
}

Socket.prototype = Object.create(EventEmitter.prototype,{
  constructor:{
    value: Socket,
    enumerable: false    
  }
});
Socket.prototype = misc.extend(Socket.prototype,{
  startListening: function(){
    console.log('Starting UDP Socket on port :'+port);
    sock = dgram.createSocket("udp4", recvMsg);  
    sock.bind(port, '0.0.0.0');  
  },
  testMessage: function(){
    var testMsg = "|NullServer|"+new Date().getTime()+"|TESTAPP|[[12,12,12],[13,13,13]]";
    testMsg = testMsg.length + testMsg;
    console.log(testMsg);
    recvMsg(
        testMsg,
        {address:'ADDRESS',port:0,size:testMsg.length},
        this
    );
}});

recvMsg = function(msg, rinfo, ctx) {
  console.log('got message from '+ rinfo.address +':'+ rinfo.port);
  console.log('data len: '+ rinfo.size + " data: "+ msg.toString('ascii', 0, rinfo.size));
  ctx.emit('receivedUdpMessage',msg);
};


exports.Socket = Socket;