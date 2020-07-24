/**
 * A sample SIMID nonlinear ad that shows an overlay of
 * buttons to showcase functionality
 */
class TestersNonLinear extends BaseSimidCreative {
    constructor() {
      super();
    }

    onRequestResize() {
      const resize_params = {};
      
      resize_params.x = document.getElementById('resize_x_val').value;
      resize_params.y = document.getElementById('resize_y_val').value;
      resize_params.width = document.getElementById('resize_width').value;
      resize_params.height = document.getElementById('resize_height').value;
  
      this.simidProtocol.sendMessage(CreativeMessage.REQUEST_RESIZE, resize_params);
    }
}