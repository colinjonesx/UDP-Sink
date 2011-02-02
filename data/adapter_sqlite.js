

var _dba = 'null';
init = function(){
  _dba = 'initialised';
  
  };
  
exports.status = function(){
  console.log('DBA status: '+_dba);
  };


init();