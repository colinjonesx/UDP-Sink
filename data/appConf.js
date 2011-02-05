exports.appConf = {
  apps:{
    TESTAPP:{
      filenameSuffix:'test',
      prepared:false,
      processData:function(dataString){},
      generateSummary:function(data){}    
    },
    PLAT:{
      filenameSuffix:'plat',
      prepared:false,
      processData:function(dataString){
        var results = [],
            items = dataString.split('::');
        if(items){
          for(var i = 0, len = items.length; i<len; i++){
            results.push(['proc',items[i]]);
          }
          
        }
        return results;
      },
      generateSummary:function(data){
        var cpu = 0,
            mem = 0;
        for(var i = 0, len = data.length; i<len; i++){
          if(data[i]){
            var tmp = data[i][1].split(':');
            if(tmp && tmp.length == 4){
              cpu += parseFloat(tmp[2]);
              mem += parseFloat(tmp[3]);
            }
          }
        }
        return "{cpu:"+cpu+",mem:"+mem+"}";
      }
    },
    OM2APP:{
      filenameSuffix:'om2app',
      prepared:false,
      processData:function(dataString){
        var items = dataString.split(':');
        if(items.length != 5) return [['dataError:',data]];
        return [
          ['m',items[0]],
          ['a',items[1]],
          ['d',items[2]],
          ['u',items[3]],
          ['t',items[4]]
          ];
      },
      generateSummary:function(data,orig){
        
        return orig;
      }
    }
  }
}; 