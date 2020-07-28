const AdParamKeys = {
  BUTTON_LABEL: 'buttonLabel',
  SEARCH_QUERY: 'searchQuery',
  MARKER: 'marker',
  COORDINATES: 'userCoordinates'
};

const TRAVEL_METHOD = "travelMethod";
const TIME_DISPLAY = "timeDisplay";
const FIND_NEAREST_TEMPLATE_TEXT = "Find Nearest ";
const DEFAULT_BUTTON_LABEL = "Location";
const TRANSPORT_METHODS = ["Driving", "Walking", "Bicycling", "Transit"];

/**
 * A sample SIMID ad that shows a map of nearby locations.
 */
class SimidMapCreative extends BaseSimidCreative {
  constructor() {
    super();

    /** 
     * A Simid Map object where all of the Maps API calls are handled
     * @private {!SimidMap}
     */ 
    this.googleMapsClient_ = null;
    /**
     * The desired marker image's string URL.
     * @private {?string}
     */
    this.markerUrl_ = null;
    /**
     * The string representing the search query.
     * @private {?string}
     */
    this.query_ = null;
    /**
     * The LatLng coordinates representing the user's current location.
     * @private {?google.maps.LatLng}
     */
    this.coordinates_ = null;
  }
  
  /** @override */
  onInit(eventData) {
    this.updateInternalOnInit(eventData);
    this.validateAndParseAdParams_(eventData);
  }

  /**
   * Checks validity of ad parameters and rejects with proper message if invalid.
   * @param eventData an object that contains information details for a particular event
   *   such as event type, unique Ids, creativeData and environmentData.
   * @private 
   */ 
  validateAndParseAdParams_(eventData) {
    if (this.creativeData.adParameters == "") {
      this.simidProtocol.reject(eventData, {errorCode: CreativeErrorCode.UNSPECIFIED, 
        message: "Ad parameters not found"});
        return;
    }

    let adParams = "";
    try {
      adParams = JSON.parse(this.creativeData.adParameters);
    } catch (exception) {
      this.simidProtocol.reject(eventData, {errorCode: CreativeErrorCode.CREATIVE_INTERNAL_ERROR, 
        message: "Invalid JSON input for ad parameters"});
        return;
    }
    this.buttonLabel_ = adParams[AdParamKeys.BUTTON_LABEL]; 
    this.query_ = adParams[AdParamKeys.SEARCH_QUERY];
    this.markerUrl_ = adParams[AdParamKeys.MARKER];
    this.coordinates_ = adParams[AdParamKeys.COORDINATES];

    if (!this.query_) {
      this.simidProtocol.reject(eventData, {errorCode: CreativeErrorCode.UNSPECIFIED, 
        message: `Required field ${AdParamKeys.SEARCH_QUERY} not found`});
        return;
    }
    this.simidProtocol.resolve(eventData, {});
  }

  /** @override */
  onStart(eventData) {
    super.onStart(eventData);
    this.specifyButtonFeatures_(this.buttonLabel_);
  }

  /**
   * Sets the text of the Find Nearest button and assigns it a click functionality.
   * @param {string=} buttonLabel Refers to the value given to the BUTTON_LABEL key in 
   *   the AdParamKeys object. The value should be representative of the advertised product's 
   *   category and can be specified by the advertisers. If the value is not specified, 
   *   then BUTTON_LABEL's value will default to Location.
   * @private 
   */ 
  specifyButtonFeatures_(buttonLabel = DEFAULT_BUTTON_LABEL) {
    const findNearestButton = document.getElementById('findNearest');
    findNearestButton.innerText = FIND_NEAREST_TEMPLATE_TEXT + buttonLabel;
    findNearestButton.focus();
    findNearestButton.onclick = () => this.prepareCreative_();
  }

  prepareCreative_() {
    findNearest.classList.add("hidden");
    this.simidProtocol.sendMessage(CreativeMessage.REQUEST_PAUSE).then(() => {
      const onMapsClientComplete = () => {this.playAd_()};
      this.createMapState_();
      debugger;
      this.googleMapsClient_ = new GoogleMapsClient(this.query_,
         this.markerUrl_, this.simidProtocol, onMapsClientComplete, document.getElementById(TRAVEL_METHOD),
          document.getElementById(TIME_DISPLAY), this.coordinates_);
      this.googleMapsClient_.displayMap(document.getElementById('map'));
      this.googleMapsClient_.addMapListener();
    }).catch(() => {
        const pauseErrorMessage = {
          message: "WARNING: Request to pause ad failed",
        };
        this.simidProtocol.sendMessage(CreativeMessage.LOG, pauseErrorMessage);
    });
  }

  /**
   * Creates the Skip To Content and Return To Ad buttons once the user
   *   grants permission to access their location and the map appears.
   * @private 
   */
  createMapState_() {
    const returnToAdButton = document.createElement("button");
    returnToAdButton.textContent = "Return To Ad";
    returnToAdButton.id = "returnToAd";
    returnToAdButton.focus();
    returnToAdButton.onclick = () => this.playAd_(returnToAdButton); 

    const skipAdButton = document.createElement("button");
    skipAdButton.id = "skipAd";
    skipAdButton.textContent = "Skip Ad";
    skipAdButton.onclick = () => this.playContent_();

    const adContainer = document.getElementById('adContainer');
    adContainer.appendChild(returnToAdButton);
    adContainer.appendChild(skipAdButton);
    this.createTravelDisplay_();
  }

  /**
   * Creates an option element representing a mode of travel.
   * @param {!string} travelMode A string representing the
   *   given mode of travel.
   * @private 
   */
  createTravelOption_(travelMode) {
    const travelOption = document.createElement("option");
    travelOption.value = travelMode.toUpperCase();
    travelOption.text = travelMode;
    return travelOption;
  }

  /**
   * Creates a drop down menu where users can choose between
   * different modes of travel to display directions for, and
   * creates area for travel time to be displayed.
   * @private 
   */
  createTravelDisplay_() {
    const travelChoicesContainer = document.getElementById('adContainer');
    const travelMethod = document.createElement('select');
    travelMethod.id = TRAVEL_METHOD;
    const timeDisplay = document.createElement("div");
    timeDisplay.id = TIME_DISPLAY;
    TRANSPORT_METHODS.forEach((transportType) => {
        const newOption = this.createTravelOption_(transportType);
        travelMethod.add(newOption);
    });
    travelChoicesContainer.append(travelMethod);
    travelChoicesContainer.append(timeDisplay);
  }

  /**
   * Continues to play the ad if user clicks on Return To Ad button.
   * @param {!Element} returnToAdButton Refers to the button that takes
   *   a user back to the video ad. 
   * @private 
   */
  playAd_(returnToAdButton) {
    this.simidProtocol.sendMessage(CreativeMessage.REQUEST_PLAY);
    returnToAdButton.classList.add("hidden");
    const mapDiv = document.getElementById("map");
    mapDiv.classList.add("hidden");
    const travelDisplay = document.getElementById(TRAVEL_METHOD);
    const timeDisplay = document.getElementById(TIME_DISPLAY);
    travelDisplay.classList.add("hidden");
    timeDisplay.classList.add("hidden");
  }

  /**
   * Returns to video content if user clicks on Skip To Content button.
   * @private 
   */
  playContent_() {
    this.simidProtocol.sendMessage(CreativeMessage.REQUEST_SKIP);
  }
}