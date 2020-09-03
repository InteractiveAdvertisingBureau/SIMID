const Y_OFFSET_PERCENTAGE = .7;
const X_OFFSET_PERCENTAGE = .15;
const WIDTH_PERCENTAGE = .7;
const HEIGHT_PERCENTAGE = .15;

/**
 * A sample SIMID non-linear ad for a banner ad that shows a website when clicked on.
 * P.S: Not all websites can be shown and they would need to allow the x-frame-options
 *      header to sameorigin for the ad to display correctly. More information here:
 *      https://web.dev/samesite-cookies-explained/
 */
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
        this.updateCreativeWithParams_();
        this.dynamicResize_();
    }

    /**
     * Checks validity of ad parameters and rejects with proper message if invalid.
     * @param {!Object} eventData an object that contains information details for a particular event
     *   such as event type, unique Ids, creativeData and environmentData.
     * @private 
     */ 
    validateAndParseAdParams_(eventData) {
        if (!this.creativeData.adParameters) {
            this.simidProtocol.reject(eventData, {
                errorCode: CreativeErrorCode.UNSPECIFIED, 
                message: 'Ad parameters not found'
            });
            return;
        }

        let adParams = "";
        try {
            adParams = JSON.parse(this.creativeData.adParameters);
        } catch (exception) {
            this.simidProtocol.reject(eventData, {
                errorCode: CreativeErrorCode.CREATIVE_INTERNAL_ERROR, 
                message: 'Invalid JSON input for ad parameters'
            });
            return;
        }

        this.bannerText_ = adParams['bannerText']; 
        this.webUrl_ = adParams['webUrl'];

        if (!this.webUrl_) {
            this.simidProtocol.reject(eventData, {
              errorCode: CreativeErrorCode.UNSPECIFIED, 
              message: 'Required field webUrl not found'
            });
            return;
        }

        this.simidProtocol.resolve(eventData, {});
    }

    updateCreativeWithParams_() {
        document.getElementById('ad_text').textContent = this.bannerText_;
        document.getElementById('webpage_container').src = this.webUrl_;
    }

    /**
     * Adds actions to different buttons available on the overlay.
     * @private
     */
    addButtonClickActions_() {
        this.sendMessageOnButtonClick_('close_ad', CreativeMessage.REQUEST_STOP);
        
        this.sendMessageOnButtonClick_('ad_text', CreativeMessage.EXPAND_NONLINEAR, () => {
            document.getElementById('ad_text').classList.add('hidden');
            document.getElementById('content_box').classList.remove('hidden');
        });

        this.sendMessageOnButtonClick_('minimize_ad', CreativeMessage.COLLAPSE_NONLINEAR, () => {
            document.getElementById('ad_text').classList.remove('hidden');
            document.getElementById('content_box').classList.add('hidden');
        });
    }

    /**
     * Sends a SIMID message whenever an element is clicked.
     * @param {String} elementName The name of the element.
     * @param {String} message The message to send to the player.
     * @param {?Function} callback This gets executed after the message to the player is sent.
     * @private
     */
    sendMessageOnButtonClick_(elementName, message, callback) {
        const sendMessageFunction = () => {
            this.simidProtocol.sendMessage(message);
            if (callback) {callback()};
        }
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