/**
 * Contains logic for sending mesages between the SIVIC creative and the player.
 */
class SivicProtocol {
  constructor() {
    /*
     * A map of messsage type to an array of callbacks.
     * @private {Map<String, Array<Function>>}
     */
    this.listeners_ = new Map();

    /*
     * The session ID for this protocol.
     * @private {String}
     */
    this.sessionId_ = '';

    /**
     * The next message ID to use when sending a message.
     * @private {number}
     */
    this.nextMessageId_ = 1;

    /**
     * The window where the message should be posted to.
     * @private {!Element}
     */
     this.target_ = window.parent;

     this.resolutionListeners_ = {};
  }

	/**
   * Sends a message using post message.  Returns a promise
   * that will resolve or reject after the message receives a response.
   * @param {string} messageType The name of the message
   * @param {?Object} messageArgs The arguments for the message, may be null.
	 */
  sendMessage(messageType, messageArgs) {
    const messageId = this.nextMessageId_;
    console.log('sending message ' + messageType + ' ' + messageId);
    // The message object as defined by the SIVIC spec.
    const message = {
      'sessionId': this.sessionId_,
      'messageId': messageId,
      'type': 'SIVIC:' + messageType,
      'args': messageArgs
    }
    // Message ID will increment 1 per message.
    this.nextMessageId_ ++;

    if (EventsThatRequireResponse.includes(messageType)) {
      // If the message requires a callback this code will set
      // up a promise that will call resolve or reject with its parameters.
      return new Promise((resolve, reject) => {
        this.addResolveRejectListener_(messageId, resolve, reject);
        this.target_.postMessage(JSON.stringify(message), '*');
      });
    }
    // A default promise will just resolve immediately.
    // It is assumed no one would listen to these promises.
    return new Promise((resolve, reject) => {
      this.target_.postMessage(JSON.stringify(message), '*');
      resolve();
    });
	}

  /**
   * Adds a listener for a given message.
   */
  addListener(messageType, callback) {
    if (!this.listeners_[messageType]) {
      this.listeners_[messageType] = [callback];
    } else {
      this.listeners_[messageType].push(callback);
    }
  }

  /**
   * Sets up a listener for resolve/reject messages.
   */
  addResolveRejectListener_(messageId, resolve, reject) {
    const listener = (data) => {
      this.initializeSessionIdIfNotSet(data.sessionId);
      if (data['type'] == 'resolve') {
        resolve(data['args']);
      } else if (data['type'] == 'reject') {
        reject(data['args']);
      }
    }
    this.resolutionListeners_[messageId] = listener.bind(this);
  }

  /**
   * Recieves messages.
   */
  receiveMessage(event) {
    const data = JSON.parse(event.data);
    if (!data) {
      // If there is no data in the event this is not a SIVIC message.
      return;
    }
    const sessionId = data['sessionId'];

    const type = data['type'];
    // Verifies sesion ID's match, while accounting for the ready, special case
    // where a session ID is not yet set.
    const matchesSessionId = this.sessionId_ == sessionId ||
        this.sessionId_ == '' || type == 'SIVIC:' + CreativeMessage.READY;

    if (!matchesSessionId || type == null) {
      return;
    }
    console.log('receive message ' + type + ' id ' + data['messageId']);

    // There are 2 types of messages to handle:
    // 1. Resolve/Reject messages
    // 2. Messages starting with SIVIC:
    if (type == 'resolve' || type == 'reject') {
      const messageId = data['messageId'];
      if (this.resolutionListeners_[messageId]) {
        // If the listener exists call it once only.
        this.resolutionListeners_[messageId](data);
        delete this.resolutionListeners_[messageId];
      } 
    } else if (type.startsWith('SIVIC:')) {
      // Remove SIVIC: from the front of the message so we can compare them with the map.
      const specificType = type.substr(6);
      if (this.listeners_[specificType]) {
        // calls each of the listeners with the data.
        this.listeners_[specificType].forEach((listener) => listener(data));
      }
    }
  }

  /**
   * Resolves an incoming message.
   * @param {!Object} incomingMessage the message that is being resolved.
   * @param {!Object} outgoingArgs Any arguments that are part of the resolution.
   */
  resolve(incomingMessage, outgoingArgs) {
    const messageId = incomingMessage['messageId'];
    const message = {
      'sessionId': this.sessionId_,
      'messageId': messageId,
      'type': 'resolve',
      'args': outgoingArgs
    }
    this.target_.postMessage(JSON.stringify(message), '*');
  }

  /**
   * Rejects an incoming message.
   * @param {!Object} incomingMessage the message that is being resolved.
   * @param {!Object} outgoingArgs Any arguments that are part of the resolution.
   */
  sendReject(data, outgoingArgs) {
    const messageId = incomingMessage['messageId'];
    const message = {
      'sessionId': this.sessionId_,
      'messageId': messageId,
      'type': 'reject',
      'args': outgoingArgs
    }
    this.target_.postMessage(JSON.stringify(message), '*');
  }

  /**
   * If the session ID is not yet set, use the session ID from this first callback.
   * @param {String} sessionId
   * @private
   */
  initializeSessionIdIfNotSet(sessionId) {
    if (this.sessionId_ == '' && sessionId) {
      this.sessionId_ = sessionId;
    }
  }

  /**
   * Sets the session ID, this should only be used by the player
   */
  generateSessionId() {
    this.sessionId_ = Math.floor(Math.random() * 9999).toString();
  }

  setMessageTarget(target) {
    this.target_ = target;
  }
}


// Generates a single instance of the protocol layer.
const sivicProtocol = new SivicProtocol();

// listens for any messages to this window.
window.addEventListener("message",
   sivicProtocol.receiveMessage.bind(sivicProtocol), false);



/** Contains all constants common across SIVIC */

VideoMessage = {
  DURATION_CHANGE: "Video:durationchange",
  ENDED: "Video:ended",
  ERROR: "Video:error",
  PAUSE: "Video:pause",
  PLAY: "Video:play",
  PLAYING: "Video:playing",
  SEEKED: "Video:seeked",
  SEEKING: "Video:seeking",
  TIME_UPDATE: "Video:timeupdate",
  VOLUME_CHANGE: "Video:volumechange",
};

PlayerMessage = {
  RESIZE: "Player:resize",
  INIT: "Player:init",
  START_CREATIVE: "Player:startCreative",
  AD_SKIPPED: "Player:adSkipped",
  AD_STOPPED: "Player:adStopped",
  FATAL_ERROR: "Player:fatalError",
};

/** Messages from the creative */
CreativeMessage = {
  CLICK_THRU: "Creative:clickThru",
  FATAL_ERROR: "Creative:fatalError",
  GET_VIDEO_STATE: "Creative:getVideoState",
  READY: "Creative:ready",
  REQUEST_FULL_SCREEN: "Creative:requestFullScreen",
  REQUEST_SKIP: "Creative:requestSkip",
  REQUEST_STOP: "Creative:requestStop",
  REQUEST_PAUSE: "Creative:requestPause",
  REQUEST_PLAY: "Creative:requestPlay",
  REQUEST_RESIZE: "Creative:requestResize",
  REQUEST_VOLUME: "Creative:requestVolume",
  REQUEST_TRACKING: "Creative:reportTracking",
  REQUEST_CHANGE_AD_DURATION: "Creative:requestChangeAdDuration",
};

/* Tracking messages supported by the vast spec. Sent from the
 * player to the creative.
 */
TrackingMessages = {
  CLICK_THROUGH: "Tracking:clickThrough",
  CLICK_TRACKING: "Tracking:clickTracking",
  CLOSE_LINEAR: "Tracking:closeLinear",
  COLLAPSE: "Tracking:collapse",
  COMPLETE: "Tracking:complete",
  CREATIVE_VIEW: "Tracking:creativeView",
  CUSTOM_CLICK: "Tracking:customClick",
  EXIT_FULL_SCREEN: "Tracking:exitFullscreen",
  EXPAND: "Tracking:expand",
  FIRST_QUARTILE: "Tracking:firstQuartile",
  FULL_SCREEN: "Tracking:fullscreen",
  IMPRESSION: "Tracking:impression",
  LOADED: "Tracking:loaded",
  MIDPOINT: "Tracking:midpoint",
  MUTE: "Tracking:mute",
  OTHER_AD_INTERACTION: "Tracking:otherAdInteraction",
  PAUSE: "Tracking:pause",
  PLAYER_COLLAPSE: "Tracking:playerCollapse",
  PLAYER_EXPAND: "Tracking:playerExpand",
  PROGRESS: "Tracking:progress",
  RESUME: "Tracking:resume",
  REWIND: "Tracking:rewind",
  SKIP: "Tracking:skip",
  START: "Tracking:start",
  THIRD_QUARTILE: "Tracking:thirdQuartile",
  UNMUTE: "Tracking:unmute",
};

/**
 * These messages require a response (either resolve or reject).
 * All other messages do not require a response and are information only.
 */
EventsThatRequireResponse = [
  CreativeMessage.GET_VIDEO_STATE,
  CreativeMessage.REQUEST_VIDEO_LOCATION,
  CreativeMessage.READY,
  CreativeMessage.CLICK_THRU,
  CreativeMessage.REQUEST_SKIP,
  CreativeMessage.REQUEST_STOP,
  CreativeMessage.REQUEST_PAUSE,
  CreativeMessage.REQUEST_PLAY,
  CreativeMessage.REQUEST_FULL_SCREEN,
  CreativeMessage.REQUEST_FULL_VOLUME,
  CreativeMessage.REQUEST_FULL_RESIZE,
  CreativeMessage.REQUEST_CHANGE_AD_DURATION,
  CreativeMessage.REPORT_TRACKING,
  PlayerMessage.INIT,
  PlayerMessage.START_CREATIVE,
  PlayerMessage.AD_SKIPPED,
  PlayerMessage.AD_STOPPED,
  PlayerMessage.FATAL_ERROR,
  VideoMessage.GET_VIDEO_STATE,
]

