const AdParamKey = {BANNER_TEXT: 'bannerText'};
class BannerNonLinear extends BaseSimidCreative{
    constructor() {
        super();
        this.addButtonClickActions_();
    }

    /**
     * Receives init message from the player.
     * @param {!Object} eventData Data from the event.
     * @protected
     */
    onInit(eventData) {
        super.onInit(eventData);
        this.dynamicResize_();
    }

    /**
     * Adds actions to different buttons available on the overlay.
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
            'click', sendMessageFunction.bind(this));
    }
    /**
     * Repositions the banner ad according to the dimensions of the video player
     * by calculating desired dimensions and sending a resize request to creative.
     * @private
     */
    dynamicResize_() {
        const newX = this.environmentData.videoDimensions.width * .15;
        const newY = this.environmentData.videoDimensions.height * .7;
        const newWidth = this.environmentData.videoDimensions.width *.7;
        const newHeight = this.environmentData.videoDimensions.height * .15;

        const creativeDimensions = {
            'x': newX,
            'y': newY,
            'width': newWidth,
            'height': newHeight,
        };
        const videoDimensions = this.environmentData.videoDimensions;
        const params = {
            videoDimensions: videoDimensions,
            creativeDimensions: creativeDimensions
        };
    
        this.simidProtocol.sendMessage(CreativeMessage.REQUEST_RESIZE, params);
    }
}