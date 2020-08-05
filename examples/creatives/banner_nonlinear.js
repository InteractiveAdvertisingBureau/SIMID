const Y_OFFSET_PERCENTAGE = .7;
const X_OFFSET_PERCENTAGE = .15;
const WIDTH_PERCENTAGE = .7;
const HEIGHT_PERCENTAGE = .15;

class BannerNonLinear extends BaseSimidCreative {
    constructor() {
        super();

        /**
         * The desired text on the banner.
         * @private {?string}
         */
        this.bannerText_ = null;
        
        /**
         * The web URL to be displayed.
         * @private {?string}
         */
        this.webUrl_ = null;

        this.addButtonClickActions_();
    }

    /** @override */
    onInit(eventData) {
        this.updateInternalOnInit(eventData);
        this.validateAndParseAdParams_(eventData);
        this.dynamicResize_();
    }

    /**
     * Checks validity of ad parameters and rejects with proper message if invalid.
     * @param eventData an object that contains information details for a particular event
     *   such as event type, unique Ids, creativeData and environmentData.
     * @private 
     */ 
    validateAndParseAdParams_(eventData) {
        debugger;
        if (this.creativeData.adParameters == "") {
        this.simidProtocol.reject(eventData, {errorCode: CreativeErrorCode.UNSPECIFIED, 
            message: 'Ad parameters not found'});
            return;
        }

        let adParams = "";
        try {
        adParams = JSON.parse(this.creativeData.adParameters);
        } catch (exception) {
        this.simidProtocol.reject(eventData, {errorCode: CreativeErrorCode.CREATIVE_INTERNAL_ERROR, 
            message: 'Invalid JSON input for ad parameters'});
            return;
        }
        this.bannerText_ = adParams['bannerText']; 
        this.webUrl_ = adParams['webUrl'];

        console.log("banner text" + this.bannerText_);
        console.log("weburl" + this.webUrl_);

        this.simidProtocol.resolve(eventData, {});
    }

    /**
     * Adds actions to different buttons available on the overlay.
     * @private
     */
    addButtonClickActions_() {
        this.sendMessageOnButtonClick_("close_ad", CreativeMessage.REQUEST_STOP);
        this.onExpand_();
        this.onMinimize_();
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

    /**
     * Adds click event that expands the nonlinear, hides the original ad content and
     * displays the canvas.
     * @private
     */
    onExpand_() {
        document.getElementById("ad_text").addEventListener('click', () => {
            this.simidProtocol.sendMessage(CreativeMessage.REQUEST_EXPAND);
            document.getElementById("ad_text").classList.add("hidden");
            document.getElementById("content_box").classList.remove("hidden");
        });
    }

    /**
     * Adds click event that minimizes the nonlinear, hides the canvas and
     * displays the original content of the ad.
     * @private
     */
    onMinimize_() {
        document.getElementById("minimize_ad").addEventListener('click', () => {
            this.simidProtocol.sendMessage(CreativeMessage.REQUEST_COLLAPSE);
            document.getElementById("ad_text").classList.remove("hidden");
            document.getElementById("content_box").classList.add("hidden");
        });
    }
}