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
    }

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