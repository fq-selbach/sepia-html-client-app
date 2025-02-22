//Frames
function sepiaFW_build_frames(){
	var Frames = {};
	
	//some states
	var isActive = "";
	Frames.isOpen = false;

	//callbacks
	var onFinishSetup = undefined;
	var onOpen = undefined;
	var onClose = undefined;

	//handlers
	var onMessageHandler = undefined; 			//should receive a message object
	var onMissedMessageHandler = undefined;		//should be triggered when a message was not visible for user (e.g. because frame was open)
	var onSpeechToTextInputHandler = undefined;	//should show text (and optionally interrim results) that are generated by STT engine
	var onChatOutputHandler = undefined;		//should show chat output (e.g. TTS text)

	//local pages map
	var localPages = {};

	Frames.getLocalOrDefaultPage = function(pageUrl, languageCode){
		var localCollection = localPages[pageUrl];
		if (localCollection){
			return localCollection[languageCode] || pageUrl;
		}
		return pageUrl;
	}
	Frames.setLocalPage = function(pageUrl, languageCode, localPage){
		var localCollection = localPages[pageUrl];
		if (!localCollection) localCollection = {};
		localCollection[languageCode] = localPage;
		localPages[pageUrl] = localCollection;
	}
	
	Frames.open = function(info){
		//callbacks?
		onOpen = info.onOpen;
		onClose = info.onClose;
		onFinishSetup = info.onFinishSetup;
		onMessageHandler = info.onMessageHandler;
		onMissedMessageHandler = info.onMissedMessageHandler;
		onSpeechToTextInputHandler = info.onSpeechToTextInputHandler;
		onChatOutputHandler = info.onChatOutputHandler;		//NOTE: difference to 'messageHandler' is that this will not block the normal queue, it just delivers the text
		
		//theme
		if (info.theme && info.theme == "dark"){
			$('#sepiaFW-frames-view').addClass('dark');
			$('.sepiaFW-frames-page').addClass('dark');
		}else if (info.theme && info.theme == "dark_full"){
			$('html').addClass('dark');
			$('#sepiaFW-frames-view').addClass('dark');
			$('.sepiaFW-frames-page').addClass('dark');
		}else{	
			$('html').removeClass('dark');
			$('#sepiaFW-frames-view').removeClass('dark');
			$('.sepiaFW-frames-page').removeClass('dark');
		}

		if (isActive != info.pageUrl){
			Frames.setup(info, function(){
				Frames.open(info);
			});
			isActive = info.pageUrl;
			return;
		
		}else{
			$('#sepiaFW-frames-view').slideDown(300, function(){
				Frames.uic.refresh();
			});
			Frames.isOpen = true;
			SepiaFW.ui.switchSwipeBars('frames');
		}
		//on open
		if(onOpen) onOpen();
	}
	Frames.close = function(){
		//design resets (global changes)
		$('html').removeClass('dark');
		//close
		$('#sepiaFW-frames-view').slideUp(300);
		Frames.isOpen = false;
		SepiaFW.ui.switchSwipeBars();
		//on close
		if(onClose) onClose();
		//callbacks reset
		onFinishSetup = undefined;
		onOpen = undefined;
		onClose = undefined;
		//handlers reset
		onMessageHandler = undefined;
		onChatOutputHandler = undefined;
		onMissedMessageHandler = undefined;
		onSpeechToTextInputHandler = undefined;
	}
		
	Frames.setup = function(info, finishCallback){
		//get HTML - is there a language dependent version?
		var framePage = Frames.getLocalOrDefaultPage(info.pageUrl, SepiaFW.config.appLanguage);

		//$.get(framePage, function(frameHtml){
        SepiaFW.files.fetch(framePage, function(frameHtml){
            $('#sepiaFW-frames-view').html(frameHtml);
			
			//nav-bar
			$('#sepiaFW-frames-close').off().on('click', function(){
				Frames.close();
			});

			$('#sepiaFW-frames-show-next-page').off().on('click', function(){
				Frames.uic.next();
			});
			$('#sepiaFW-frames-show-prev-page').off().on('click', function(){
				Frames.uic.prev();
			});
			
			//frame carousel
			Frames.uic = new SepiaFW.ui.Carousel('#sepiaFW-frame-carousel', '', '#sepiaFW-swipeBar-frames-left', '#sepiaFW-swipeBar-frames-right', '',
				function(currentPane){
					$("#sepiaFW-frames-nav-bar-page-indicator").find('div').removeClass("active");
					$("#sepiaFW-frames-nav-bar-page-indicator > div:nth-child(" + (currentPane+1) + ")").addClass('active').fadeTo(350, 1.0).fadeTo(350, 0.0);
					if (currentPane == 1){
						//page 1 active
					}else if (currentPane == 0){
						//page 2 active
					}
				});
			Frames.uic.init();
			Frames.uic.showPane(0);
			
			if (Frames.uic.getNumberOfPanes() <= 1){
				$('#sepiaFW-frames-show-next-page').hide();
				$('#sepiaFW-frames-show-prev-page').hide();
			}

			//on finish setup
			if(onFinishSetup) onFinishSetup();

			if (finishCallback) finishCallback();
        
		//Error
		}, function(){
			$('#sepiaFW-frames-view').html("Error - could not load page");
		});
	}

	Frames.canHandleMessages = function(){
		return !!onMessageHandler;
	}
	Frames.handleMessages = function(msgObject){
		if (onMessageHandler) onMessageHandler(msgObject);
	}

	Frames.canHandleMissedMessages = function(){
		return !!onMissedMessageHandler;
	}
	Frames.handleMissedMessages = function(msgObject){
		if (onMissedMessageHandler) onMissedMessageHandler(msgObject);
	}

	Frames.canShowSpeechToTextInput = function(){
		return !!onSpeechToTextInputHandler;
	}
	Frames.handleSpeechToTextInput = function(msgObject){
		if (onSpeechToTextInputHandler) onSpeechToTextInputHandler(msgObject);
	}

	Frames.canShowChatOutput = function(){
		return !!onChatOutputHandler;
	}
	Frames.handleChatOutput = function(msgObject){
		if (onChatOutputHandler) onChatOutputHandler(msgObject);
	}
	
	return Frames;
}