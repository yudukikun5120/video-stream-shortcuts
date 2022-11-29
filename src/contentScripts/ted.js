"use strict"

import changePlaybackSpeed from "../methods/changePlaybackSpeed"
import createIndicator from "../methods/createIndicator"
import isTyping from "../methods/isTyping"
import loadConfig from "../methods/loadConfig"
import { seek, decimalSeek } from "../methods/seek"
import toggleFullscreen from "../methods/toggleFullscreen"
import toggleMute from "../methods/toggleMute"
import togglePause from "../methods/togglePause"

window.onload = () => {
  // Check if TED is enabled in setting
  loadConfig().then((result) => {
    if (result["sites-ted"]) {
      getVideo(result)
    }
  })
}

const getVideo = (config) => {
  const promise = new Promise((resolve) => {
    const interval = window.setInterval(() => {
      const media = document.getElementsByTagName("video")[0]
      if (media) {
        window.clearInterval(interval)
        resolve(media)
      }
    }, 250)
  })

  promise.then((media) => {
    setShortcuts(media, config)
  })
}

const setShortcuts = (media, config) => {
  let preVolume

  document.onkeyup = (e) => {
    if (!isTyping()) {
      switch (e.key) {
        case "k":
          if (config["keys-k"]) {
            togglePause(media)
            callIndicatorCreator({ type: "icon", id: "togglePause", media })
          }
          break
        case "j":
          if (config["keys-j"]) {
            seek({
              media,
              direction: "backward",
              seekSec: config["seek-sec"],
            })
            callIndicatorCreator({ type: "icon", id: "seekBackward" })
          }
          break
        case "l":
          if (config["keys-l"]) {
            seek({
              media,
              direction: "forward",
              seekSec: config["seek-sec"],
            })
            callIndicatorCreator({ type: "icon", id: "seekForward" })
          }
          break
        case "f":
          if (config["keys-f"]) {
            toggleFullscreen(media)
          }
          break
        case "m":
          if (config["keys-m"]) {
            preVolume = toggleMute(media, preVolume)
            if (media.volume !== 0) {
              callIndicatorCreator({
                type: "text",
                text: Math.round(media.volume * 100).toString() + "%",
              })
            } else {
              callIndicatorCreator({ type: "icon", id: "mute" })
            }
          }
          break
        case "<": {
          if (config["keys-left-arrow"]) {
            const curSpeed = changePlaybackSpeed(media, "decrease")
            callIndicatorCreator({
              type: "text",
              text: curSpeed.toString() + "x",
            })
          }
          break
        }
        case ">": {
          if (config["keys-right-arrow"]) {
            const curSpeed = changePlaybackSpeed(media, "increase")
            callIndicatorCreator({
              type: "text",
              text: curSpeed.toString() + "x",
            })
          }
          break
        }
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9": {
          if (config["keys-decimal"]) {
            decimalSeek({
              media: media,
              numericKey: e.key,
            })
            callIndicatorCreator({
              type: "text",
              text: e.key,
            })
          }
          break
        }
      }
    }
  }
}

// Page specific wrapper of methods/createIndicator.js
const callIndicatorCreator = ({ type, id, text, media }) => {
  const wrapper = document.getElementsByTagName("video")[0].parentNode

  createIndicator({
    type,
    id,
    text,
    wrapper,
    media,
  })
}
