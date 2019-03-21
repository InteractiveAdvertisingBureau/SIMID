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
    this.contentVideoElement_ = document.getElementById('video_player');

    /**
     * A reference to a video player for playing ads.
     * @private {!Element}
     */
    this.adVideoElement_ = document.getElementById('ad_video_player');

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

    /**
     * A map of events tracked on the video element.
     * @private {!Map}
     */
    this.videoTrackingEvents_ = new Map();

    /**
     * A function to execute on ad completion
     * @private (!Function)
     */
    this.adComplete_ = adComplete;


    /**
     * Resolution function for the session created message
     */
    this.sessionCreatedResolve_ = null;

    /**
     * A promise that resolves once the creative creates a session.
     * @private {?Promise}
     */
    this.sessionCreated_ = new Promise((resolve, reject) => {
      this.sessionCreatedResolve_ = resolve;
    });

    this.trackEventsOnVideoElement_();
    this.hideAdPlayer_();
  }

  /**
   * Initializes an ad. This should be called before an ad plays.
   */
  initializeAd() {
    // After the iframe is created the player will wait until the ad
    // initializes the communication channel. Then it will call
    // sendInitMessage.
    this.sivicIframe_ = this.createSivicIframe_();
  }

  /**
   * Plays a SIVIC  creative once it has responded to the initialize ad message.
   */
  playAd() {
    this.contentVideoElement_.pause();
    // First make sure that a session is created.
    this.sessionCreated_.then(() => {
      // Once the creative responds to the initialize message, start playback.
      this.initializationPromise_.then(this.startCreativePlayback_.bind(this))
          .catch(this.onAdInitializedFailed_.bind(this));
    });
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
    this.sivicProtocol.addListener(ProtocolMessage.CREATE_SESSION, this.sendInitMessage.bind(this));
    this.sivicProtocol.addListener(CreativeMessage.REQUEST_FULL_SCREEN, this.onRequestFullScreen.bind(this));
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
      this.sivicProtocol.reset();
    }
    this.videoTrackingEvents_.clear();
    for(let [key, func] of this.videoTrackingEvents_) {
      this.adVideoElement_.removeEventListener(key, func, true);
    }
    this.adComplete_();
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
    const videoDimensions = this.getDimensions(this.contentVideoElement_);
    // Since the creative starts as hidden it will take on the
    // video element dimensions, so tell the ad about those dimensions.
    const creativeDimensions = this.getDimensions(this.contentVideoElement_);

    const environmentData = {
      'videoDimenions': videoDimensions,
      'creativeDimensions': creativeDimensions,
      'fullscreen': false,
      'fullscreenAllowed': true,
      'variableDurationAllowed': true,
      'skippableState': 'adHandles', // This player does not render a skip button.
      'siteUrl': document.location.host,
      'appId': '', // This is not relevant on desktop
      'useragent': '', // This should be filled in for sdks and players
      'deviceId': '', // This should be filled in on mobile
      'muted': this.adVideoElement_.muted,
      'volume': this.adVideoElement_.volume
    }

    const creativeData = {
      'adParameters' : document.getElementById('ad_params').value,
      // These values should be populated from the VAST response.
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
    // It is possible that start is called before this initializationm message is sent.
    this.sessionCreatedResolve_();
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
    this.showAdPlayer_();
    this.adVideoElement_.src = document.getElementById('video_url').value;
    this.adVideoElement_.play();
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
    const closeMessage = {
      'code': StopCode.CREATIVE_INITIATED,
    }
    // Instead of destroying the iframe immediately tell hide it until
    // it acknowledges its fatal error.
    this.hideSivicIFrame_();
    this.sivicProtocol.sendMessage(PlayerMessage.AD_STOPPED, closeMessage)
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

  /** @private */
  showAdPlayer_() {
      // show the ad video element
    this.adVideoElement_.style.display = '';
    document.getElementById('ad_video_div').style.display = '';
  }

  /** @private */
  hideAdPlayer_() {
    // Unload the video
    this.adVideoElement_.style.display = 'none';
    document.getElementById('ad_video_div').style.display = 'none';
  }

  /**
   * Tracks the events on the video element specified by the sivic spec
   * @private
   */
  trackEventsOnVideoElement_() {
    this.videoTrackingEvents_.set("durationchange", () => {
      this.sivicProtocol.sendMessage(VideoMessage.DURATION_CHANGED);
    });
    this.videoTrackingEvents_.set("ended", this.videoComplete.bind(this));
    this.videoTrackingEvents_.set("error", () => {
      this.sivicProtocol.sendMessage(VideoMessage.ERROR,
        {
          'error': '',  // TODO fill in these values correctly
          'message': ''
        });
    });
    this.videoTrackingEvents_.set("pause", () => {
      this.sivicProtocol.sendMessage(VideoMessage.PAUSE);
    });
    this.videoTrackingEvents_.set("play", () => {
      this.sivicProtocol.sendMessage(VideoMessage.PLAY);
    });
    this.videoTrackingEvents_.set("playing", () => {
      this.sivicProtocol.sendMessage(VideoMessage.PLAYING);
    });
    this.videoTrackingEvents_.set("seeked", () => {
      this.sivicProtocol.sendMessage(VideoMessage.SEEKED);
    });
    this.videoTrackingEvents_.set("seeking", () => {
      this.sivicProtocol.sendMessage(VideoMessage.SEEKING);
    });
    this.videoTrackingEvents_.set("timeupdate", () => {
      this.sivicProtocol.sendMessage(VideoMessage.TIME_UPDATE,
        {'currentTime': this.adVideoElement_.currentTime});
    });
    this.videoTrackingEvents_.set("volumechange", () => {
      this.sivicProtocol.sendMessage(VideoMessage.VOLUME_CHANGE,
        {'volume': this.adVideoElement_.volume});
    });

    for(let [key, func] of this.videoTrackingEvents_) {
      this.adVideoElement_.addEventListener(key, func, true);
    }
  }

  /**
   * Called when video playback is complete.
   * @private
   */
  videoComplete() {
      this.sivicProtocol.sendMessage(VideoMessage.ENDED);
      // once an ad is complete an the iframe should be hidden
      this.hideSivicIFrame_();
      const closeMessage = {
        'code': StopCode.MEDIA_PLAYBACK_COMPLETE,
      }
      // Wait for the SIVIC creative to acknowledge stop and then clean
      // up the iframe.
      this.sivicProtocol.sendMessage(PlayerMessage.AD_STOPPED)
        .then(this.destroySivicIframe());
  }

  /**
   * Stops the ad and destroys the ad iframe.
   */
  stopAd() {
    this.adVideoElement_.src = '';
    this.hideAdPlayer_();
    this.contentVideoElement_.play();
    this.destroySivicIframe();
    // TODO: Let the ad know it is being stopped.
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
    this.adVideoElement_.play().then(
      // The play function returns a promise.
      this.sivicProtocol.resolve(incomingMessage),
      this.sivicProtocol.reject(incomingMessage)
    );
  }
  
  /** The creative wants to pause video. */
  onRequestPause(incomingMessage) {
    this.adVideoElement_.pause();
    this.sivicProtocol.resolve(incomingMessage);
  }
  
  /** The creative wants to stop with a fatal error. */
  onCreativeFatalError(incomingMessage) {
    this.sivicProtocol.resolve(incomingMessage);
    const closeMessage = {
      'code': StopCode.CREATIVE_INITIATED,
    }
    this.sivicProtocol.sendMessage(PlayerMessage.AD_STOPPED, closeMessage)
      .then(this.stopAd());
  }

  /** The creative wants to skip this ad. */
  onRequestSkip(incomingMessage) {
    this.sivicProtocol.resolve(incomingMessage);
    this.sivicProtocol.sendMessage(PlayerMessage.AD_SKIPPED, {})
        .then(this.stopAd());
  }
  
  /** The creative wants to stop the ad early. */
  onRequestStop(incomingMessage) {
    this.sivicProtocol.resolve(incomingMessage);
    const stopReason = {
      'code': StopCode.CREATIVE_INITIATED,
    }
    // After the creative resolves then the iframe should be destroyed.
    this.sivicProtocol.sendMessage(PlayerMessage.AD_STOPPED, stopReason)
        .then(this.stopAd());
  }

  /**
   * The player must implement sending tracking pixels from the creative.
   * This sample implementation does not show how to send tracking pixels or
   * replace macros. That should be done using the players standard workflow.
   */
  onReportTracking(incomingMessage) {
    const requestedUrlArray = incomingMessage.args['trackingUrls']
    console.log('The creative has asked for the player to ping ' + requestedUrlArray);
  }
}
