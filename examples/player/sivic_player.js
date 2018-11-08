/**
 * All the logic for a simple SIVIC player
 */
class SivicPlayer {

  /**
   * Sets up the creative iframe and starts listening for messages
   * from the creative.
   */
  constructor() {
    // Only the player should generate the session ID.
    sivicProtocol.generateSessionId();
    this.setListeners();


    /**
     * A reference to the video player on the players main page
     * @type {!Element}
     */
    this.videoElement_ = document.getElementById('video_player');

    /**
     * A reference to the iframe holding the SIVIC creative.
     * @type {?Element}
     */
    this.sivicIframe_ = null;

    this.trackEventsOnVideoElement_();

    // TODO: This sample player does not fire any tracking events so
    // doesn't notify the creative about vast events.
  }

  /**
   * Initializes a new SIVIC ad
   */
  playAd() {
    // Remove the old ad if its still playing.
    this.stopAd();

    this.videoElement_.src = document.getElementById('video_url').value;
    this.sivicIframe_ = this.createSivicIframe_();
  }

  /**
   * Sets up an iframe for holding the sivic element.
   *
   * @return {!Element} The iframe where the sivic element lives.
   * @private
   */
  createSivicIframe_() {
    const playerDiv = document.getElementById('player_div');
    const sivicIframe = document.createElement('iframe');
    sivicIframe.style.display = 'none';
    // The target of the player to send messages to is the newly
    // created iframe.
    playerDiv.appendChild(sivicIframe);
    // Set up css to overlay the SIVIC iframe over the video creative.
    sivicIframe.classList.add('sivic_creative');
    // Set the iframe creative, this should be an html creative.
    // TODO: This sample does not show what to do when loading fails.
    sivicIframe.src = document.getElementById('creative_url').value;
    // TODO: contentWindow doesn't exist until after the iframe is created.
    // It may be possible that this leads to a race condition.
    sivicProtocol.setMessageTarget(sivicIframe.contentWindow);
    sivicIframe.setAttribute('allowFullScreen', '')
    return sivicIframe;
  }

  setListeners() {
    sivicProtocol.addListener(CreativeMessage.READY, this.onReady.bind(this));
    sivicProtocol.addListener(CreativeMessage.REQUEST_FULL_SCREEN, this.onRequestFullScreen.bind(this));
    sivicProtocol.addListener(CreativeMessage.REQUEST_PLAY, this.onRequestPlay.bind(this));
    sivicProtocol.addListener(CreativeMessage.REQUEST_PAUSE, this.onRequestPause.bind(this));
    sivicProtocol.addListener(CreativeMessage.FATAL_ERROR, this.onCreativeFatalError.bind(this));
    sivicProtocol.addListener(CreativeMessage.REQUEST_SKIP, this.onRequestSkip.bind(this));
    sivicProtocol.addListener(CreativeMessage.REQUEST_STOP, this.onRequestStop.bind(this));
  }

  destroySivicIframe() {
    if (this.sivicIframe_) {
      this.sivicIframe_.remove();
      this.sivicIframe_ = null;
    }
  }

  /**
   * Called after the SIVIC creative sends the ready message.
   * This should be the very first message.
   */
  onReady(incomingData) {
    // Ready should respond with a resolve message and version number.
    sivicProtocol.resolve(incomingData, {'version': '1.0'});

    // After resolution this example is ready to play the ad right away.
    // If it was not ready to play right away the iframe could stay hidden.
    this.sendInitMessage();
  }

  /**
   * Returns the dimensions of an element within the player div.
   * @return {!Object}
   */
  getDimensions(elem) {
    // The player div wraps all elements and is used as the offset.
    const playerDiv = document.getElementById('player_div');
    const playerRect = playerDiv.getBoundingClientRect();
    const videoRect = elem.getBoundingClientRect();
    return {
      'x' : videoRect.x - playerRect.x,
      'y' : videoRect.y - playerRect.y,
      'width' : videoRect.width,
      'height' : videoRect.height,
      // TODO: This example does not currently support transition duration.
      'transitionDuration': 0
    };
  }

  /**
   * Initializes the SIVIC creative with all data it needs.
   */
  sendInitMessage() {
    const videoDimensions = this.getDimensions(this.videoElement_);
    // Since the creative starts as hidden it will take on the
    // video element dimensions, so tell the ad about those dimensions.
    const creativeDimensions = this.getDimensions(this.videoElement_);

    const environmentData = {
      'videoDimenions': videoDimensions,
      'creativeDimensions': creativeDimensions,
      'mode': 'portrait', // TODO: maybe there should be a desktop mode available
      'fullscreen': false,
      'fullscreenAllowed': true,
      'variableDurationAllowed': true,
      'skippableState': 'adHandles', // This player does not render a skip button.
      'siteUrl': document.location.host,
      'appId': '', // This is not relevant on desktop
      'useragent': '', // This should be filled in for sdks and players
      'deviceId': '', // This should be filled in on mobile
      'muted': this.videoElement_.muted,
      'volume': this.videoElement_.volume
    }

    const creativeData = {
      'adParameters' : '', // TODO allow this to be set on the sample player page.
      // These values might be unknown if not parsing actual vast.
      'adId' : '',
      'creativeId' : '',
      'adServingId': '',
      'clickThroughUrl': 'http://example.com'
    }

    const initMessage = {
      'environmentData' : environmentData,
      'creativeData': creativeData
    }
    sivicProtocol.sendMessage(PlayerMessage.INIT, initMessage)
      .then(this.onAdInitialized.bind(this), this.onAdInitializedFailed.bind(this));
  }

  /**
   * Called once the creative responds positively to being initialized.
   * @param {!Object} data
   */
  onAdInitialized(data) {
    // Once the ad is successfully initialized it can start.
    // If the ad is not visible it must be made visible here.
    this.showSivicIFrame_();
    this.videoElement_.play();
    sivicProtocol.sendMessage(PlayerMessage.START_CREATIVE);
  }

  onAdInitializedFailed(data) {
    console.log("Ad did not inialize so we can error out.");
    const errorMessage = {
      'errorCode': data['errorCode'], // Reuse the error code from the creative.
      'errorMessage': 'Ad failed to initialize.' 
    }
    // Instead of destroying the iframe immediately tell hide it until
    // it acknowledges its fatal error.
    this.hideSivicIFrame_();
    sivicProtocol.sendMessage(PlayerMessage.FATAL_ERROR, {})
      .then(this.destroySivicIframe.bind(this));
  }

  /** @private */
  hideSivicIFrame_() {
    this.sivicIframe_.style.display = 'none';
  }

  /** @private */
  showSivicIFrame_() {
    this.sivicIframe_.style.display = '';
  }

  /**
   * Tracks the events on the video element specified by the sivic spec
   * @private
   */
  trackEventsOnVideoElement_() {
    this.videoElement_.addEventListener("durationchange", () => {
      sivicProtocol.sendMessage(VideoMessage.DURATION_CHANGED);
    }, true);
    this.videoElement_.addEventListener("ended", this.videoComplete.bind(this), true);
    this.videoElement_.addEventListener("error", () => {
      sivicProtocol.sendMessage(VideoMessage.ERROR,
        {
          'error': '',  // TODO fill in these values correctly
          'message': ''
        });
    }, true);
    this.videoElement_.addEventListener("pause", () => {
      sivicProtocol.sendMessage(VideoMessage.PAUSE);
    }, true);
    this.videoElement_.addEventListener("play", () => {
      sivicProtocol.sendMessage(VideoMessage.PLAY);
    }, true);
    this.videoElement_.addEventListener("playing", () => {
      sivicProtocol.sendMessage(VideoMessage.PLAYING);
    }, true);
    this.videoElement_.addEventListener("seeked", () => {
      sivicProtocol.sendMessage(VideoMessage.SEEKED);
    }, true);
    this.videoElement_.addEventListener("seeked", () => {
      sivicProtocol.sendMessage(VideoMessage.SEEKING);
    }, true);
    this.videoElement_.addEventListener("timeupdate", () => {
      sivicProtocol.sendMessage(VideoMessage.TIME_UPDATE,
        {'currentTime': this.videoElement_.currentTime});
    }, true);
    this.videoElement_.addEventListener("volumechange", () => {
      sivicProtocol.sendMessage(VideoMessage.VOLUME_CHANGE,
        {'volume': this.videoElement_.volume});
    }, true);
  }

  /**
   * Called when video playback is complete.
   * @private
   */
  videoComplete() {
      sivicProtocol.sendMessage(VideoMessage.ENDED);
      // once an ad is complete an the iframe should be hidden
      this.hideSivicIFrame_();
      // Wait for the SIVIC creative to acknowledge stop and then clean
      // up the iframe.
      sivicProtocol.sendMessage(PlayerMessage.AD_STOPPED)
        .then(this.destroySivicIframe());
  }

  /**
   * Stops the ad and destroys the ad iframe.
   */
  stopAd() {
    this.videoElement_.src = '';
    this.destroySivicIframe();
  }

  /** The creative wants to go full screen. */
  onRequestFullScreen(incomingMessage) {
    // The spec currently says to only request fullscreen for the iframe.
    let promise = null;
    if (this.sivicIframe_.requestFullscreen) {
      promise = this.sivicIframe_.requestFullscreen();
    } else if (this.sivicIframe_.mozRequestFullScreen) {
      promise = this.sivicIframe_.mozRequestFullScreen();
    } else if (this.sivicIframe_.webkitRequestFullscreen) {
      promise = this.sivicIframe_.webkitRequestFullscreen();
    } else if (this.sivicIframe_.msRequestFullscreen) {
      promise = this.sivicIframe_.msRequestFullscreen();
    }
    if (promise) {
      promise.then(() => sivicProtocol.resolve(incomingMessage));
    } else {
      // TODO: Many browsers are not returning promises but are still
      // going full screen. Assuming resolve (bad).
      sivicProtocol.resolve(incomingMessage)
    }
  }
  
  /** The creative wants to play video. */
  onRequestPlay(incomingMessage) {
    this.videoElement_.play().then(
      // The play function returns a promise.
      sivicProtocol.resolve(incomingMessage),
      sivicProtocol.reject(incomingMessage)
    );
  }
  
  /** The creative wants to pause video. */
  onRequestPause(incomingMessage) {
    this.videoElement_.pause();
    sivicProtocol.resolve(incomingMessage);
  }
  
  /** The creative wants to stop with a fatal error. */
  onCreativeFatalError(incomingMessage) {
    sivicProtocol.resolve(incomingMessage);
    const errorReason = {
      'errorCode': ErrorCode.AD_INTERNAL_ERROR, // TODO there was no good error code.
      'errorMessage': 'Creative had fatal error.'
    }
    sivicProtocol.sendMessage(PlayerMessage.FATAL_ERROR, errorReason)
        .then(this.stopAd.bind(this));
  }

  /** The creative wants to skip this ad. */
  onRequestSkip(incomingMessage) {
    sivicProtocol.resolve(incomingMessage);
    sivicProtocol.sendMessage(PlayerMessage.AD_SKIPPED, {})
        .then(this.stopAd.bind(this));
  }
  
  /** The creative wants to stop the ad early. */
  onRequestStop(incomingMessage) {
    sivicProtocol.resolve(incomingMessage);
    const stopReason = {
      'code': 0 // TODO codes are not defined.
    }
    // After the creative resolves then the iframe should be destroyed.
    sivicProtocol.sendMessage(PlayerMessage.AD_STOPPED, stopReason)
        .then(this.stopAd.bind(this));
  }
}
