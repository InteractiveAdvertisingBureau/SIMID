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
   * When creative asks to resize itself send message to the player.
   */
  onRequestResize() {
    const creativeDimensions = {};

    creativeDimensions.x = document.getElementById('resize_x_val').value;
    creativeDimensions.y = document.getElementById('resize_y_val').value;
    creativeDimensions.width = document.getElementById('resize_width').value;
    creativeDimensions.height = document.getElementById('resize_height').value;

    const resizeParams = {
      mediaDimensions: {},
      creativeDimensions: creativeDimensions
    };

    this.simidProtocol.sendMessage(CreativeMessage.REQUEST_RESIZE, resizeParams);
  }
}