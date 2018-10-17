/**
 * A sample sivic ad that shows an overlay
 */
class SivicOverlay extends BaseSivicCreative {
  constructor() {
    super();

    this.informationElem_ = document.getElementById('information');

    this.addButtonClickActions_();
  }

  /** @override */
  onTimeUpdate(data) {
    super.onTimeUpdate(data);
    this.informationElem_.innerHTML = 'Time in ad ' + this.videoState.currentTime;
  }

  /**
   * Adds actions to different buttons available on the overlay.
   */
  addButtonClickActions_() {
    document.getElementById('request_play').addEventListener("click",
      () => {
        sivicProtocol.sendMessage(CreativeMessage.REQUEST_PLAY);
      });
    document.getElementById('request_pause').addEventListener("click",
      () => {
        sivicProtocol.sendMessage(CreativeMessage.REQUEST_PAUSE);
      });
    document.getElementById('request_full_screen').addEventListener("click",
       () => {
        sivicProtocol.sendMessage(CreativeMessage.REQUEST_FULL_SCREEN);
      });
   document.getElementById('fatal_error').addEventListener("click",
      () => {
        sivicProtocol.sendMessage(CreativeMessage.FATAL_ERROR);
      });
    document.getElementById('request_skip').addEventListener("click",
      () => {
        sivicProtocol.sendMessage(CreativeMessage.REQUEST_SKIP);
      });
    document.getElementById('request_stop').addEventListener("click",
      () => {
        sivicProtocol.sendMessage(CreativeMessage.REQUEST_STOP);
      });
  }

}