import { UAParser } from 'ua-parser-js';

const parser = new UAParser();
const { device, browser, os, ua } = parser.getResult();

const WEB_VIEW_UA = '; wv';
const META_IN_APP_UA = /FBAN|FBAV|FB_IAB|FB4A|FBIOS|Instagram/i;

function isMobileOrTablet() {
    return ['mobile', 'tablet'].includes(device.type);
}

function isAndroidInAppBrowser() {
    return (
        os.name === 'Android' &&
        (
            ua.includes(WEB_VIEW_UA) ||
            META_IN_APP_UA.test(ua)
        )
    );
}

function isIOSInAppBrowser() {
    return (
        os.name === 'iOS' &&
        (
            ['Instagram', 'Facebook'].includes(browser.name) ||
            META_IN_APP_UA.test(ua)
        )
    );
}

function isIntent() {
    return (
        isMobileOrTablet() &&
        (
            isAndroidInAppBrowser() || isIOSInAppBrowser()
        )
    );
}

export {
    device,
    browser,
    os,
    ua,
    isIntent,
    isAndroidInAppBrowser,
    isIOSInAppBrowser,
    WEB_VIEW_UA,
};
