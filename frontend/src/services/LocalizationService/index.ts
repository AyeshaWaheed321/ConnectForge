// LocalizationService/index.ts
import { LANGUAGE } from "../../constants/LanguageConstants";
import EN from "./en.json";

declare global {
  interface String {
    format(...args: string[]): string;
  }
}

if (!String.prototype.format) {
  String.prototype.format = function (...args: string[]) {
    return this.replace(/{(\d+)}/g, function (match, number) {
      return typeof args[number] !== "undefined" ? args[number] : match;
    });
  };
}

const LocalizationWrapper = {
  language: LANGUAGE.EN,
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
