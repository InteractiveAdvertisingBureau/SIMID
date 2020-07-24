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
   * When creative asks to resize itself send mes.
   */
  onRequestResize() {
    const resize_params = {};
    
    resize_params.x = document.getElementById('resize_x_val').value;
    resize_params.y = document.getElementById('resize_y_val').value;
    resize_params.width = document.getElementById('resize_width').value;
    resize_params.height = document.getElementById('resize_height').value;

    this.simidProtocol.sendMessage(CreativeMessage.REQUEST_RESIZE, resize_params);
  }
}