/* eslint-disable no-extend-native */
import { LANGUAGE } from "constants/General";

// language files
import EN from "../../locales/en.json";

if (!String.prototype.format) {
  String.prototype.format = function () {
    let args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) {
      return typeof args[number] != "undefined" ? args[number] : match;
    });
  };
}

const LocalizationWrapper = {
  language: LANGUAGE.EN, // TODO: need to implement change language mechanism
  getLocalizationConstants: function () {
    switch (this.language) {
      case LANGUAGE.EN:
        return EN;
      default:
        return EN;
    }
  },
};

export default LocalizationWrapper.getLocalizationConstants();
