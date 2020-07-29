/**
 * A sample SIMID ad demonstrating a selector.
 */
class Extender extends BaseSimidCreative {
  constructor() {
    super();

    /** True if the player said it would extend duration. */
    this.extendDuration_ = false;
  }

  /** @override */
  onStart(eventData) {
    // Don't fetch the media state right away in case the video is not yet loaded.
    setTimeout(() => {
      this.fetchMediaState();
    }, 1500);
  }

  /** @override */
  onGetMediaStateResolve(data) {
    super.onGetMediaStateResolve(data);
    console.log(data);
    const mediaDuration = data['duration'];
    console.log("media duration: " + mediaDuration);
    const params = {
      'duration': mediaDuration - 31,
    };

    if (params.duration < 0) {
      console.log('Requested duration too short. Requested duration: ' + params.duration);
    }

    // Ask the player if we can extend duration 5 seconds to show end cards.
    this.simidProtocol.sendMessage(CreativeMessage.REQUEST_CHANGE_AD_DURATION, params).then(() => {
      this.extendDuration_ = true;
    }).catch(() => {
      console.log('Player does not support requested duration change.');
    });
  }

  /** @override */
  onTimeUpdate(data) {
    console.log(data.args.currentTime);
  }

  onVideoEnded() {
    if (this.extendDuration_) {
      this.showEndCards();
    }
  }

  showEndCards() {
    const firstTag = document.getElementById('firstTag');
    firstTag.classList.remove('hidden');
    firstTag.classList.add('fade-in');
    const secondTag = document.getElementById('secondTag');
    secondTag.classList.remove('hidden');
    secondTag.classList.add('fade-in');
  }
}
