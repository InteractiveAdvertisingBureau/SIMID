const QUARTER_THE_SIZE = .25;
const HALF_THE_SIZE = .5;
const THREE_QUARTERS_THE_SIZE = .75;

/* This creative expands and collapses when the user hovers over the banner. */
class HoverNonLinear extends BaseSimidCreative {
    constructor() {
        super();

        this.initialDimensions_ = null;
    }

    /** @override */
    onInit(eventData) {
        super.onInit(eventData);
        this.initialDimensions_ = this.environmentData.creativeDimensions;
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
        this.sendMessageOnClick_('close_ad', CreativeMessage.REQUEST_STOP);
        this.onHover_('content_container', 'mouseover');
        this.onMouseOut_('content_container', 'mouseout');
    }

    /**
     * Sends a SIMID message whenever an element is clicked.
     * @param {String} elementName The name of the element.
     * @param {String} message The message to send to the player.
     * @private
     */
    sendMessageOnClick_(elementName, message) {
        const sendMessageFunction = () => {this.simidProtocol.sendMessage(message);}
        document.getElementById(elementName).addEventListener('click', sendMessageFunction);
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
            let resizeParams = {};

            console.log("video height: " + this.environmentData.videoDimensions.height);
            console.log("half video height: " + this.environmentData.videoDimensions.height * HALF_THE_SIZE);

             //if ad is at the top of the player
            if (this.initialDimensions_.y < (this.environmentData.videoDimensions.height * HALF_THE_SIZE)) {
                console.log(this.initialDimensions_.width);
                console.log("video width: " + this.environmentData.videoDimensions.width);
                newDimensions.height = (this.environmentData.videoDimensions.height * HALF_THE_SIZE);
                newDimensions.x = 0;
                newDimensions.y = 0;
                newDimensions.width = this.environmentData.videoDimensions.width;

                resizeParams = {
                    creativeDimensions: newDimensions,
                    videoDimensions: this.environmentData.videoDimensions,
                };
            
                this.requestResize(resizeParams);
            }
            
            //if ad is at bottom of the player
            else if (this.initialDimensions_.y >= (this.environmentData.videoDimensions.height * HALF_THE_SIZE)) {
                console.log("height: " + this.environmentData.videoDimensions.height + "y: " + this.environmentData.videoDimensions.y)

                newDimensions.height = (this.environmentData.videoDimensions.height * HALF_THE_SIZE);
                newDimensions.x = 0;
                newDimensions.y = (this.environmentData.videoDimensions.height * HALF_THE_SIZE);
                newDimensions.width = this.environmentData.videoDimensions.width;

                resizeParams = {
                    creativeDimensions: newDimensions,
                    videoDimensions: this.environmentData.videoDimensions,
                };
            
                this.requestResize(resizeParams);
            }
           

            //if ad is on the right side of the player

            //if ad is on the left side of the player

            // newDimensions.x = this.initialDimensions_.x;
            // newDimensions.y = this.initialDimensions_.y * Y_OFFSET_PERCENTAGE;
            // newDimensions.width = this.initialDimensions_.width * WIDTH_PERCENTAGE;
            // newDimensions.height = this.initialDimensions_.height * HEIGHT_PERCENTAGE;
        
            // const resizeParams = {
            //     creativeDimensions: newDimensions,
            //     videoDimensions: this.environmentData.videoDimensions,
            // };
        
            // this.requestResize(resizeParams);
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
                videoDimensions: this.environmentData.videoDimensions,
            };
        
            this.requestResize(restoreParams);
        }
        document.getElementById(elementName).addEventListener(event, collpaseOnMouseOutFunction);
    }
}