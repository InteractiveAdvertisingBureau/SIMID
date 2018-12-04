/*
 * A subclass of a SIVIC ad that implements functionality that will
 * be the same for all sivic ads.
 */
class BaseSivicCreative {
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
    this.videoState = {};

    /**
     * The sivic version, once the player makes it known.
     * @protected {String}
     */
    this.sivicVersion = '';

    /**
     * The protocol for sending and receiving messages.
     * @protected {!SivicProtocol}
     */
    this.sivicProtocol = new SivicProtocol();

    this.addListeners_();
  }

  /**
   * Sets up the creative to listen for messages from the player
   * @private
   */
  addListeners_() {
    this.sivicProtocol.addListener(PlayerMessage.INIT, this.onInit.bind(this));
    this.sivicProtocol.addListener(PlayerMessage.START_CREATIVE, this.onStart.bind(this));
    this.sivicProtocol.addListener(PlayerMessage.FATAL_ERROR, this.onFatalError.bind(this));
    this.sivicProtocol.addListener(PlayerMessage.AD_STOPPED, this.onAdStopped.bind(this));
    this.sivicProtocol.addListener(PlayerMessage.AD_SKIPPED, this.onAdSkipped.bind(this));
    // Handlers with different video events.
    this.sivicProtocol.addListener(VideoMessage.DURATION_CHANGE, this.onDurationChange.bind(this));
    this.sivicProtocol.addListener(VideoMessage.ENDED, this.onVideoEnded.bind(this));
    this.sivicProtocol.addListener(VideoMessage.ERROR, this.onVideoError.bind(this));
    this.sivicProtocol.addListener(VideoMessage.PAUSE, this.onPause.bind(this));
    this.sivicProtocol.addListener(VideoMessage.PLAY, this.onPlay.bind(this));
    this.sivicProtocol.addListener(VideoMessage.PLAYING, this.onPlaying.bind(this));
    this.sivicProtocol.addListener(VideoMessage.SEEKED, this.onSeeked.bind(this));
    this.sivicProtocol.addListener(VideoMessage.SEEKING, this.onSeeking.bind(this));
    this.sivicProtocol.addListener(VideoMessage.TIME_UPDATE, this.onTimeUpdate.bind(this));
    this.sivicProtocol.addListener(VideoMessage.VOLUME_CHANGE, this.onVolumeChange.bind(this));
  }

  ready() {
    this.sivicProtocol.createSession();
  }

  /**
   * Receives init message from the player.
   * @param {!Object} eventData Data from the event.
   */
  onInit(eventData) {
    this.creativeData = eventData.args.creativeData;
    this.environmentData = eventData.args.environmentData;


    this.videoState = {
      currentSrc:'',
      currentTime: -1, // Time not yet known
      duration: -1, // duration unknown
      ended: false,
      muted: this.environmentData.muted,
      paused: false,
      volume: this.environmentData.volume,
      fullscreen: false //TODO add this to environment data in spec
    }
    this.sivicProtocol.resolve(eventData, {});
  }

  /**
   * Receives start message from the player.
   * @param {!Object} eventData Data from the event.
   */
  onStart(eventData) {
    // Acknowledge that the ad is started.
    this.sivicProtocol.resolve(eventData, {});
    console.log('Sivic creative started.')
  }

  /** Called when the creative receives the fatal error message from the player.*/
  onFatalError(eventData) {
    // After resolving the iframe with this ad should be cleaned up.
    this.sivicProtocol.resolve(eventData, {});
  }

  /** Called when the creative receives the stop message from the player.*/
  onAdStopped(eventData) {
    // After resolving the iframe with this ad should be cleaned up.
    this.sivicProtocol.resolve(eventData, {});
  }

  /** Called when the creative receives the skip message from the player.*/
  onAdSkipped(eventData) {
    // After resolving the iframe with this ad should be cleaned up.
    this.sivicProtocol.resolve(eventData, {});
  }

  /** 
   * Opens the click through url and lets the player know about it.
   */
  clickThru() {

  }

  /**
   * Asks the player for the video state.
   */
  fetchVideoState() {
    const onGetVideoStateResolve = (data) => {
      this.videoState = data;
    }
    this.sivicProtocol.sendMessage(CreativeMessages.GET_VIDEO_STATE, {})
        .then(onGetVideoStateResolve.bind(this));
  }

  onDurationChange(data) {
    this.videoState.duration = data.args.duration;
  }

  onVideoEnded() {
    this.videoState.ended = true;
  }

  onVideoError() {
    // no op for this example
  }

  onPause() {
    this.videoState.paused = true;
  }

  onPlay() {
    this.videoState.paused = false;
  }

  onPlaying() {
    this.videoState.paused = false;
  }

  onSeeked() {
    // no op for this example
  }

  onSeeking() {
    // no op for this example
  }

  onTimeUpdate(data) {
    this.videoState.currentTime = data.args.currentTime;
  }

  onVolumeChange(data) {
    this.videoState.volume = data.args.volume;
  }
}
