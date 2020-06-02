/**
 * All the logic for a simple SIMID player
 */
class SimidPlayer {

  /**
   * Sets up the creative iframe and starts listening for messages
   * from the creative.
   * @param {!Function} This function gets called when the ad stops.
   */
  constructor(adComplete) {
    /**
     * The protocol for sending and receiving messages.
     * @protected {!SimidProtocol}
     */
    this.simidProtocol = new SimidProtocol();

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
     * A reference to the iframe holding the SIMID creative.
     * @private {?Element}
     */
    this.simidIframe_ = null;

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
    this.simidIframe_ = this.createSimidIframe_();
  }

  /**
   * Plays a SIMID  creative once it has responded to the initialize ad message.
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
   * Sets up an iframe for holding the simid element.
   *
   * @return {!Element} The iframe where the simid element lives.
   * @private
   */
  createSimidIframe_() {
    const playerDiv = document.getElementById('player_div');
    const simidIframe = document.createElement('iframe');
    simidIframe.style.display = 'none';
    // The target of the player to send messages to is the newly
    // created iframe.
    playerDiv.appendChild(simidIframe);
    // Set up css to overlay the SIMID iframe over the video creative.
    simidIframe.classList.add('simid_creative');
    // Set the iframe creative, this should be an html creative.
    // TODO: This sample does not show what to do when loading fails.
    simidIframe.src = document.getElementById('creative_url').value;

    this.simidProtocol.setMessageTarget(simidIframe.contentWindow);
    simidIframe.setAttribute('allowFullScreen', '')
    return simidIframe;
  }

  /**
   * Listens to all relevant messages from the SIMID add.
   * @private
   */
  addListeners_() {
    this.simidProtocol.addListener(ProtocolMessage.CREATE_SESSION, this.sendInitMessage.bind(this));
    this.simidProtocol.addListener(CreativeMessage.REQUEST_FULL_SCREEN, this.onRequestFullScreen.bind(this));
    this.simidProtocol.addListener(CreativeMessage.REQUEST_PLAY, this.onRequestPlay.bind(this));
    this.simidProtocol.addListener(CreativeMessage.REQUEST_PAUSE, this.onRequestPause.bind(this));
    this.simidProtocol.addListener(CreativeMessage.FATAL_ERROR, this.onCreativeFatalError.bind(this));
    this.simidProtocol.addListener(CreativeMessage.REQUEST_SKIP, this.onRequestSkip.bind(this));
    this.simidProtocol.addListener(CreativeMessage.REQUEST_STOP, this.onRequestStop.bind(this));
  }

  destroySimidIframe() {
    if (this.simidIframe_) {
      this.simidIframe_.remove();
      this.simidIframe_ = null;
      this.simidProtocol.reset();
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
   * Initializes the SIMID creative with all data it needs.
   */
  sendInitMessage() {
    const videoDimensions = this.getDimensions(this.contentVideoElement_);
    // Since the creative starts as hidden it will take on the
    // video element dimensions, so tell the ad about those dimensions.
    const creativeDimensions = this.getDimensions(this.contentVideoElement_);

    const environmentData = {
      'videoDimensions': videoDimensions,
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
    this.initializationPromise_ = this.simidProtocol.sendMessage(
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
    this.showSimidIFrame_();
    this.showAdPlayer_();
    this.adVideoElement_.src = document.getElementById('video_url').value;
    this.adVideoElement_.play();
    this.simidProtocol.sendMessage(PlayerMessage.START_CREATIVE);
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
    this.hideSimidIFrame_();
    this.simidProtocol.sendMessage(PlayerMessage.AD_STOPPED, closeMessage)
      .then(this.stopAd.bind(this));
  }

  /** @private */
  hideSimidIFrame_() {
    this.simidIframe_.style.display = 'none';
  }

  /** @private */
  showSimidIFrame_() {
    this.simidIframe_.style.display = 'block';
  }

  /** @private */
  showAdPlayer_() {
      // show the ad video element
    this.adVideoElement_.style.display = 'block';
    document.getElementById('ad_video_div').style.display = 'block';
  }

  /** @private */
  hideAdPlayer_() {
    // Unload the video
    this.adVideoElement_.style.display = 'none';
    document.getElementById('ad_video_div').style.display = 'none';
  }

  /**
   * Tracks the events on the video element specified by the simid spec
   * @private
   */
  trackEventsOnVideoElement_() {
    this.videoTrackingEvents_.set("durationchange", () => {
      this.simidProtocol.sendMessage(MediaMessage.DURATION_CHANGED);
    });
    this.videoTrackingEvents_.set("ended", this.videoComplete.bind(this));
    this.videoTrackingEvents_.set("error", () => {
      this.simidProtocol.sendMessage(MediaMessage.ERROR,
        {
          'error': '',  // TODO fill in these values correctly
          'message': ''
        });
    });
    this.videoTrackingEvents_.set("pause", () => {
      this.simidProtocol.sendMessage(MediaMessage.PAUSE);
    });
    this.videoTrackingEvents_.set("play", () => {
      this.simidProtocol.sendMessage(MediaMessage.PLAY);
    });
    this.videoTrackingEvents_.set("playing", () => {
      this.simidProtocol.sendMessage(MediaMessage.PLAYING);
    });
    this.videoTrackingEvents_.set("seeked", () => {
      this.simidProtocol.sendMessage(MediaMessage.SEEKED);
    });
    this.videoTrackingEvents_.set("seeking", () => {
      this.simidProtocol.sendMessage(MediaMessage.SEEKING);
    });
    this.videoTrackingEvents_.set("timeupdate", () => {
      this.simidProtocol.sendMessage(MediaMessage.TIME_UPDATE,
        {'currentTime': this.adVideoElement_.currentTime});
    });
    this.videoTrackingEvents_.set("volumechange", () => {
      this.simidProtocol.sendMessage(MediaMessage.VOLUME_CHANGE,
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
      this.simidProtocol.sendMessage(MediaMessage.ENDED);
      // once an ad is complete an the iframe should be hidden
      this.hideSimidIFrame_();
      const closeMessage = {
        'code': StopCode.MEDIA_PLAYBACK_COMPLETE,
      }
      // Wait for the SIMID creative to acknowledge stop and then clean
      // up the iframe.
      this.simidProtocol.sendMessage(PlayerMessage.AD_STOPPED)
        .then(this.destroySimidIframe());
  }

  /**
   * Stops the ad and destroys the ad iframe.
   */
  stopAd() {
    this.adVideoElement_.src = '';
    this.hideAdPlayer_();
    this.contentVideoElement_.play();
    this.destroySimidIframe();
    // TODO: Let the ad know it is being stopped.
  }

  /** The creative wants to go full screen. */
  onRequestFullScreen(incomingMessage) {
    // The spec currently says to only request fullscreen for the iframe.
    let promise = null;
    if (this.simidIframe_.requestFullscreen) {
      promise = this.simidIframe_.requestFullscreen();
    } else if (this.simidIframe_.mozRequestFullScreen) {
      // Our tests indicate firefox will probably not respect the request.
      promise = this.simidIframe_.mozRequestFullScreen();
    } else if (this.simidIframe_.webkitRequestFullscreen) {
      promise = this.simidIframe_.webkitRequestFullscreen();
    } else if (this.simidIframe_.msRequestFullscreen) {
      // Our tests indicate IE will probably not respect the request.
      promise = this.simidIframe_.msRequestFullscreen();
    }
    if (promise) {
      promise.then(() => this.simidProtocol.resolve(incomingMessage));
    } else {
      // TODO: Many browsers are not returning promises but are still
      // going full screen. Assuming resolve (bad).
      this.simidProtocol.resolve(incomingMessage)
    }
  }
  
  /** The creative wants to play video. */
  onRequestPlay(incomingMessage) {
    this.adVideoElement_.play().then(
      // The play function returns a promise.
      this.simidProtocol.resolve(incomingMessage),
      this.simidProtocol.reject(incomingMessage)
    );
  }
  
  /** The creative wants to pause video. */
  onRequestPause(incomingMessage) {
    this.adVideoElement_.pause();
    this.simidProtocol.resolve(incomingMessage);
  }
  
  /** The creative wants to stop with a fatal error. */
  onCreativeFatalError(incomingMessage) {
    this.simidProtocol.resolve(incomingMessage);
    const closeMessage = {
      'code': StopCode.CREATIVE_INITIATED,
    }
    this.simidProtocol.sendMessage(PlayerMessage.AD_STOPPED, closeMessage)
      .then(this.stopAd());
  }

  /** The creative wants to skip this ad. */
  onRequestSkip(incomingMessage) {
    this.simidProtocol.resolve(incomingMessage);
    this.simidProtocol.sendMessage(PlayerMessage.AD_SKIPPED, {})
        .then(this.stopAd());
  }
  
  /** The creative wants to stop the ad early. */
  onRequestStop(incomingMessage) {
    this.simidProtocol.resolve(incomingMessage);
    const stopReason = {
      'code': StopCode.CREATIVE_INITIATED,
    }
    // After the creative resolves then the iframe should be destroyed.
    this.simidProtocol.sendMessage(PlayerMessage.AD_STOPPED, stopReason)
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
