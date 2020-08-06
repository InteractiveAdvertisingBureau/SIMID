const QUARTER_THE_SIZE = .25;
const THIRTY_FIVE_PERCENT = .35;
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
        this.videoDimensionHeight = this.environmentData.videoDimensions.height;
        this.videoDimensionWidth = this.environmentData.videoDimensions.width;
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
     * DISCLAIMER: Only works for horizontal ads.
     * @param {String} elementName The name of the element.
     * @param {Event} event The event performed on the element.
     * @private
     */   
    onHover_(elementName, event) {
        const expandOnHoverFunction = () => {
            const newDimensions = {};
            let resizeParams = {};
            // let desiredTopLeft;
            // let desiredTopRight;
            // let desiredMinY;
            // let desiredMaxY;
            // let desiredWidth;
            // let desiredHeight;

            let desiredX;
            let desiredWidth;
            let desiredY;
            let desiredHeight;
            let fullCreativeWidth;
            let fullCreativeHeight;

            desiredX = this.initialDimensions_.x * .8;
            desiredWidth = this.initialDimensions_.width * 1.4;

            if (desiredX <= 0) {
                desiredX = 0;
                desiredWidth = this.initialDimensions_.width * 1.2;
            }
            
            if (desiredX > this.videoDimensionWidth) {
                return;
            }

            fullCreativeWidth = desiredX + desiredWidth;

            if (fullCreativeWidth > this.videoDimensionWidth) {
                fullCreativeWidth = this.videoDimensionWidth;
                desiredWidth = fullCreativeWidth - desiredX;
            }
            
            desiredY = this.initialDimensions_.y * .8;
            console.log("desired y: " + desiredY);
            console.log("initial y " + this.initialDimensions_.y);
            console.log("initial height: " + typeof(this.initialDimensions_.height));
            desiredHeight = parseInt(this.initialDimensions_.height) + parseInt(this.initialDimensions_.y * .4);
            console.log("desired height prior: " + desiredHeight);

            if (desiredY <= 0) {
                desiredY = 0;
                desiredHeight = this.initialDimensions_.height * 1.2;
            }
            if (desiredY > this.videoDimensionHeight) {
                return;
            }

            fullCreativeHeight = desiredY + desiredHeight;

            if (fullCreativeHeight > this.videoDimensionHeight) {
                console.log("HERE");
                fullCreativeHeight = this.videoDimensionHeight;
                desiredHeight = fullCreativeHeight - desiredY;
            }

            // desiredTopLeft = this.initialDimensions_.x - (this.initialDimensions_.width * 1.2);
            // if (desiredTopLeft < 0) {
            //     desiredTopLeft = 0;
            // }
            // desiredTopRight = this.initialDimensions_.x + (1.2 * this.initialDimensions_.width);
            // if (desiredTopRight > this.videoDimensionWidth) {
            //     desiredTopRight = this.videoDimensionWidth;
            // }
            // desiredWidth = desiredTopRight - desiredTopLeft;
            // console.log(desiredWidth);

            // desiredMinY = (this.initialDimensions_.height * 1.2) - this.initialDimensions_.y ;
            // console.log(desiredMinY);
            // if (desiredMinY < 0) {
            //     desiredMinY = 0;
            // }
            // desiredMaxY = this.initialDimensions_.y + (1.2 * this.initialDimensions_.height);
            // console.log(desiredMaxY);
            // if (desiredMaxY > this.videoDimensionHeight) {
            //     desiredMaxY = this.videoDimensionHeight;
            // }

            // desiredHeight = desiredMaxY - desiredMinY;
            // console.log(desiredHeight);
            console.log("x: " + desiredX);
            console.log("Y: " + desiredY);
            console.log("Width: " + desiredWidth);
            console.log("Height: " + desiredHeight);

            newDimensions.x = desiredX;
            newDimensions.y = desiredY;
            newDimensions.width = desiredWidth;
            newDimensions.height = desiredHeight;

            resizeParams = {
                creativeDimensions: newDimensions,
                videoDimensions: this.environmentData.videoDimensions,
            };
            
            this.requestResize(resizeParams);

            //if ad is at the top quarter of the player
            // if (this.initialDimensions_.y < (this.videoDimensionHeight * QUARTER_THE_SIZE)) {
            //     newDimensions.height = (this.videoDimensionHeight * THIRTY_FIVE_PERCENT);
            //     newDimensions.x = 0;
            //     newDimensions.y = this.initialDimensions_.y;
            //     newDimensions.width = this.videoDimensionWidth;

            //     resizeParams = {
            //         creativeDimensions: newDimensions,
            //         videoDimensions: this.environmentData.videoDimensions,
            //     };
            
            //     this.requestResize(resizeParams);
            // }

            // //if ad is between the top quarter and half of the player
            // else if (this.initialDimensions_.y > (this.videoDimensionHeight * QUARTER_THE_SIZE) && 
            //     this.initialDimensions_.y < (this.videoDimensionHeight * HALF_THE_SIZE)) {
            //         newDimensions.height = (this.videoDimensionHeight * THIRTY_FIVE_PERCENT);
            //         newDimensions.x = 0;
            //         newDimensions.y = this.videoDimensionHeight * QUARTER_THE_SIZE;
            //         newDimensions.width = this.videoDimensionWidth;

            //         resizeParams = {
            //             creativeDimensions: newDimensions,
            //             videoDimensions: this.environmentData.videoDimensions,
            //         };
                
            //         this.requestResize(resizeParams);
            // }

            // //if ad is between the top half and three quarters of the player
            // else if (this.initialDimensions_.y > (this.videoDimensionHeight * HALF_THE_SIZE) && 
            // this.initialDimensions_.y < (this.videoDimensionHeight * THREE_QUARTERS_THE_SIZE)) {
            //     newDimensions.height = (this.videoDimensionHeight * THIRTY_FIVE_PERCENT);
            //     newDimensions.x = 0;
            //     newDimensions.y = (this.videoDimensionHeight * HALF_THE_SIZE);
            //     newDimensions.width = this.videoDimensionWidth;

            //     resizeParams = {
            //         creativeDimensions: newDimensions,
            //         videoDimensions: this.environmentData.videoDimensions,
            //     };
            
            //     this.requestResize(resizeParams);
            // }

            // //if ad is at bottom quarter of the player
            // else if (this.initialDimensions_.y >= (this.videoDimensionHeight * THREE_QUARTERS_THE_SIZE)) {
            //     newDimensions.height = (this.videoDimensionHeight * QUARTER_THE_SIZE);
            //     newDimensions.x = 0;
            //     newDimensions.y = (this.videoDimensionHeight * THREE_QUARTERS_THE_SIZE);
            //     newDimensions.width = this.videoDimensionWidth;

            //     resizeParams = {
            //         creativeDimensions: newDimensions,
            //         videoDimensions: this.environmentData.videoDimensions,
            //     };
            
            //     this.requestResize(resizeParams);
            // }

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