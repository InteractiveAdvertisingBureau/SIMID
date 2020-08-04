class HoverNonLinear extends BaseSimidCreative {
    constructor() {
        super();
        this.addActions_();
    }

    /** @override */
    onInit(eventData) {
        super.onInit(eventData);
    }

    /**
     * Adds actions to different buttons available on the overlay.
     * @private
     */
    addActions_() {
        this.sendMessageOnEvent_("close_ad", 'click', CreativeMessage.REQUEST_STOP);
        this.sendMessageOnEvent_("content_container", 'mouseover', CreativeMessage.REQUEST_EXPAND);
        this.sendMessageOnEvent_("content_container", 'mouseout', CreativeMessage.REQUEST_COLLAPSE);
    }

    /**
     * Listens for an event on the banner
     * @param {String} elementName The name of the element.
     * @param {Event} event The event performed on the element.
     * @param {String} message The message to send to the player.
     * @private
     */
    sendMessageOnEvent_(elementName, event, message) {
        const sendMessageFunction = () => {this.simidProtocol.sendMessage(message);}
        document.getElementById(elementName).addEventListener(
            event, sendMessageFunction);
    }

}