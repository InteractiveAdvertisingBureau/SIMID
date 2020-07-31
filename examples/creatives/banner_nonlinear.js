class BannerNonLinear extends BaseSimidCreative{
    constructor() {
        super();
        this.addButtonClickActions_();
        this.onExpand();
        this.onMinimize();
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
        let creativeDimensions = {};
        creativeDimensions.x = this.environmentData.videoDimensions.width * .15;
        creativeDimensions.y = this.environmentData.videoDimensions.height * .7;
        creativeDimensions.width = this.environmentData.videoDimensions.width *.7;
        creativeDimensions.height = this.environmentData.videoDimensions.height * .15;
        const params = {
            videoDimensions: this.environmentData.videoDimensions,
            creativeDimensions: creativeDimensions
        };
        this.requestResize(params);
    }

    onExpand() {
        document.getElementById("ad_text").addEventListener('click', () => {
            this.simidProtocol.sendMessage(CreativeMessage.REQUEST_EXPAND);
            document.getElementById("ad_text").classList.add("hidden");
            document.getElementById("content_box").classList.remove("hidden");
        });
    }

    onMinimize() {
        document.getElementById("minimize_ad").addEventListener('click', () => {
            this.simidProtocol.sendMessage(CreativeMessage.REQUEST_COLLAPSE);
            document.getElementById("ad_text").classList.remove("hidden");
            document.getElementById("content_box").classList.add("hidden");
        });
    }
}