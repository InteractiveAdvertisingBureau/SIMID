const Y_OFFSET_PERCENTAGE = 2;
const X_OFFSET_PERCENTAGE = 2;
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
        console.log(this.initialDimensions_);
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
        this.sendMessageOnEvent_("close_ad", 'click', CreativeMessage.REQUEST_STOP);
        this.onHover_("content_container", 'mouseover');
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

    /** When creative asks to resize itself, this sends a message to the player. */
    storeCreativeDimensions_() {
        const creativeDimensions = {};

        creativeDimensions.x = this.environmentData.creativeDimensions.x;
        creativeDimensions.y = this.environmentData.creativeDimensions.y;
        creativeDimensions.width = this.environmentData.creativeDimensions.width;
        creativeDimensions.height = this.environmentData.creativeDimensions.height;

        return creativeDimensions;
    }

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
}