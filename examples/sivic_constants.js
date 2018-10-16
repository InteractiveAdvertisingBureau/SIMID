/** Contains all constants common accross SIVIC */

VideoMessage = {
  DURATION_CHANGE: "Video:durationchange",
  ENDED: "Video:ended",
  ERROR: "Video:error",
  PAUSE: "Video:pause",
  PLAY: "Video:play",
  PLAYING: "Video:playing",
  SEEKED: "Video:seeked",
  SEEKING: "Video:seeking",
  TIME_UPDATE: "Video:timeupdate",
  VOLUME_CHANGE: "Video:volumechange",
};

PlayerMessage = {
  RESIZE: "Player:resize",
  INIT: "Player:init",
  START_CREATIVE: "Player:startCreative",
  AD_SKIPPED: "Player:adSkipped",
  AD_STOPPED: "Player:adStopped",
  FATAL_ERROR: "Player:atalError",
};

/** Messages from the creative */
CreativeMessage = {
  CLICK_THRU: "Creative:clickThru",
  FATAL_ERROR: "Creative:fatalError",
  GET_VIDEO_STATE: "Creative:getVideoState",
  READY: "Creative:ready",
  REQUEST_FULL_SCREEN: "Creative:requestFullScreen",
  REQUEST_SKIP: "Creative:requestSkip",
  REQUEST_STOP: "Creative:requestStop",
  REQUEST_PAUSE: "Creative:requestPause",
  REQUEST_PLAY: "Creative:requestPlay",
  REQUEST_RESIZE: "Creative:requestResize",
  REQUEST_VOLUME: "Creative:requestVolume",
  REQUEST_TRACKING: "Creative:reportTracking",
  REQUEST_CHANGE_AD_DURATION: "Creative:requestChangeAdDuration",
};

/* Tracking messages supported by the vast spec. Sent from the
 * player to the creative.
 */
TrackingMessages = {
  CLICK_THROUGH: "Tracking:clickThrough",
  CLICK_TRACKING: "Tracking:clickTracking",
  CLOSE_LINEAR: "Tracking:closeLinear",
  COLLAPSE: "Tracking:collapse",
  COMPLETE: "Tracking:complete",
  CREATIVE_VIEW: "Tracking:creativeView",
  CUSTOM_CLICK: "Tracking:customClick",
  EXIT_FULL_SCREEN: "Tracking:exitFullscreen",
  EXPAND: "Tracking:expand",
  FIRST_QUARTILE: "Tracking:firstQuartile",
  FULL_SCREEN: "Tracking:fullscreen",
  IMPRESSION: "Tracking:impression",
  LOADED: "Tracking:loaded",
  MIDPOINT: "Tracking:midpoint",
  MUTE: "Tracking:mute",
  OTHER_AD_INTERACTION: "Tracking:otherAdInteraction",
  PAUSE: "Tracking:pause",
  PLAYER_COLLAPSE: "Tracking:playerCollapse",
  PLAYER_EXPAND: "Tracking:playerExpand",
  PROGRESS: "Tracking:progress",
  RESUME: "Tracking:resume",
  REWIND: "Tracking:rewind",
  SKIP: "Tracking:skip",
  START: "Tracking:start",
  THIRD_QUARTILE: "Tracking:thirdQuartile",
  UNMUTE: "Tracking:unmute",
};

/**
 * These messages require a response (either resolve or reject).
 * All other messages do not require a response and are information only.
 */
EventsThatRequireResponse = [
  CreativeMessage.GET_VIDEO_STATE,
  CreativeMessage.REQUEST_VIDEO_LOCATION,
  CreativeMessage.READY,
  CreativeMessage.CLICK_THRU,
  CreativeMessage.REQUEST_SKIP,
  CreativeMessage.REQUEST_STOP,
  CreativeMessage.REQUEST_PAUSE,
  CreativeMessage.REQUEST_PLAY,
  CreativeMessage.REQUEST_FULL_SCREEN,
  CreativeMessage.REQUEST_FULL_VOLUME,
  CreativeMessage.REQUEST_FULL_RESIZE,
  CreativeMessage.REQUEST_CHANGE_AD_DURATION,
  CreativeMessage.REPORT_TRACKING,
  PlayerMessage.INIT,
  PlayerMessage.START_CREATIVE,
  PlayerMessage.AD_SKIPPED,
  PlayerMessage.AD_STOPPED,
  PlayerMessage.FATAL_ERROR,
  VideoMessage.GET_VIDEO_STATE,
]
