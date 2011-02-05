var sys    = require('sys'),
    sqlite = require('../lib/sqlite');

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
            {name:'event_id',type:'INTEGER',options:''},
            {name:'key',type:'TEXT',options:''},
            {name:'value',type:'TEXT',options:''}              
          ]
      }]
    };
init = function(){
  for(var key in appConf.apps){
    console.log('Preparing DB '+key);
    prepareDb(key);
  }
};
  
exports.status = function(){
  console.log('DBA status: '+_dba);
};

prepareDb = function(appname){
  _dba = sqlite.openDatabaseSync("./data/udp-sink_"+appConf.apps[appname].filenameSuffix+".sqlite.db");
  var tableCheckQuery = "SELECT * FROM sqlite_master WHERE type='table' AND name='" + defaults.tables[0].name+"'";
  //console.log('checking tables', tableCheckQuery);
  _dba.query(
    tableCheckQuery,
    function(rows){
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
        _dba.query(
          sql,
          function(){
            console.log('db created');
          });
      }
  });
  return true;// db now ready for entries...
}
exports.processMessage = function(msg){
  var parts = msg.split('|'),
      conf = appConf.apps[parts[3]],
      eventSql = "INSERT INTO event (source, type, created_at)"
                +" VALUES ('"+parts[1]+"','"+parts[3]+"',"+parseInt(parts[2])+");";
  
  if(conf){
    //console.log(eventSql);
    //console.log(process.memoryUsage().heapUsed);
    var eventId = _dba.query(eventSql,
      function(result){
        //console.log(result);
    }).insertId;
    if(eventId){
      var details = conf.processData(parts[4]);
      //console.dir(details);
      for(var i = 0, len = details.length; i < len; i++){
        _dba.query(
          "INSERT INTO detail (event_id, key, value) VALUES (?,?,?)",
          [ eventId, details[i][0], details[i][1]]
        );
      }
      // if the packet has no details enter orig string for summarisation
      
      _dba.query("UPDATE event SET SUMMARY = ? WHERE id = ?;",
        [conf.generateSummary(details,parts[4]),eventId]);
      console.log('Entry Added');
    }    
  }else{
    console.log('Application config not found: '+parts[3]);
  }
}


init();
