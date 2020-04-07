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
      const video1 = document.getElementById('video1');
      const video2 = document.getElementById('video2');

      video1.addEventListener('click', () => this.onVideoClicked(video1, video2));
      video2.addEventListener('click', () => this.onVideoClicked(video2, video1));
    }, 1000);

    // Give the user 10 seconds to select a shorter ad or continue with default ad.
    setTimeout(() => {
      if (!this.adSelected_) {
        document.getElementById('title').classList.remove('showing');
        document.getElementById('video1').classList.remove('showing');
        document.getElementById('video2').classList.remove('showing');
      }
    }, 10000);
  }

  showElements() {
    document.getElementById('title').classList.add('showing');
    document.getElementById('video1').classList.add('showing');
    document.getElementById('video2').classList.add('showing');
  }

  onVideoClicked (clickedVid, unclickedVid) {
    console.log('vid clicked');
    this.adSelected_ = true;

    this.simidProtocol.sendMessage(CreativeMessage.REQUEST_PAUSE).then(() => {
      console.log('other video paused');
      clickedVid.classList.add('fullSize');
      clickedVid.classList.remove('showing');
      unclickedVid.classList.remove('showing');
      document.getElementById('title').classList.remove('showing');
      clickedVid.classList.remove('showing');
      clickedVid.addEventListener('ended', () => this.onEnded());
      clickedVid.play();

    });
  }

  onEnded() {
    this.simidProtocol.sendMessage(CreativeMessage.REQUEST_STOP);
  }
}
