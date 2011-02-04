var sys    = require('sys'),
    sqlite = require('sqlite_async');

var _dba = null,
    appConf = require('./appConf').appConf;
    defaults = {
      tables:[
      {
        name:'event',
        columns:[
            {name:'id',type:'INTEGER',options:'PRIMARY KEY AUTOINCREMENT'},
            {name:'source',type:'TEXT',options:''},
            {name:'type',type:'TEXT',options:''},
            {name:'created_at',type:'INTEGER',options:''},
            {name:'summary',type:'TEXT',options:''}
          ]
      },{
        name:'detail',
        columns:[
            {name:'id',type:'INTEGER',options:'PRIMARY KEY AUTOINCREMENT'},
            {name:'event_id',type:'integer',options:''},
            {name:'key',type:'TEXT',options:''},
            {name:'value',type:'TEXT',options:''}              
          ]
      }]
    };
init = function(){
  _dba = new sqlite.Database();
  
  for(var key in appConf.apps){
    console.log('Preparing DB '+key);
    prepareDb(key);
  }
};
  
exports.status = function(){
  console.log('DBA status: '+_dba);
};

prepareDb = function(appname){
  _dba.open("./data/udp-sink_"+appConf.apps[appname].filenameSuffix+".sqlite.db",function(error){
    //console.log('Preparing DB2');
    if(error){
      console.dir(error);
      console.log('Problem creating db');
      throw error;
    }
    
    var tableCheckQuery = "SELECT * FROM sqlite_master WHERE type='table' AND name='" + defaults.tables[0].name+"'";
    console.log('checking tables', tableCheckQuery);
    _dba.execute(
      tableCheckQuery,
      function(error, rows){
        if(error)throw error;
        console.dir(rows);
        if(!rows || rows.length == 0)
        {
          console.log('creating database');
          var sql = '';
          for(var i = 0; i < defaults.tables.length; i++){
            var t = defaults.tables[i];
            sql += 'DROP TABLE IF EXISTS '+t.name+';';
            sql += 'CREATE TABLE '+t.name+' (';
            for(var j = 0; j < t.columns.length; j++){
              sql += t.columns[j].name+' '+
              t.columns[j].type+' '+
              t.columns[j].options+',';
            }
            sql = sql.substr(0,sql.length-1)+');';
          }
          _dba.executeScript(
            sql,
            function(error){
              if(error)throw error;
              appConf.apps[appname].prepared = true;
              console.dir(appConf);
            });
        }else{
          appConf.apps[appname].prepared = true;
          console.dir(appConf);
        }
    });
  });
  return true;// db now ready for entries...
}
exports.processMessage = function(msg){
  var parts = msg.split('|'),
      eventSql = "INSERT INTO event (source, type, created_at)"
                +" VALUES ('"+parts[1]+"','"+parts[3]+"',"+parts[2]+");"
  
  
  console.log(eventSql);
  //console.log(process.memoryUsage().heapUsed);
  _dba.execute(eventSql,
    function(error, rows){
      if(error){
        //console.log(process.memoryUsage().heapUsed);
        console.dir(error);
        throw error;
      };
      console.log(arguments);
      
  });  
}


init();