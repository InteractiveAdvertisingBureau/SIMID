/**
 * A sample SIMID nonlinear ad that shows an overlay of
 * buttons to showcase functionality
 */
class TestersNonLinear extends BaseSimidCreative {
  constructor() {
    super();

    this.addButtonClickActions_();
  }

  /**
   * Adds actions to different buttons available on the overlay.
   */
  addButtonClickActions_() {
    this.sendMessageOnButtonClick_("close_ad", CreativeMessage.REQUEST_STOP);
    this.sendMessageOnButtonClick_("expand_button", CreativeMessage.REQUEST_EXPAND);
    this.sendMessageOnButtonClick_("collapse_button", CreativeMessage.REQUEST_COLLAPSE);
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

  /** When creative asks to resize itself, this sends a message to the player. */
  onRequestResize() {
    const creativeDimensions = {};

    creativeDimensions.x = document.getElementById('resize_x_val').value;
    creativeDimensions.y = document.getElementById('resize_y_val').value;
    creativeDimensions.width = document.getElementById('resize_width').value;
    creativeDimensions.height = document.getElementById('resize_height').value;

    const resizeParams = {
      videoDimensions: this.environmentData.videoDimensions,
      creativeDimensions: creativeDimensions
    };

    super.requestResize(resizeParams);
  }
}