const Y_OFFSET_PERCENTAGE = 8;
const X_OFFSET_PERCENTAGE = 8;
const WIDTH_PERCENTAGE = 1.1;
const HEIGHT_PERCENTAGE = 2;

class HoverNonLinear extends BaseSimidCreative {
    constructor() {
        super();

        this.initialDimensions_ = null;
    }

    /** @override */
    onInit(eventData) {
        super.onInit(eventData);
        this.initialDimensions_ = this.storeCreativeDimensions_();
    }

    /** @override */
    onStart(eventData) {
        super.onStart(eventData);
        this.addActions_();
    }

    /**
     * Adds actions to different buttons available on the overlay.
     * @private
     */
    addActions_() {
        this.sendMessageOnClick_("close_ad", CreativeMessage.REQUEST_STOP);
        this.onHover_("content_container", 'mouseover');
        this.onMouseOut_("content_container", 'mouseout');
    }

    /**
     * Listens for an event on the banner
     * @param {String} elementName The name of the element.
     * @param {String} message The message to send to the player.
     * @private
     */
    sendMessageOnClick_(elementName, message) {
        const sendMessageFunction = () => {this.simidProtocol.sendMessage(message);}
        document.getElementById(elementName).addEventListener('click', sendMessageFunction);
    }

    /**
     * Stores the initial dimensions of the creative on ad initialization.
     * @return {Object} creativeDimensions The original dimensions of the creative
     * @private
     */
    storeCreativeDimensions_() {
        const creativeDimensions = {};

        creativeDimensions.x = this.environmentData.creativeDimensions.x;
        creativeDimensions.y = this.environmentData.creativeDimensions.y;
        creativeDimensions.width = this.environmentData.creativeDimensions.width;
        creativeDimensions.height = this.environmentData.creativeDimensions.height;

        return creativeDimensions;
    }

    /**
     * Adds a hover event listener to the contents of the iframe that expands the iframe.
     * @param {String} elementName The name of the element.
     * @param {Event} event The event performed on the element.
     * @private
     */   
    onHover_(elementName, event) {
        const expandOnHoverFunction = () => {
            const newDimensions = {};

            newDimensions.x = this.initialDimensions_.x * X_OFFSET_PERCENTAGE;
            newDimensions.y = this.initialDimensions_.y * Y_OFFSET_PERCENTAGE;
            newDimensions.width = this.initialDimensions_.width * WIDTH_PERCENTAGE;
            newDimensions.height = this.initialDimensions_.height * HEIGHT_PERCENTAGE;
        
            const resizeParams = {
                creativeDimensions: newDimensions,
            };
        
            this.requestResize(resizeParams);
        }
        document.getElementById(elementName).addEventListener(event, expandOnHoverFunction);
    }

    /**
     * Adds a mouse out event listener to the contents of the iframe that shrinks the iframe
     *  back to its original size.
     * @param {String} elementName The name of the element.
     * @param {Event} event The event performed on the element.
     * @private
     */  
    onMouseOut_(elementName, event) {
        const collpaseOnMouseOutFunction = () => {
            const restoreParams = {
                creativeDimensions: this.initialDimensions_,
            };
        
            this.requestResize(restoreParams);
        }
        document.getElementById(elementName).addEventListener(event, collpaseOnMouseOutFunction);
    }
}