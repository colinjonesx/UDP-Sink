    <html>
    <head><title>UDP-Sink Rough Results</title>
      <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.5/jquery.min.js"></script>
      <script type="text/javascript" src="../jquery.flot.js"></script>
      <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.9/jquery-ui.js"></script>
      <link rel="stylesheet" type="text/css" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.9/themes/redmond/jquery-ui.css" >
      <style type="text/css">
	body{font-family:Tahoma; font-size:10pt;}
      </style>
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
	    },
	    minDate = 9999999999999, maxDate = 0;
	$(document).ready(function(){
	  var now = (new Date()).getTime(),
	      period =  <?php echo (isset($_GET['dt']))?$_GET['dt']:(7*24*3600000); ?>,
	      dataT = {},
	      d=[],
          lastTime = new Date(parseInt(events[events.length - 1].created_at)),
	      fevents = $.grep(events,function(el, elind){
            var createdAt = parseInt(el.created_at);
            minDate = (minDate < createdAt) ? minDate : createdAt;
            maxDate = (maxDate > createdAt) ? maxDate : createdAt;
    		//var now = (new Date()).getTime();
    		//console.log(el.poller_ts,now);
    		return el.created_at > (now - period);
	      }),
	      feventsIds=[];
	  $.each(fevents,function(i,e){
	      feventsIds.push(e.id);
	      var items = e.summary.split(':'),
		      seriesName = items[0]+'->'+items[1],
    	      dataPoint = items[2];
    	      
    	  if(items.length == 1){
              seriesName = 'series';
              dataPoint = items[0];
    	  }
		  if(!dataT[seriesName]) dataT[seriesName] = [];
    	  
    	  dataT[seriesName].push([parseInt(e.created_at),dataPoint]);
	      
	    });
	    for(var series in dataT){
	      d.push({
		label:series,
		data:dataT[series]
		});
	    }
	    console.log(d);
	    $( "#dateRange" ).slider({
			      range: true,
			      min: minDate,
			      max: maxDate,
			      values: [ minDate, maxDate ],
			      slide: function( event, ui ) {
				      //$( "#amount" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
    			      $( "#dateSelection" ).html( new Date(ui.values[ 0 ]).toString() + "<br>" + new Date(ui.values[ 1 ]).toString() );
			      },
    		      stop: function( event, ui ) {
    	              $( "#dateSelection" ).html( new Date(ui.values[ 0 ]).toString() + "<br>" + new Date(ui.values[ 1 ]).toString() );
                      $.plot( $("#placeholder"), d, $.extend(true,{xaxis:{
                      min:ui.values[0],
                      max:ui.values[1]
                      }},plotopts) );
    	          }
		      });
		      //$( "#amount" ).val( "$" + $( "#slider-range" ).slider( "values", 0 ) +
			  //    " - $" + $( "#slider-range" ).slider( "values", 1 ) );
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
	  var plotopts = {
	    xaxis: { mode: "time" },
	    series: {
		lines: { show: true },
		points: { show: true }
	    },
	    grid: { hoverable: true, clickable: true }
	  };
	  $.plot( $("#placeholder"), d, plotopts );
      
	});
      
      </script>
      <p id="summary"></p>
      <div id="placeholder" style="width:800px; height:400px;"></div>
      <div id="dateRange" style="width:800px;"></div>
      <div id="dateSelection">Showing all dates</div>
      <?php
      //print_r($event_rs);
    }
    ?>
    </body>
    </html>
