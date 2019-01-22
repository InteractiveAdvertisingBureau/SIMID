/**
 * A sample SIVIC ad that shows how to impliment a survey.
 */
class SivicSurvey extends BaseSivicCreative {
  constructor() {
    super();

    /**
     * The current Question being asked
     */
    this.currentQuestion_ = 1;

    // listen to all buttons.
    for (let i = 1; i <= 6; i++) {
      const button = document.getElementById('option' + i);
      if (button) {
        button.onclick = this.showNextQuestion.bind(this);
      }
    }
  }

  showQuestion(questionNumber) {
    const divRef = 'question' + questionNumber;
    const ref = document.getElementById(divRef);
    ref.classList.add('showing');
  }

  hideQuestion(questionNumber) {
    const divRef = 'question' + questionNumber;
    const ref = document.getElementById(divRef);
    ref.classList.remove('showing');
  }

  /** @override */
  onStart(eventData) {
    super.onStart(eventData);
    this.showQuestion(1);
  }

  /**
   * Shows the next question
   */
  showNextQuestion() {
    this.hideQuestion(this.currentQuestion_);
    this.currentQuestion_ ++;
    if (this.currentQuestion_ == 3) {
      // If the user answers all the questions skip the ad.
      this.sivicProtocol.sendMessage(CreativeMessage.REQUEST_SKIP);
      return;
    }
    this.showQuestion(this.currentQuestion_);
  }
}
