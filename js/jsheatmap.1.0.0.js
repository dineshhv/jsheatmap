/*****************************************************
*													 *
*	Author: Dinesh Vadivel							 *
*	Plugin: jsheatmap.1.0.0.js				 *
*	Date:	20-06-2013								 *
*													 *
*													 *
*													 *
*													 *
*													 *
*													 *
*****************************************************/

(function($){
   var JSHeatMap = function(element, options)
   {
       var elem = $(element);
       var obj = this;
       var rand;
       var HeatData=[];
       var ObjSeries={};
	   var byweek={};
	   var bymonth={};
       // Merge options with defaults
       var settings = $.extend({
       	  title		: {
       	  	show	:true,
       	  	text 	:"Hourly vs Weekly"
       	  },
       	  legend		: {
       	  		show : true
       	  },
       	  xAxis		: {
       	  	type: "DateTime",
       	  	label: {
       	  		show:true,
       	  		text:"Weekly"
       	  	},
       	  	defaultView: "Day"
       	  },
          yAxis		: {
       	  	type: "Time",
       	  	label: {
       	  		show:true,
       	  		text:"Hourly"
       	  	},
       	  	defaultView: null
       	  },
       	  zAxis		:{
       	  	 type		: "Integer",
       	  	 popup		:{
       	  	 	show 		: true,
       	  	 	Text	: "count"
			 },
			 colorRange	:{
			 	"0-0":"#000000",
			 	"1-20":"#2ea300",
			 	"21-40":"#90ff00",
			 	"41-60":"#fff600",
			 	"61-80":"#ff8c00",
			 	"81-100":"#ff0000 "
			 }
       	  },
       	  colorRange:{
       	  	start:[]
       	  },
       	  viewBy	:{
       	  	show 	: true,
       	  	items	: ['Day','Weak','Month','Year']
       	  },
          width		: "auto",
          height	: "auto",
          paging	: {
          		type 	: "scroll",
          		itemCount 	: 0,

          },
          heatSeries:{}	

          
       }, options || {});
       
       var matched, browser;
       jQuery.uaMatch = function( ua ) {
	   ua = ua.toLowerCase();
	   var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
        /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
        /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
        /(msie) ([\w.]+)/.exec( ua ) ||
        ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
        [];

		    return {
		        browser: match[ 1 ] || "",
		        version: match[ 2 ] || "0"
		    };
		};

		matched = jQuery.uaMatch( navigator.userAgent );
		browser = {};
		
		if ( matched.browser ) {
		    browser[ matched.browser ] = true;
		    browser.version = matched.version;
		}
		
		// Chrome is Webkit, but Webkit is also Safari.
		if ( browser.chrome ) {
		    browser.webkit = true;
		} else if ( browser.webkit ) {
		    browser.safari = true;
		}
		
		jQuery.browser = browser;
		rand=Math.floor((Math.random() * 999999999) + 9999);
       	// GenerateUI(elem, settings, matched.browser);
       	generate();
      
       
       
       // Public method
       this.addhighlight = function()
       {
           
       };

 	   function generate () {
 	   	$(elem).empty();
 	   	ObjSeries.zSeries=[];
 	   	ObjSeries.xSeries=[];
 	   	ObjSeries.ySeries=[];
 	   	if($.isArray(settings.heatSeries))
 	   	{
	 	   	$.each(settings.heatSeries,function(key,value){
	 	   			ObjSeries.zSeries.push(value.z);
	 	   			ObjSeries.xSeries.push(value.x);
	 	   			ObjSeries.ySeries.push(value.y);
	 	   			console.log(getWeekNumber(value.x))
	 	   	});

			var result = groupBy(settings.heatSeries, function(item) {
					    return [item.x];
			});
			heatCol=result.length;
			heatRow=(settings.heatSeries.length/result.length);
 	   	}
 	   	else
 	   	{
 	   		$.each(settings.heatSeries,function(key,value){
 	   			$.each(value.total_events,function(hour,cnt){
 	   				ObjSeries.zSeries.push(cnt);
	 	   			ObjSeries.xSeries.push(key);
	 	   			ObjSeries.ySeries.push(hour);
 	   			})
	 	   	})
	 	   	heatCol=Object.keys(settings.heatSeries).length;
	 	   	firstItem=Object.keys(settings.heatSeries)[0];
	 	   	heatRow=Object.keys(settings.heatSeries[firstItem].total_events).length;
	 	
 	   	}
 	   	ObjSeries.zmin=Math.min.apply(Math, ObjSeries.zSeries)
 	   	ObjSeries.zmax=Math.max.apply(Math,ObjSeries.zSeries)
 	   	var graphcss='height: 90%; width: 100%;';
 	   	$(elem).append('<div class="HeatMap" id="heatmap-'+rand+'"></div>');
 	   	if(settings.title.show)
 	   		$('.HeatMap').append('<div class="HeatMapTitle" id="HeatMapTitle" style="font-size: 18px ;text-align: center;padding: 2px;">'+settings.title.text+'</div>');
 	   	ObjSeries.axisX=settings.xAxis.type;
 	   	ObjSeries.axisY=settings.yAxis.type;
 	   	if(ObjSeries.axisX=='DateTime'||ObjSeries.axisY=='DateTime')
 	   	{
 	   		ObjSeries.showView=true;
 	   		if(ObjSeries.axisX=='DateTime')
 	   			ObjSeries.type='col'
 	   		else
 	   			ObjSeries.type='row'
 	   	}
 	   	if(settings.viewBy.show&&ObjSeries.showView)
 	   	{
	 	    var viewByString='';
	 	   	$.each(settings.viewBy.items,function(key,value){
	 	   		viewByString+=' <a href="#" id="heatmap-'+value+'" class="viewby" style="font-size:11px; text-decoration: none; color:#000">'+value+'</a> '
	 	   	})
	 	   	viewByString = viewByString.substring(0, viewByString.length - 1)
	 	   	if(ObjSeries.showView)
	 	   		$('.HeatMap').append('<div class="HeatMapviewby" id="HeatMapviewby" style="font-size: 18px ;text-align: center;padding: 2px; border:1px dotted #ddd; border-radius:4px; display:inline-block;position: relative;z-index: 2;top: -26; padding:2px 5px;">'+viewByString+'</div>');
	 	   	$(".HeatMapviewby a").hover(function(){
			  $(this).css("color","#888");
			  },function(){
			  $(this).css("color","#000");
			});
			graphcss+='position: relative;z-index: 2;top: -15px;';
 	   }
        width=$(elem).width();
        
        var tempObj=[];
        var tempData=null;
        $('.HeatMap').append('<div class="HeatMaparea" id="HeatMaparea" style="'+graphcss+'"></div>');
        if($.isArray(settings.heatSeries))
 	   	{
			if(ObjSeries.type=='col')
			{
				percent=90/heatCol;
				heightPercent=90/heatRow;
				Titlehtml='<div class="HeatColumn" style="float:left; max-width:10%; width:auto;">';
				Titlehtml+='<div style=""> &nbsp;</div>';
				$.each(result[0],function(key,value){
					Titlehtml+='<div style="text-align:right;  height:'+heightPercent+'%; text-align:center; vertical-align: middle; ">'+value.y+'</div>';
				})
				Titlehtml+='</div>'
				$('.HeatMap #HeatMaparea').append(Titlehtml)
				paddcss=' padding:10px; line-height: 2rem;'
				$.each(result,function(key,value){
					html='<div class="HeatColumn" style="float:left; width:'+percent+'%;">';
					html+='<div style="text-align:center; ">'+timeConverter(value[0].x)+'</div>'
					$.each(value,function(key1,value1){
						normalized = (value1.z-ObjSeries.zmin)/(ObjSeries.zmax-ObjSeries.zmin)*100
						// console.log(normalized)
						var h= Math.floor((100 - normalized) * 120 / 100);
				        var s = Math.abs(normalized - 50)/50;
				        var v = 1;
				        color=hsv2rgb(h,s,v)
				        R = Math.floor((255 * normalized) / 100)
						G = Math.floor((255 * (100 - normalized)) / 100 )
						B = 0
						//color='rgba('+R+','+G+','+B+',.8)';
						html+='<div class="Heatcells" style="background:'+color+';   height:'+heightPercent+'%; text-align:center; vertical-align: middle;  " data-value='+value1.z+'></div>'; //
					});
					html+='</div>'
					$('.HeatMap #HeatMaparea').append(html)
					

				})
				
				$(".HeatColumn .Heatcells").hover(function(){
					 zvalue=$(this).data('value');			
					 $(this).append('<div class="HeatLegend" style="width:100px; height30px; background:rgba(255,255,255,.9); padding:5px; position: relative; left:25px; border:1px dotted #ddd; transition:2s; line-height:1rem; border-radius:3px;">'+settings.zAxis.popup.Text+' '+zvalue+'</div>');
					 },function(){
					 $(this).empty();
				});
			}
		}
		else
		{
			if(ObjSeries.type=='col')
			{
				percent=90/heatCol;
				
				Titlehtml='<div class="HeatColumn" style="float:left; max-width:10%; width:auto;">';
				Titlehtml+='<div style="test" style="height:20px;"> &nbsp;</div>';
				
				sz=$('#HeatMaparea').height();
				if(((heatRow+1)*14)<=sz)
				{
					skipvalue=1;
					heightPercent=14;
				}
				else
				{
					heightPercent=(sz/(heatRow+1));
					console.log(heightPercent)
					skipvalue=Math.ceil(heatRow/heightPercent)
				}
				$.each(Object.keys(settings.heatSeries[firstItem].total_events),function(key,value){
					if(key%skipvalue==0||key==heatRow)
						dvalue=value
					else
						dvalue=''
						Titlehtml+='<div style="text-align:right;  height:'+heightPercent+'px; text-align:center; vertical-align: middle; ">'+dvalue+'</div>';
					
				})
				
				Titlehtml+='</div>'
				$('.HeatMap #HeatMaparea').append(Titlehtml)
				paddcss=' padding:10px; line-height: 2rem;'

				cz=$('#HeatMaparea').width();
				if(((heatCol+1)*80)<=cz)
				{
					skipcvalue=1;
					widthPercent=50;
				}
				else
				{
					widthPercent=(cz/(heatCol))*10;
					wdper=cz/(heatCol+1)
					skipcvalue=Math.ceil(heatCol/widthPercent)*12
				}
				if(cz<300)
				{
					addOverflow='max-height:18px; overflow-y:hidden;'
				}
				else
				{
					addOverflow=''
				}
				skCnt=0;
				
				$.each(settings.heatSeries,function(key,value){
					
					if(skCnt%skipcvalue==0||key==heatRow)
					{
						dateValue=timeConverter(parseInt(key))
						dss=widthPercent;
					}
					else{
						dateValue='&nbsp;';
						dss=wdper
					}
					html='<div class="HeatColumn" style="float:left; width:'+wdper+'px; height:100%;">';
					html+='<div style="text-align:center; width:'+dss+'px; position:relative; z-index:9; height:20px;" '+addOverflow+'">'+dateValue+'</div>'
					$.each(value.total_events,function(key1,value1){
						$.each(settings.zAxis.colorRange,function(ck,cv){
							part=ck.split('-')
							if(value1<=parseInt(part[1])&&value1>=parseInt(part[0]))
							{
								color=cv;
							}
						});
						// normalized = (value1-ObjSeries.zmin)/(ObjSeries.zmax-ObjSeries.zmin)*100
						// // console.log(normalized)
						// var h= Math.floor((100 - normalized) * 120 / 100);
				  //       var s = Math.abs(normalized - 50)/50;
				  //       var v = 1;
				  //       color=hsv2rgb(h,s,v)
				  //       R = Math.floor((255 * normalized) / 100)
						// G = Math.floor((255 * (100 - normalized)) / 100 )
						// B = 0
						//color='rgba('+R+','+G+','+B+',.8)';
						 html+='<div class="Heatcells" style="background:'+color+'; width:'+wdper+'px;  height:'+heightPercent+'px; text-align:center; vertical-align: middle;  position:relative; z-index:8; " data-value='+value1+'></div>'; //
					});
					
					skCnt++;
					html+='</div>';
					$('.HeatMap #HeatMaparea').append(html)
				})
				
				
			}
		}

			
       }


       	function getWeekNumber(d) {
		    // Copy date so don't modify original
		    d = new Date(+d);
		    d.setHours(0,0,0);
		    // Set to nearest Thursday: current date + 4 - current day number
		    // Make Sunday's day number 7
		    d.setDate(d.getDate() + 4 - (d.getDay()||7));
		    // Get first day of year
		    var yearStart = new Date(d.getFullYear(),0,1);
		    // Calculate full weeks to nearest Thursday
		    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7)
		    // Return array of year and week number
		    return [d.getFullYear(), weekNo];
		}
		function timeConverter(UNIX_timestamp){
		  var a = new Date(UNIX_timestamp);
		  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		  var year = a.getFullYear();
		  var month = months[a.getMonth()];
		  var date = a.getDate();
		  var hour = a.getHours();
		  var min = a.getMinutes();
		  var sec = a.getSeconds();
		  if(hour<10)
		  {
		  	hour='0'+hour;
		  }
		  if(min<10)
		  {
		  	min='0'+min;
		  }
		  if(sec<10)
		  {
		  	sec='0'+sec;
		  }
		  var time = date + '-' + month + '-' + year + ' ';// + hour + ':' + min + ':' + sec ;
		  return time;
		}
       function hexAverage() {
	    var args = Array.prototype.slice.call(arguments);
	    return args.reduce(function (previousValue, currentValue) {
	        return currentValue
	            .replace(/^#/, '')
	            .match(/.{2}/g)
	            .map(function (value, index) {
	                return previousValue[index] + parseInt(value, 16);
	            });
	    }, [0, 0, 0])
	    .reduce(function (previousValue, currentValue) {
	        return previousValue + Math.floor(currentValue / args.length).toString(16);
	    }, '#');
	}
       function hsv2rgb(h, s, v) {
		  // adapted from http://schinckel.net/2012/01/10/hsv-to-rgb-in-javascript/
		  var rgb, i, data = [];
		  if (s === 0) {
		    rgb = [v,v,v];
		  } else {
		    h = h / 60;
		    i = Math.floor(h);
		    data = [v*(1-s), v*(1-s*(h-i)), v*(1-s*(1-(h-i)))];
		    switch(i) {
		      case 0:
		        rgb = [v, data[2], data[0]];
		        break;
		      case 1:
		        rgb = [data[1], v, data[0]];
		        break;
		      case 2:
		        rgb = [data[0], v, data[2]];
		        break;
		      case 3:
		        rgb = [data[0], data[1], v];
		        break;
		      case 4:
		        rgb = [data[2], data[0], v];
		        break;
		      default:
		        rgb = [v, data[0], data[1]];
		        break;
		    }
		  }
		  return '#' + rgb.map(function(x){
		    return ("0" + Math.round(x*255).toString(16)).slice(-2);
		  }).join('');
		};
       function arrayFromObject(obj) {
		    var arr = [];
		    for (var i in obj) {
		        arr.push(obj[i]);
		    }
		    return arr;
		}

		function groupBy(list, fn) {
		    var groups = {};
		    for (var i = 0; i < list.length; i++) {
		        var group = JSON.stringify(fn(list[i]));
		        if (group in groups) {
		            groups[group].push(list[i]);
		        } else {
		            groups[group] = [list[i]];
		        }
		    }
		    return arrayFromObject(groups);
		}
		$.fn.extend({
		  
		  getData: function() {
		  	return settings.heatSeries; 
		  },
		  updateData:function(newSeries)
		  {
		   		settings.heatSeries = newSeries;
		   		generate();
		  }
		});
       
   };

   
  
  
   $.fn.jsHeatMap = function(options)
   {
       return this.each(function()
       {
           var element = $(this);
          
           // Return early if this element already has a plugin instance
           if (element.data('jsHeatMap')) return;

           // pass options to plugin constructor
           var jsHeatMap = new JSHeatMap(this, options);
          
           // Store plugin object in this element's data
           element.data('jsHeatMap', jsHeatMap);
       });
   };
})(jQuery);