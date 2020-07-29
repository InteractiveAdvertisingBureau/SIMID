const AdParamKey = {BANNER_TEXT: 'bannerText'};
class BannerNonLinear extends BaseSimidCreative{
    constructor() {
        super();
        this.addButtonClickActions_();
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

    dynamicResize() {
        const newX = this.environmentData.videoDimensions.width * .2;
        const newY = this.environmentData.videoDimensions.height * .8;
        const newWidth = this.environmentData.videoDimensions.width *.75;
        const newHeight = this.environmentData.videoDimensions.height * .2;

        const dynamic_params = {
            'x': newX,
            'y': newY,
            'width': newWidth,
            'height': newHeight,
        };
    
        this.simidProtocol.sendMessage(CreativeMessage.REQUEST_RESIZE, dynamic_params);
    }
}