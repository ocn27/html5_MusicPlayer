$(document).ready(function(){

	//=========================================数据声明
	var music = $("#music")[0];
	var musicIndex = playList.length;;
	//===============================================初始化播放器
	initPlayer(musicIndex);

	music.volume = 0.8;
	function initPlayer(index){
		for(var i=0;i<index;i++){
			$("<li>"+playList[i].musicName+"</li>").appendTo(".music_album_ul");
			$("li")[i].onclick=(function(i){
    			return function(){
    				music.setAttribute("src",playList[i].musicURL);
    				$(".avatar").attr("src",playList[i].avatarURL);
					$(".music_info").html("正在播放：《" + playList[i].musicName + "》-" + playList[i].artist);

    				//进度条初始化
					$(".progress").css({"width":"0"});
					//缓冲进度条初始化
					$(".buffer").css({"width":"0"});

    				toDo("play");
    			}
  			})(i);

  			$("li").mouseenter(function(){
        		$(this).css("background", "#76E4D2");
   			 }).mouseleave(function(){
       			$(this).css("background", "#19CAAC");
   			 });
  		}
	}

	//========================================= mCustomScrollbar插件
	$(".content").mCustomScrollbar();

	//=========================================点击操作
	$(".mid_btn").click(function(){
		//初始化界面点击播放
		if($("#music").attr("src") == null){
			music.setAttribute("src", "music/csa_th.mp3");
			$(".avatar").attr("src", "avatar/csa.jpg");
			$(".music_info").html("正在播放：《天后》-"+"陈势安");
		}
		
		if("image/play.png" == $(".play").attr("src")){
			toDo("play");
		}else if("image/pause.png" == $(".play").attr("src")){
			toDo("pause");
		}
    	
  	});

	//=========================================界面样式控制
	//=========================================1.悬停下拉歌曲列表（speed==）

	$(".progress_bar").mouseenter(function(){
        $(".music_album").stop().slideToggle(200);
    }).mouseleave(function(){
        $(".music_album").stop().slideToggle(200);
    });


	$(".music_album").mouseenter(function(){
        $(".music_album").stop().slideToggle(200);

        
    }).mouseleave(function(){
        $(".music_album").stop().slideToggle(200);
    });

	//=========================================2.播放按钮（mid_btn）效果（speed==）

	$(".mid_btn").mouseenter(function(){
        $(".play").stop().fadeToggle();
    }).mouseleave(function(){
        $(".play").stop().fadeToggle();
    });

	//=========================================播放
	function toDo(action){
		if(action == "play"){

			music.play();
			$(".left_btn,.mid_btn,.right_btn").animate({top:"-30px"});
			$(".play").attr("src", "image/pause.png");
			//canplay事件，缓冲进度条，调用bufferBar方法
			music.addEventListener("canplay", bufferBar, false);
   
		}else if(action == "pause"){

			music.pause();
			$(".left_btn,.mid_btn,.right_btn").animate({top:"0"});
			$(".play").attr("src","image/play.png");
			
		}
		
		//=============================================timeupdate事件 显示剩余时间 和 播放进度条
		music.addEventListener("timeupdate", time_Change, false);
		music.addEventListener("timeupdate",function(){
			//播放进度条
			var progressValue = music.currentTime / music.duration * 399;
			$(".progress").css({"width":parseInt(progressValue) + "px"});
		},false);
		// 播放时间（current_Time && total_Time）
		function time_Change(){

			if (!isNaN(music.duration)) {
				
				var total_Time = music.duration;
				var totalTimeMin = parseInt(total_Time/60);
				var totalTimeSec = parseInt(total_Time%60);
				if (totalTimeSec < 10) {
					totalTimeSec = "0" + totalTimeSec;
				}
				var	current_Time = music.currentTime;
				var currentTimeMin = parseInt(current_Time/60);
				var currentTimeSec = parseInt(current_Time%60);
				if (currentTimeSec < 10) {
					currentTimeSec = "0" + currentTimeSec;
				}
				
				$(".total_rest_Time").html(totalTimeMin + ":" + totalTimeSec);
				$(".current_adjust_Time").html(currentTimeMin + ":" + currentTimeSec);
			}

		}

		//===============================================显示缓冲进度条
		function bufferBar(){
			bufferTimer = setInterval(function(){

				var bufferIndex = music.buffered.length;

				if (bufferIndex > 0 && music.buffered != undefined) {
					var bufferValue = music.buffered.end(bufferIndex-1) / music.duration*399;
					$(".buffer").css({"width":parseInt(bufferValue)+"px"});
					if (Math.abs(music.duration - music.buffered.end(bufferIndex-1)) <1) {
						$(".buffer").css({"width":"399px"});
						clearInterval(bufferTimer);
					};
				};
			},500);
		}

		//=============================================调整播放进度条
		$(".progress_bar").mouseenter(function(ev){
			// 鼠标移入进度条时 removeEventListener（current_Time && total_Time）
			music.removeEventListener("timeupdate", time_Change, false);
			// 鼠标移入进度条时 addEventListener（restTime）
       		music.addEventListener("timeupdate", function(){
       			//剩余时间
				var restTime = music.duration-music.currentTime;
				var restTimeMin = parseInt(restTime / 60);
				var resttimeSecond = parseInt(restTime % 60);
				if (resttimeSecond < 10 ) {
					resttimeSecond = "0" + resttimeSecond;
				};
				$(".total_rest_Time").html("-" + restTimeMin + ":" + resttimeSecond);	
       		}, false);

			$(".progress_bar").mousemove(function(ev){
				porgress_change(this, ev);
   		 	})
   		 }).mouseleave(function(){
   		 	// 鼠标移出进度条时 addEventListener（current_Time && total_Time）
       		music.addEventListener("timeupdate", time_Change, false);
   		});

		function porgress_change(dom,ev){
			var event = window.event || ev;
			var progressX = event.clientX - dom.getBoundingClientRect().left;
			var adjustTime = progressX / 399 * music.duration;
			var adjustTimeMin = parseInt(adjustTime / 60);
			var adjustTimeSec = parseInt(adjustTime % 60);
			if (adjustTimeSec < 10) {
				adjustTimeSec = "0" + adjustTimeSec;
			};
			$(".current_adjust_Time").html(adjustTimeMin + ":" + adjustTimeSec);
			$(".progress_bar").click(function(){
				music.currentTime = parseInt(adjustTime);
   		 	}); 	
		}

		//==============================================播放结束后播放下一曲
		music.addEventListener("ended",function(){
			playMode("end");
		},false);

		function playMode(mode){

			var total_musicNum = playList.length;
			var index = musicIndex;
			if(mode == "end"){
				alert(music.getAttribute("src"));
			}
		}

	}
});