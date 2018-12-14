/**
 * All the logic for a simple SIVIC player
 */
class SivicPlayer {

  /**
   * Sets up the creative iframe and starts listening for messages
   * from the creative.
   * @param {!Function} This function gets called when the ad stops.
   */
  constructor(adComplete) {
    /**
     * The protocol for sending and receiving messages.
     * @protected {!SivicProtocol}
     */
    this.sivicProtocol = new SivicProtocol();

    this.addListeners_();

    /**
     * A reference to the video player on the players main page
     * @private {!Element}
     */
    this.videoElement_ = document.getElementById('video_player');

    /**
     * A reference to the iframe holding the SIVIC creative.
     * @private {?Element}
     */
    this.sivicIframe_ = null;


    /**
     * A reference to the promise returned when initialization was called.
     * @private {?Promise}
     */
    this.initializationPromise_ = null;

    this.trackEventsOnVideoElement_();

    // TODO: This sample player does not fire any tracking events so
    // doesn't notify the creative about vast events.
  }

  /**
   * Initializes an ad. This should be called before an ad plays.
   */
  initializeAd() {
    this.videoElement_.src = document.getElementById('video_url').value;
    // After the iframe is created the player will wait until the ad
    // initializes the communication channel. Then it will call
    // sendInitMessage.
    this.sivicIframe_ = this.createSivicIframe_();
  }

  /**
   * Plays a SIVIC  creative once it has responded to the initialize ad message.
   */
  playAd() {
    this.initializationPromise_.then(
        this.startCreativePlayback_.bind(this),
        this.onAdInitializedFailed_.bind(this));
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

    this.sivicProtocol.setMessageTarget(sivicIframe.contentWindow);
    sivicIframe.setAttribute('allowFullScreen', '')
    return sivicIframe;
  }

  /**
   * Listens to all relevant messages from the SIVIC add.
   * @private
   */
  addListeners_() {
    this.sivicProtocol.addListener(ProtocolMessage.CREATE_SESSION, this.sendInitMessage.bind(this));    this.sivicProtocol.addListener(CreativeMessage.REQUEST_FULL_SCREEN, this.onRequestFullScreen.bind(this));
    this.sivicProtocol.addListener(CreativeMessage.REQUEST_PLAY, this.onRequestPlay.bind(this));
    this.sivicProtocol.addListener(CreativeMessage.REQUEST_PAUSE, this.onRequestPause.bind(this));
    this.sivicProtocol.addListener(CreativeMessage.FATAL_ERROR, this.onCreativeFatalError.bind(this));
    this.sivicProtocol.addListener(CreativeMessage.REQUEST_SKIP, this.onRequestSkip.bind(this));
    this.sivicProtocol.addListener(CreativeMessage.REQUEST_STOP, this.onRequestStop.bind(this));
  }

  destroySivicIframe() {
    if (this.sivicIframe_) {
      this.sivicIframe_.remove();
      this.sivicIframe_ = null;
      this.sivicProtocol = null;
    }
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
    this.initializationPromise_ = this.sivicProtocol.sendMessage(
        PlayerMessage.INIT, initMessage);
  }

  /**
   * Called once the creative responds positively to being initialized.
   * @param {!Object} data
   * @private
   */
  startCreativePlayback_(data) {
    // Once the ad is successfully initialized it can start.
    // If the ad is not visible it must be made visible here.
    this.showSivicIFrame_();
    this.videoElement_.play();
    this.sivicProtocol.sendMessage(PlayerMessage.START_CREATIVE);
  }

  /**
   * Called if the creative responds with reject after the player
   * initializes the ad.
   * @param {!Object} data
   * @private
   */
  onAdInitializedFailed_(data) {
    console.log("Ad did not inialize so we can error out.");
    const errorMessage = {
      'errorCode': data['errorCode'], // Reuse the error code from the creative.
      'errorMessage': 'Ad failed to initialize.' 
    }
    // Instead of destroying the iframe immediately tell hide it until
    // it acknowledges its fatal error.
    this.hideSivicIFrame_();
    this.sivicProtocol.sendMessage(PlayerMessage.FATAL_ERROR, {})
      .then(this.stopAd.bind(this));
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
      this.sivicProtocol.sendMessage(VideoMessage.DURATION_CHANGED);
    }, true);
    this.videoElement_.addEventListener("ended", this.videoComplete.bind(this), true);
    this.videoElement_.addEventListener("error", () => {
      this.sivicProtocol.sendMessage(VideoMessage.ERROR,
        {
          'error': '',  // TODO fill in these values correctly
          'message': ''
        });
    }, true);
    this.videoElement_.addEventListener("pause", () => {
      this.sivicProtocol.sendMessage(VideoMessage.PAUSE);
    }, true);
    this.videoElement_.addEventListener("play", () => {
      this.sivicProtocol.sendMessage(VideoMessage.PLAY);
    }, true);
    this.videoElement_.addEventListener("playing", () => {
      this.sivicProtocol.sendMessage(VideoMessage.PLAYING);
    }, true);
    this.videoElement_.addEventListener("seeked", () => {
      this.sivicProtocol.sendMessage(VideoMessage.SEEKED);
    }, true);
    this.videoElement_.addEventListener("seeking", () => {
      this.sivicProtocol.sendMessage(VideoMessage.SEEKING);
    }, true);
    this.videoElement_.addEventListener("timeupdate", () => {
      this.sivicProtocol.sendMessage(VideoMessage.TIME_UPDATE,
        {'currentTime': this.videoElement_.currentTime});
    }, true);
    this.videoElement_.addEventListener("volumechange", () => {
      this.sivicProtocol.sendMessage(VideoMessage.VOLUME_CHANGE,
        {'volume': this.videoElement_.volume});
    }, true);
  }

  /**
   * Called when video playback is complete.
   * @private
   */
  videoComplete() {
      this.sivicProtocol.sendMessage(VideoMessage.ENDED);
      // once an ad is complete an the iframe should be hidden
      this.hideSivicIFrame_();
      // Wait for the SIVIC creative to acknowledge stop and then clean
      // up the iframe.
      this.sivicProtocol.sendMessage(PlayerMessage.AD_STOPPED)
        .then(this.destroySivicIframe());
  }

  /**
   * Stops the ad and destroys the ad iframe.
   */
  stopAd() {
    this.videoElement_.src = '';
    this.destroySivicIframe();
    this.onAdComplete();
  }

  /** The creative wants to go full screen. */
  onRequestFullScreen(incomingMessage) {
    // The spec currently says to only request fullscreen for the iframe.
    let promise = null;
    if (this.sivicIframe_.requestFullscreen) {
      promise = this.sivicIframe_.requestFullscreen();
    } else if (this.sivicIframe_.mozRequestFullScreen) {
      // Our tests indicate firefox will probably not respect the request.
      promise = this.sivicIframe_.mozRequestFullScreen();
    } else if (this.sivicIframe_.webkitRequestFullscreen) {
      promise = this.sivicIframe_.webkitRequestFullscreen();
    } else if (this.sivicIframe_.msRequestFullscreen) {
      // Our tests indicate IE will probably not respect the request.
      promise = this.sivicIframe_.msRequestFullscreen();
    }
    if (promise) {
      promise.then(() => this.sivicProtocol.resolve(incomingMessage));
    } else {
      // TODO: Many browsers are not returning promises but are still
      // going full screen. Assuming resolve (bad).
      this.sivicProtocol.resolve(incomingMessage)
    }
  }
  
  /** The creative wants to play video. */
  onRequestPlay(incomingMessage) {
    this.videoElement_.play().then(
      // The play function returns a promise.
      this.sivicProtocol.resolve(incomingMessage),
      this.sivicProtocol.reject(incomingMessage)
    );
  }
  
  /** The creative wants to pause video. */
  onRequestPause(incomingMessage) {
    this.videoElement_.pause();
    this.sivicProtocol.resolve(incomingMessage);
  }
  
  /** The creative wants to stop with a fatal error. */
  onCreativeFatalError(incomingMessage) {
    this.sivicProtocol.resolve(incomingMessage);
    const errorReason = {
      'errorCode': ErrorCode.AD_INTERNAL_ERROR, // TODO there was no good error code.
      'errorMessage': 'Creative had fatal error.'
    }
    this.sivicProtocol.sendMessage(PlayerMessage.FATAL_ERROR, errorReason)
        .then(this.stopAd.bind(this));
  }

  /** The creative wants to skip this ad. */
  onRequestSkip(incomingMessage) {
    this.sivicProtocol.resolve(incomingMessage);
    this.sivicProtocol.sendMessage(PlayerMessage.AD_SKIPPED, {})
        .then(this.stopAd.bind(this));
  }
  
  /** The creative wants to stop the ad early. */
  onRequestStop(incomingMessage) {
    this.sivicProtocol.resolve(incomingMessage);
    const stopReason = {
      'code': 0 // TODO codes are not defined.
    }
    // After the creative resolves then the iframe should be destroyed.
    this.sivicProtocol.sendMessage(PlayerMessage.AD_STOPPED, stopReason)
        .then(this.stopAd.bind(this));
  }
}
