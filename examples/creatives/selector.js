/**
 * A sample SIMID ad demonstrating a selector.
 */
class SimidSelector extends BaseSimidCreative {
  constructor() {
    super();
    /**
     * True if the user has clicked an ad.
     * @private {boolean}
     */
    this.adSelected_ = false;
  }
  /** @override */
  onStart(eventData) {
    super.onStart(eventData);
    setTimeout(() => {
      this.showElements();
      this.openVideoWhenClicked();
    }, 1000);

    // Give the user 10 seconds to select a shorter ad or continue with default ad.
    setTimeout(() => {
      if (!this.adSelected_) {
        this.hideElemenets();
      }
    }, 10000);
  }

  /**
   * Causes two videos and a title (text) element to animate over the video.
   */
  showElements() {
    document.getElementById('title').classList.add('showing');
    document.getElementById('video1').classList.add('showing');
    document.getElementById('video2').classList.add('showing');
  }

  /**
   * Causes all overlayed elements to animate off the main video.
   */
  hideElements() {
    document.getElementById('title').classList.remove('showing');
    document.getElementById('video1').classList.remove('showing');
    document.getElementById('video2').classList.remove('showing');
  }

  /**
   * Asks the ad video to pause, plays the selected video and then ends the ad
   * once the selected video is played
   */
  onVideoClicked (clickedVid, unclickedVid) {
    console.log('vid clicked');
    this.adSelected_ = true;

    // Request that the ad playback pauses and then wait for the player to resolve.
    this.simidProtocol.sendMessage(CreativeMessage.REQUEST_PAUSE).then(() => {
      // Set the clicked video to take up the entire video area.
      clickedVid.classList.add('fullSize');

      // Remove the unused elements.
      clickedVid.classList.remove('showing');
      unclickedVid.classList.remove('showing');
      document.getElementById('title').classList.remove('showing');
      clickedVid.classList.remove('showing');

      // When the clicked video ends terminate the ad.
      clickedVid.addEventListener('ended', () => this.onEnded());

      // Start playback of the clicked video.  This should work on all
      // browsers, since there was a user intent to play the video.
      clickedVid.play();
    });
  }

  /**
   * Sets up click listeners on the video elements.  When a video element
   * is clicked on, onVideo clicked is called.
   */
  openVideoWhenClicked() {
      const video1 = document.getElementById('video1');
      const video2 = document.getElementById('video2');

      video1.addEventListener('click', () => this.onVideoClicked(video1, video2));
      video2.addEventListener('click', () => this.onVideoClicked(video2, video1));
    }

  onEnded() {
    this.simidProtocol.sendMessage(CreativeMessage.REQUEST_STOP);
  }
}
