const parser = new UAParser();
const {device, browser, os, ua} = parser.getResult();
const WEB_VIEW_UA = '; wv';
const META_IN_APP_UA = /FBAN|FBAV|FB_IAB|FB4A|FBIOS|Instagram/i;
const dynamicSource = wpData.dynamic_source;

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
        ['mobile', 'tablet'].includes(device.type) &&
        (
            isAndroidInAppBrowser() || isIOSInAppBrowser()
        )
    );
}

function handleIntentRedirect(link) {
    const url = new URL(link);
    const cleanURL = url.hostname + url.pathname + url.search;

    if (os.name === 'Android') {
        window.location.href = `intent://${cleanURL}#Intent;package=com.android.chrome;scheme=https;end`;
    } else if (os.name === 'iOS') {
        window.location.href = atob('eC1zYWZhcmktaHR0cHM6Ly8=') + cleanURL;
    } else {
        window.location.href = 'https://' + cleanURL;
    }
}

function getQueryVariable(variable) {
    const query = window.location.search.substring(1);
    const vars = query.split('&');
    for (let i = 0; i < vars.length; i++) {
        const pair = vars[i].split('=');
        if (pair[0] === variable) {
            return pair[1];
        }
    }
    return false;
}

function setCookie(name, value, days) {
    let expires;

    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = '; expires=' + date.toUTCString();
    } else {
        expires = '';
    }
    document.cookie =
        encodeURIComponent(name) +
        '=' +
        encodeURIComponent(value) +
        expires +
        '; path=/';
}

function getCookie(name) {
    const nameEQ = encodeURIComponent(name) + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) === 0) {
            return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
    }
    return null;
}
function getTransformedUTMSource(osName, utmSource, dynamicSource) {
    if (!dynamicSource?.enabled) return utmSource;

    const sources = (osName === 'iOS' || osName === 'macOS')
        ? dynamicSource.ios
        : dynamicSource.android;

    if (!Array.isArray(sources)) return utmSource;

    for (const item of sources) {
        if (item.source_we_have === utmSource) {
            return item.source_we_pass_on || utmSource;
        }
    }

    return utmSource;
}
function applyPlatformPrefixToUTM(utmSource, osName, category) {
    const isCASUAL = category === 'CASUAL';
    const shouldApply = isCASUAL  && utmSource && dynamicSource?.add_prefix;

    if (!shouldApply) return utmSource;

    let prefix;
    if (osName === 'iOS' || osName === 'macOS') {
        prefix = 'ios_';
    } else {
        prefix = 'and_';
    }

    return utmSource.startsWith(prefix) ? utmSource : prefix + utmSource;
}

let utmSource = getQueryVariable('utm_source');
utmSource = getTransformedUTMSource(os.name, utmSource, dynamicSource);
utmSource = applyPlatformPrefixToUTM(utmSource, os.name, wpData.category);


function updateButtonURLs(buttons, analytic_data) {
    try {
        const paramMapping = {
            fbclid: 'fbclid',
            pixel_id: 'pixel_id',
            campaign_name: 'utm_campaign',
            campaign_id: 'campaign_id',
            adset_name: 'adset_name',
            adset_id: 'adset_id',
            ad_name: 'ad_name',
            ad_id: 'ad_id',
            placement: 'utm_medium',
            utm_source: 'utm_source',
            click_id: 'click_id',
            c: 'c',
            user_id: 'user_id',
            split: 'split',
        };

        buttons.each(function () {
            let url = new URL(jQuery(this).attr('href'), window.location.origin);

            for (const [key, paramName] of Object.entries(paramMapping)) {
                const value = analytic_data[key];
                if (value) {
                    url.searchParams.set(paramName, value);
                }
            }

            jQuery(this).attr('href', url.toString());
        });
    } catch (error) {
        console.error('Error updating button URLs', {analytic_data});
    }
}

function updateRedirectUrl(analytic_data, click_id, user_id) {
    try {
        let url = new URL(wpData.redirect_url);

        const paramMapping = {
            fbclid: 'fbclid',
            pixel_id: 'pixel_id',
            campaign_name: 'utm_campaign',
            campaign_id: 'campaign_id',
            adset_name: 'adset_name',
            adset_id: 'adset_id',
            ad_name: 'ad_name',
            ad_id: 'ad_id',
            placement: 'utm_medium',
            utm_source: 'utm_source',
        };

        for (const [key, paramName] of Object.entries(paramMapping)) {
            const value = analytic_data[key];
            if (value) {
                url.searchParams.append(paramName, value);
            }
        }

        if (click_id) {
            url.searchParams.append('click_id', click_id);
            url.searchParams.append('c', click_id);
        } else {
            console.error('Missing click_id in updateRedirectUrl');
        }

        if (user_id) {
            url.searchParams.append('user_id', user_id);
        }

        const delay = wpData.loader_delay ?? 0;
        setTimeout(() => {
            window.location.href = url.toString();

        }, delay);
    } catch (error) {
        console.error('Failed to redirect using wpData.redirect_url', error);
    }
}

function sendAnalytics(next = () => {
}) {
    let cookieData = {};
    try {
        cookieData = JSON.parse(getCookie('data')) || {};
    } catch (error) {
        console.error('Error', error);
    }

    let user_id = getQueryVariable('user_id') || getCookie('user_id');
    let click_id = getQueryVariable('click_id') || getQueryVariable('c')
        || getCookie('click_id') || getCookie('c');

    const data = {
        fbclid: getQueryVariable('fbclid') || cookieData.fbclid,
        site: window.location.host,
        page: window.location.pathname,
        referer: document.referrer || cookieData.referer || 'direct',
        pixel_id: getQueryVariable('pixel_id') || cookieData.pixel_id,
        adset_name:
            getQueryVariable('adsetname') ||
            getQueryVariable('adset_name') ||
            cookieData.adset_name,
        adset_id: getQueryVariable('adset_id') || cookieData.adset_id,
        ad_name:
            getQueryVariable('adname') ||
            getQueryVariable('ad_name') ||
            cookieData.ad_name,
        ad_id: getQueryVariable('ad_id') || cookieData.ad_id,
        campaign_id: getQueryVariable('campaign_id') || cookieData.campaign_id,
        campaign_name: getQueryVariable('utm_campaign') || cookieData.campaign_name,
        placement: getQueryVariable('utm_medium') || cookieData.placement,
        utm_source: getQueryVariable('utm_source') || cookieData.utm_source,
        utm_content: getQueryVariable('utm_content') || cookieData.utm_content,
        split: window.splitName || '',
    };

    const user_hash = wpData.selectedManager || '';

    if (user_hash) {
        data.user_hash = user_hash;
    }

    if (user_id) {
        data.user_id = user_id;
    }
    if (click_id) {
        data.click_id = click_id;
        data.c = click_id;
    }
    if (utmSource) {
        data.utm_source = utmSource;
    }

    setCookie('data', JSON.stringify(data), 180);

    const category = wpData.category || 'MOB';

    const links = {
        CASUAL: 'https://r.myflowstats.com/v1/v',
        COMICS: 'https://r.comx-flow.com/v1/v',
        MOB:    'https://r.myflow-analytics.com/v1/v',
    };

    const link = links[category] || links.MOB;

    jQuery.ajax({
        url: link,
        type: 'POST',
        contentType: 'application/json',
        xhrFields: {
            withCredentials: true,
        },
        data: JSON.stringify(data),
        success: function (response) {
            if (response.data) {
                const {user_id, click_id, url} = response.data;

                if (user_id) {
                    setCookie('user_id', user_id, 180);
                }

                if (!getQueryVariable('click_id') && !getCookie('click_id')) {
                    setCookie('click_id', click_id, 180);
                }

                if (!getQueryVariable('c') && !getCookie('c')) {
                    setCookie('c', click_id, 180);
                }

                if (!click_id && !getCookie('click_id')) {
                    console.error('missing click_id in response: ', response);
                }

                if (url) {
                    window.location.href = url;
                    return;
                }

                next({...data, ...response.data});
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
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

                if (headerClickId) {
                    if (!getQueryVariable('click_id') && !getCookie('click_id')) {
                        setCookie('click_id', headerClickId, 180);
                    }
                }
                if (headerUserId) {
                    if (!getQueryVariable('user_id') && !getCookie('user_id')) {
                        setCookie('user_id', headerUserId, 180);
                    }
                }
            }
            const headersData = {};
            if (headerClickId) {
                headersData['click_id'] = headerClickId;
            }
            if (headerUserId) {
                headersData['user_id'] = headerUserId;
            }

            if (!data.click_id && headersData.click_id) {
                data.click_id = headersData.click_id;
            }

            if (!data.user_id && headersData.user_id) {
                data.user_id = headersData.user_id;
            }

            const updatedData = {
                ...data,
            };
            updateButtonURLs(jQuery('.analytic-url'), updatedData);
            jQuery('body').removeClass('loading');
        },
    });
}

jQuery(document).ready(function ($) {
    const url = new URL(window.location.href);
    sendAnalytics(data => {
        $('body').removeClass('loading');
        if (wpData.redirect_url) {
            updateRedirectUrl(data, data.click_id, data.user_id);
            return;
        }

        url.searchParams.set('click_id', data.click_id);
        url.searchParams.set('c', data.click_id);
        url.searchParams.set('user_id', data.user_id);

        updateButtonURLs($('.analytic-url'), data);

        if (isIntent()) {
            handleIntentRedirect(url.toString());
        }
    });
});
