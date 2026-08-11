import $ from 'jquery';

import { os, isIntent } from './utils/define-browser.js';
import { getQueryVariable } from './utils/query.js';
import { getTransformedUTMSource, applyPlatformPrefixToUTM } from './utils/utm.js';
import { updateButtonURLs, buildRedirectUrl } from './utils/links.js';
import { sendAnalytics } from './utils/analytics.js';
import { handleIntentRedirect } from './utils/redirect.js';

const analyticsConfig = window.wpData || {};

function redirectWithAnalyticsData(data) {
    try {
        const targetUrl = buildRedirectUrl(
            analyticsConfig.redirect_url,
            data,
            data.click_id,
            data.user_id
        );
        const delay = analyticsConfig.loader_delay ?? 0;

        window.setTimeout(() => {
            window.location.href = targetUrl;
        }, delay);
    } catch (error) {
        console.error('Failed to redirect using wpData.redirect_url', error);
    }
}

let utmSource = getQueryVariable('utm_source');

utmSource = getTransformedUTMSource(
    os.name,
    utmSource,
    analyticsConfig.dynamic_source
);

utmSource = applyPlatformPrefixToUTM(
    utmSource,
    os.name,
    analyticsConfig.category,
    analyticsConfig.dynamic_source
);

jQuery(document).ready(function () {
    const url = new URL(window.location.href);
    const isOneClickAutoRedirect = Boolean(analyticsConfig.redirect_url && !analyticsConfig.add_button_after_loader);

    sendAnalytics({
        utmSource,
        onSuccess(data) {

            if (isOneClickAutoRedirect) {
                redirectWithAnalyticsData(data);
                return;
            }

            url.searchParams.set('click_id', data.click_id);
            url.searchParams.set('c', data.click_id);
            url.searchParams.set('user_id', data.user_id);

            updateButtonURLs($('.analytic-url'), data);

            if (isIntent()) {
                handleIntentRedirect(url.toString());
            }
            $('body').removeClass('loading');
        },
    });
});
