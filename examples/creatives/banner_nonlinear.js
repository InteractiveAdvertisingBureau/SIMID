const Y_OFFSET_PERCENTAGE = .7;
const X_OFFSET_PERCENTAGE = .15;
const WIDTH_PERCENTAGE = .7;
const HEIGHT_PERCENTAGE = .15;

class BannerNonLinear extends BaseSimidCreative {
    constructor() {
        super();
        this.addButtonClickActions_();
    }

    /** @override */
    onInit(eventData) {
        super.onInit(eventData);
        this.dynamicResize_();
    }

    /**
     * Adds actions to different buttons available on the overlay.
     * @private
     */
    addButtonClickActions_() {
        this.sendMessageOnButtonClick_("close_ad", CreativeMessage.REQUEST_STOP);
        this.sendMessageOnButtonClick_("ad_text", CreativeMessage.REQUEST_EXPAND);
        this.sendMessageOnButtonClick_("minimize_ad", CreativeMessage.REQUEST_COLLAPSE);
    }

    /**
     * Listens for a click event on a button
     * @param {String} elementName The name of the element.
     * @param {String} message The message to send to the player.
     * @private
     */
    sendMessageOnButtonClick_(elementName, message) {
        const sendMessageFunction = () => {this.simidProtocol.sendMessage(message);}
        document.getElementById(elementName).addEventListener(
            'click', sendMessageFunction);
    }

    /**
     * Repositions the banner ad according to the dimensions of the video player
     * by calculating desired dimensions and sending a resize request to creative.
     * @private
     */
    dynamicResize_() {
        // This ad requests that the player resize it and move it, so that it is centered within the player.
        let creativeDimensions = {};
        creativeDimensions.x = this.environmentData.videoDimensions.width * X_OFFSET_PERCENTAGE;
        creativeDimensions.y = this.environmentData.videoDimensions.height * Y_OFFSET_PERCENTAGE;
        creativeDimensions.width = this.environmentData.videoDimensions.width * WIDTH_PERCENTAGE;
        creativeDimensions.height = this.environmentData.videoDimensions.height * HEIGHT_PERCENTAGE;
        const params = {
            videoDimensions: this.environmentData.videoDimensions,
            creativeDimensions: creativeDimensions
        };
        this.requestResize(params);
    }
}