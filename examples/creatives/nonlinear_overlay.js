/**
 * A sample SIMID nonlinear ad that shows an overlay of
 * buttons to showcase functionality
 */
class NonLinear extends BaseSimidCreative {
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

  /**
   * Gets the dimensions and sends a resize message to player.
   */
  onRequestResize() {
    const resize_x_val = document.getElementById('resize_x_val').value;
    const resize_y_val = document.getElementById('resize_y_val').value;
    const resize_width = document.getElementById('resize_width').value;
    const resize_height = document.getElementById('resize_height').value;

    const resize_params = {
      'x': resize_x_val,
      'y': resize_y_val,
      'width': resize_width,
      'height': resize_height,
    };

    this.simidProtocol.sendMessage(CreativeMessage.REQUEST_RESIZE, resize_params);
  }
}