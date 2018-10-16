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
     * A list of listeners for resolve/reject messages.
     * @private {Array<Function>}
     */
    this.resolveRejectListeners_ = [];

    /**
     * The window where the message should be posted to.
     * @private {!Element}
     */
     this.target_ = window.parent;
  }

	/**
   * Sends a message using post message.  Returns a promise
   * that will resolve or reject after the message receives a response.
   * @param {string} messageType The name of the message
   * @param {?Object} messageArgs The arguments for the message, may be null.
	 */
	sendMessage(messageType, messageArgs) {
    const messageId = this.nextMessageId;
    // The message object as defined by the SIVIC spec.
    message = {
      'sessionId': this.sessionId,
      'messageId': this.nextMessageId,
      'type': 'SIVIC' + messageType,
      'args': messageArgs
    }
    // Message ID will increment 1 per message.
    this.nextMessageId ++;

    // A default promise will just resolve immediately.
    // It is assumed no one would listen to these promises.
    let promiseFunc = (resolve, reject) => {
      window.parent.postMessage(JSON.stringify(message), '*');
      resolve();
    };

    if (EventsThatRequireResponse.contains(messageType)) {
      // If the message requires a callback this code will set
      // up a promise that will call resolve or reject with its parameters.
      promiseFunc = (resolve, reject) => {
        this.addResolveRejectListener_(messageId, resolve, reject);
        window.parent.postMessage(JSON.stringify(message), '*');
      };
    }
    return new Promise(promiseFunc);
	}

  /**
   * Adds a listener for a given message.
   */
  addListener(messageType, callback) {
    if (!listeners[messageType]) {
      listeners[messageType] = [callback];
    } else {
      listeners[messageType].push(callback);
    }
  }

  /**
   * Sets up a listener for resolve/reject messages.
   */
  addResolveRejectListener_(messageId, resolve, reject) {
    const listener = (resolve, reject) => {
      if (message['messageId'] == messageId) {
        if (message['type'] == 'resolve') {
          resolve(message['args']);
        } else if (message['type'] == 'reject') {
          reject(message['args']);
        }
      }
    }
    this.resolveRejectListeners_.push(listener);
  }

  /**
   * Recieves messages.
   */
  receiveMessage(event) {
    console.log(event);
    if (this.sessionId_ != '') {
      console.log(sessionId);
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
window.addEventListener("message", sivicProtocol.receiveMessage, false);
