/**
 * A sample SIMID ad that shows how to impliment a survey.
 */
class SimidSurvey extends BaseSimidCreative {
  constructor() {
    super();

    /**
     * The current Question being asked.
     * @private
     */
    this.currentQuestion_ = -1;

    /**
     * A list of questions to be asked. Default is no questions.
     * @private
     */
    this.surveyQuestions_ = [];

    // listen to all buttons.
    for (let i = 0; i <= 2; i++) {
      const button = document.getElementById('option' + i);
      if (button) {
        // This examples just shows the next question. A true
        // implementation would record answers somehow.
        button.onclick = this.showNextQuestion.bind(this);
      }
    }
  }

  /**
   * Shows the current question
   */
  showQuestion() {
    const questionData = this.surveyQuestions_[this.currentQuestion_];
    const questionElement = document.getElementById('current-question');
    questionElement.innerHTML = questionData.question;
    for (let i = 0; i <= 2; i++) {
      const button = document.getElementById('option' + i);
      button.innerHTML = questionData.answers[i];
    }
    document.getElementById('question').classList.add('showing');
  }

  /** @override */
  onStart(eventData) {
    super.onStart(eventData);
    this.surveyQuestions_ = JSON.parse(this.creativeData.adParameters);
    this.showNextQuestion();
  }

  /**
   * Shows the next question.
   */
  showNextQuestion() {
    document.getElementById('question').classList.remove('showing');
    this.currentQuestion_ ++;
    if (this.currentQuestion_ >= this.surveyQuestions_.length) {
      // If the user answers all the questions skip the rest of the ad.
      this.simidProtocol.sendMessage(CreativeMessage.REQUEST_SKIP);
      return;
    }
    setTimeout(() => this.showQuestion(), 1000);
  }
}
