export const html = String.raw;
export const relativeURL = fileName => new URL(fileName, import.meta.url).toString();
