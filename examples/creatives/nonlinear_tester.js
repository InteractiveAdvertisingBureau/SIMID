/**
 * An ad built for testing relevant SIMID API for nonlinear SIMID creatives.
 * These APIs include:
 *  expandCreative - This should expand the creative to take up the entire frame.
 *  collapseCreative - Returns the creative to its original size.
 *  resizeCreative - Allows a specific size for the creative.
 */
class NonLinearTester extends BaseSimidCreative {
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
    let resize_params = {};
    resize_params.x = document.getElementById('resize_x_val').value;
    resize_params.y = document.getElementById('resize_y_val').value;
    resize_params.width = document.getElementById('resize_width').value;
    resize_params.height = document.getElementById('resize_height').value;

    this.simidProtocol.sendMessage(CreativeMessage.REQUEST_RESIZE, resize_params);
  }
}