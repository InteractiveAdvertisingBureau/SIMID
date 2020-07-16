/*
 * A subclass of a SIMID ad that implements functionality that will
 * be the same for all simid ads.
 */
class BaseSimidCreative {
  constructor() {
    /**
     * Data about the creative, not known until after init.
     * @protected {?Object}
     */
    this.creativeData = null;

    /**
     * Data about the environment the creative plays in, not known until after init.
     * @protected {?Object}
     */
    this.environmentData = null;

    /**
     * The most recent video state from the player.
     * @protected {?Object}
     */
    this.videoState = {
      currentSrc:'',
      currentTime: -1, // Time not yet known
      duration: -1, // duration unknown
      ended: false,
      muted: false,
      paused: false,
      volume: 0.5,
      fullscreen: false
    }


    /**
     * The simid version, once the player makes it known.
     * @protected {String}
     */
    this.simidVersion = '';

    /**
     * The protocol for sending and receiving messages.
     * @protected {!SimidProtocol}
     */
    this.simidProtocol = new SimidProtocol();

    this.addListeners_();
  }

  /**
   * Sets up the creative to listen for messages from the player
   * @private
   */
  addListeners_() {
    this.simidProtocol.addListener(PlayerMessage.INIT, this.onInit.bind(this));
    this.simidProtocol.addListener(PlayerMessage.START_CREATIVE, this.onStart.bind(this));
    this.simidProtocol.addListener(PlayerMessage.FATAL_ERROR, this.onFatalError.bind(this));
    this.simidProtocol.addListener(PlayerMessage.AD_STOPPED, this.onAdStopped.bind(this));
    this.simidProtocol.addListener(PlayerMessage.AD_SKIPPED, this.onAdSkipped.bind(this));
    this.simidProtocol.addListener(PlayerMessage.LOG, this.onReceivePlayerLog.bind(this));
    // Handlers with different video events.
    this.simidProtocol.addListener(MediaMessage.DURATION_CHANGE, this.onDurationChange.bind(this));
    this.simidProtocol.addListener(MediaMessage.ENDED, this.onVideoEnded.bind(this));
    this.simidProtocol.addListener(MediaMessage.ERROR, this.onVideoError.bind(this));
    this.simidProtocol.addListener(MediaMessage.PAUSE, this.onPause.bind(this));
    this.simidProtocol.addListener(MediaMessage.PLAY, this.onPlay.bind(this));
    this.simidProtocol.addListener(MediaMessage.PLAYING, this.onPlaying.bind(this));
    this.simidProtocol.addListener(MediaMessage.SEEKED, this.onSeeked.bind(this));
    this.simidProtocol.addListener(MediaMessage.SEEKING, this.onSeeking.bind(this));
    this.simidProtocol.addListener(MediaMessage.TIME_UPDATE, this.onTimeUpdate.bind(this));
    this.simidProtocol.addListener(MediaMessage.VOLUME_CHANGE, this.onVolumeChange.bind(this));
  }

  ready() {
    this.simidProtocol.createSession();
  }

  /**
   * Receives init message from the player.
   * @param {!Object} eventData Data from the event.
   * @protected
   */
  onInit(eventData) {
    this.updateInternalOnInit(eventData);
    this.simidProtocol.resolve(eventData, {});
  }

  /**
   * Updates internal data on initialization call.
   *
   * Note: When overriding the onInit function and not wishing
   * to always resolve, subclasses may instead use this function.
   * @param {!Object} eventData Data from the event.
   * @protected
   */
  updateInternalOnInit(eventData) {
    this.creativeData = eventData.args.creativeData;
    this.environmentData = eventData.args.environmentData;
    this.videoState.muted = this.environmentData.muted;
    this.videoState.volume = this.environmentData.volume;
  }

  /**
   * Receives start message from the player.
   * @param {!Object} eventData Data from the event.
   * @protected
   */
  onStart(eventData) {
    // Acknowledge that the ad is started.
    this.simidProtocol.resolve(eventData, {});
    console.log('Simid creative started.')
  }

  /**
   * Called when the creative receives the fatal error message from the player.
   * @protected
   */
  onFatalError(eventData) {
    // After resolving the iframe with this ad should be cleaned up.
    this.simidProtocol.resolve(eventData, {});
  }

  /**
   * Called when the creative receives the stop message from the player.
   * @protected
   */
  onAdStopped(eventData) {
    // After resolving the iframe with this ad should be cleaned up.
    this.simidProtocol.resolve(eventData, {});
  }

  /**
   * Called when the creative receives the skip message from the player.
   * @protected
   */
  onAdSkipped(eventData) {
    // After resolving the iframe with this ad should be cleaned up.
    this.simidProtocol.resolve(eventData, {});
  }

  /** 
   * Opens the click through url and lets the player know about it.
   * @protected
   */
  clickThru() {

  }

  /**
   * Asks the player for the state of the video element.
   * @protected
   */
  fetchMediaState() {
    this.simidProtocol.sendMessage(CreativeMessage.GET_MEDIA_STATE, {})
        .then((data) => this.onGetMediaStateResolve(data));
  }

  /**
   * @protected
   */
  onGetMediaStateResolve(data) {
    this.videoState = data;
  }

  /**
   * @protected
   */
  onDurationChange(data) {
    this.videoState.duration = data.args.duration;
  }

  /**
   * @protected
   */
  onVideoEnded() {
    this.videoState.ended = true;
  }

  /**
   * @protected
   */
  onVideoError() {
    // no op for this example
  }

  /**
   * @protected
   */
  onPause() {
    this.videoState.paused = true;
  }

  /**
   * @protected
   */
  onPlay() {
    this.videoState.paused = false;
  }

  /**
   * @protected
   */
  onPlaying() {
    this.videoState.paused = false;
  }

  /**
   * @protected
   */
  onSeeked() {
    // no op for this example
  }

  /**
   * @protected
   */
  onSeeking() {
    // no op for this example
  }

  /**
   * @protected
   */
  onTimeUpdate(data) {
    this.videoState.currentTime = data.args.currentTime;
  }

  /**
   * @protected
   */
  onVolumeChange(data) {
    this.videoState.volume = data.args.volume;
  }

  onReceivePlayerLog(data) {
    const logMessage = data.args.message;
    console.log("Received message from player: " + logMessage);
  }
}
