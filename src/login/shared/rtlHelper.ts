import type { KcContext } from "../KcContext";

let persianRedirectIssued = false;

/**
 * If the realm offers Persian, switch to it once so Keycloakify loads `fa` messages
 * and applies RTL on `<html>` (see getI18n in keycloakify).
 * Skip when already `fa` or when internationalization is off / Persian is unavailable.
 */
export function redirectToPersianLocaleIfAvailable(kcContext: KcContext): void {
    if (persianRedirectIssued) {
        return;
    }
    if (!kcContext.realm.internationalizationEnabled) {
        return;
    }
    const locale = kcContext.locale;
    if (!locale) {
        return;
    }
    if (locale.currentLanguageTag === "fa") {
        return;
    }
    const persian = locale.supported.find(entry => entry.languageTag === "fa");
    if (!persian?.url) {
        return;
    }
    // Dev mock uses placeholder URLs; avoid leaving the app during `npm run dev`
    if (persian.url === "#") {
        return;
    }
    persianRedirectIssued = true;
    window.location.replace(persian.url);
}
