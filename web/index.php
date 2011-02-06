<html>
<head><title>UDP-Sink Rough Results</title>
  <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.5/jquery.min.js"></script>
  <script type="text/javascript" src="../jquery.flot.js"></script>
</head>
<body>
<h3>Hosted Sinks</h3>
<ul>
<?php
foreach( scandir('../data') as $filename ){
  if(strpos($filename,'.sqlite.db')>0) echo "<li><a href='?db=$filename'>$filename</a></li>";
} ?>
</ul>

<?php
if(isset($_GET['db'])){
  echo "<p>Database ".$_GET['db']." selected</p>";
  try {    
    $db = new PDO('sqlite:../data/'.$_GET['db']);
  } catch (PDOException $e) {
    echo 'Connection failed: ' . $e->getMessage();
  }



  $event_rs = $db->query('SELECT * FROM event')->fetchAll(PDO::FETCH_ASSOC);
  // id, source, type, created_at, summary
  echo "<p>".count($event_rs)." event records in db</p>";
  ?>
  <script type="text/javascript">
    var  events = <?php echo json_encode($event_rs); ?>,
         getIndex = function(id, arr){
           for(var i = 0; i < arr.length; i++){
             if(arr[i].id == id){
               return i;
             }
           }
           return -1;
         };
     
    $(document).ready(function(){
      var now = (new Date()).getTime(),
          period =  <?php echo (isset($_GET['dt']))?$_GET['dt']:3600000; ?>,
          dataT = {},
          d=[],
          lastTime = new Date(parseInt(events[events.length - 1].created_at)),
          fevents = $.grep(events,function(el, elind){
            //var now = (new Date()).getTime();
            //console.log(el.poller_ts,now);
            return el.created_at > (now - period);
          }),
          feventsIds=[];
      $.each(fevents,function(i,e){
        feventsIds.push(e.id);
        var items = e.summary.split(':'),
            path = items[0]+'->'+items[1];
            
        if(!dataT[path]) dataT[path] = [];
        
        dataT[path].push([parseInt(e.created_at),items[2]]);
      });
      for(var series in dataT){
        d.push({
          label:series,
          data:dataT[series]
          });
      }
      console.log(d);
  //    console.log(feventsIds);
      $('#summary').html('No of events logged/filtered: '+events.length+'/'+fevents.length+'<br>Last one: '+lastTime);
      //$.getJSON('data.php',{request:'summary',eventIds:feventsIds},function(d, t, req){
      //  var c =[], m = [];
      //  $.each(d, function(ind, el){
      //    var ts = events[getIndex(ind,events)].poller_ts * 1000;
      //    c.push([ts, el[0]]);
      //    m.push([ts, el[1]]);
      //  });
      //  console.log(c);
      //  $.plot($("#placeholder"), [c,m], { xaxis: { mode: "time" },yaxis:{min:0} });
      //});
      //d = [[1295074631000,22],[1295064631000,44]];
      $.plot(
        $("#placeholder"),
        d,
        {
          xaxis: { mode: "time" },
          series: {
              lines: { show: true },
              points: { show: true }
          },
          grid: { hoverable: true, clickable: true }
        }
        
      );
   
    });
  
  </script>
  <p id="summary"></p>
  <div id="placeholder" style="width:800px; height:400px;"></div>
  <?php
  //print_r($event_rs);
}
?>
</body>
</html>
