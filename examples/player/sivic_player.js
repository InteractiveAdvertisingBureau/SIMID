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
     * @type {!Element}
     */
    this.sivicIframe_ = this.createSivicIframe_();

    this.trackEventsOnVideoElement_();

    // TODO: Since this sample player doesn't fire any tracking events
    // it is not illustrated how to do this in this sample code.
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
    // Set the iframe creative (right now it is hard coded).
    sivicIframe.src = 'sivic_overlay.html';
    // TODO: contentWindow doesn't exist until after the iframe is created.
    // It may be possible that this leads to a race condition.
    sivicProtocol.setMessageTarget(sivicIframe.contentWindow);
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
    if (this.sivicIframe) {
      this.sivicIframe.remove();
      this.sivicIframe = null;
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

  /** The creative wants to go full screen. */
  onRequestFullScreen(incomingMessage) {
    let videoPromise = this.videoElement_.requestFullScreen();
    let iframePromise = this.sivicIframe_.requestFullScreen();

    Promise.all([videoPromise, iframePromise]).then(
      sivicProtocol.resolve(incomingMessage), //if all promises resolve
      sivicProtocol.reject(incomingMessage) // if some or none resolve
      );

  }
  
  /** The creative wants to play video. */
  onRequestPlay(incomingMessage) {

  }
  
  /** The creative wants to pause video. */
  onRequestPause(incomingMessage) {
  }
  
  /** The creative wants to stop with a fatal error. */
  onCreativeFatalError(incomingMessage) {

  }

  /** The creative wants to skip this ad. */
  onRequestSkip(incomingMessage) {

  }
  
  /** The creative wants to stop the ad early. */
  onRequestStop(incomingMessage) {
  }
}
