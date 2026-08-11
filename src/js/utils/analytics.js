import { getQueryVariable } from './query.js';
import { setCookie, getCookie } from './cookie.js';
import { updateButtonURLs } from './links.js';

const ENDPOINTS = {
    CASUAL: 'https://r.myflowstats.com/v1/v',
    COMICS: 'https://r.comx-flow.com/v1/v',
    MOB: 'https://r.myflow-analytics.com/v1/v',
};

function getCookieData() {
    try {
        return JSON.parse(getCookie('data')) || {};
    } catch (error) {
        console.error('Error parsing analytics cookie', error);
        return {};
    }
}

export function sendAnalytics({ utmSource, onSuccess }) {
    const analyticsConfig = window.wpData || {};
    const cookieData = getCookieData();

    const userId = getQueryVariable('user_id') || getCookie('user_id');
    const clickId = getQueryVariable('click_id') || getQueryVariable('c') || getCookie('click_id') || getCookie('c');

    const data = {
        fbclid: getQueryVariable('fbclid') || cookieData.fbclid,
        site: window.location.host,
        page: window.location.pathname,
        referer: document.referrer || cookieData.referer || 'direct',
        pixel_id: getQueryVariable('pixel_id') || cookieData.pixel_id,
        adset_name: getQueryVariable('adsetname') || getQueryVariable('adset_name') || cookieData.adset_name,
        adset_id: getQueryVariable('adset_id') || cookieData.adset_id,
        ad_name: getQueryVariable('adname') || getQueryVariable('ad_name') || cookieData.ad_name,
        ad_id: getQueryVariable('ad_id') || cookieData.ad_id,
        campaign_id: getQueryVariable('campaign_id') || cookieData.campaign_id,
        campaign_name: getQueryVariable('utm_campaign') || cookieData.campaign_name,
        placement: getQueryVariable('utm_medium') || cookieData.placement,
        utm_source: getQueryVariable('utm_source') || cookieData.utm_source,
        utm_content: getQueryVariable('utm_content') || cookieData.utm_content,
        split: window.splitName || '',
    };

    if (analyticsConfig.selectedManager) {
        data.user_hash = analyticsConfig.selectedManager;
    }

    if (userId) {
        data.user_id = userId;
    }

    if (clickId) {
        data.click_id = clickId;
        data.c = clickId;
    }

    if (utmSource) {
        data.utm_source = utmSource;
    }

    setCookie('data', JSON.stringify(data), 180);

    const category = analyticsConfig.category || 'MOB';
    const endpoint = ENDPOINTS[category] || ENDPOINTS.MOB;

    jQuery.ajax({
        url: endpoint,
        type: 'POST',
        contentType: 'application/json',
        xhrFields: {
            withCredentials: true,
        },
        data: JSON.stringify(data),

        success(response) {
            if (!response?.data) {
                console.error('Missing analytics response data: ', response);
                jQuery('body').removeClass('loading');
                return;
            }

            const { user_id, click_id, url } = response.data;

            if (user_id) {
                setCookie('user_id', user_id, 180);
                data.user_id = user_id;
            }

            if (!getQueryVariable('click_id') && !getCookie('click_id') && click_id) {
                setCookie('click_id', click_id, 180);
            }

            if (!getQueryVariable('c') && !getCookie('c') && click_id) {
                setCookie('c', click_id, 180);
            }

            if (click_id) {
                data.click_id = click_id;
                data.c = click_id;
            }

            if (!click_id && !getCookie('click_id')) {
                console.error('missing click_id in response: ', response);
            }

            if (url) {
                window.location.href = url;
                return;
            }

            onSuccess?.({ ...data, ...response.data });
        },

        error(jqXHR, textStatus, errorThrown) {
            console.error('AJAX request failed', {
                status: jqXHR.status,
                statusText: textStatus,
                error: errorThrown,
                responseText: jqXHR.responseText,
                responseHeaders: jqXHR.getAllResponseHeaders(),
                url: jqXHR.responseURL,
            });

            const headerClickId = jqXHR.getResponseHeader('X-Click-Id');
            const headerUserId = jqXHR.getResponseHeader('X-User-Id');

            if (jqXHR.status >= 200 && jqXHR.status < 300) {
                if (headerClickId && !getQueryVariable('click_id') && !getCookie('click_id')) {
                    setCookie('click_id', headerClickId, 180);
                }

                if (headerUserId && !getQueryVariable('user_id') && !getCookie('user_id')) {
                    setCookie('user_id', headerUserId, 180);
                }
            }

            if (!data.click_id && headerClickId) {
                data.click_id = headerClickId;
            }

            if (!data.user_id && headerUserId) {
                data.user_id = headerUserId;
            }

            updateButtonURLs(jQuery('.analytic-url'), data);
            jQuery('body').removeClass('loading');
        },
    });
}
