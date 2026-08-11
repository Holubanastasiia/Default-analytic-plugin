const BUTTON_PARAM_MAPPING = {
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

const REDIRECT_PARAM_MAPPING = {
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

export function updateButtonURLs(buttons, analyticData) {
    try {
        buttons.each(function () {
            const href = jQuery(this).attr('href');
            if (!href) return;

            const url = new URL(href, window.location.origin);

            for (const [key, paramName] of Object.entries(BUTTON_PARAM_MAPPING)) {
                const value = analyticData[key];

                if (value) {
                    url.searchParams.set(paramName, value);
                }
            }

            jQuery(this).attr('href', url.toString());
        });
    } catch (error) {
        console.error('Error updating button URLs', {
            error,
            analyticData
        });
    }
}

export function buildRedirectUrl(targetUrl, analyticData, clickId, userId) {
    const url = new URL(targetUrl, window.location.origin);

    for (const [key, paramName] of Object.entries(REDIRECT_PARAM_MAPPING)) {
        const value = analyticData[key];

        if (value) {
            url.searchParams.set(paramName, value);
        }
    }

    if (clickId) {
        url.searchParams.set('click_id', clickId);
        url.searchParams.set('c', clickId);
    } else {
        console.error('Missing click_id in buildRedirectUrl');
    }

    if (userId) {
        url.searchParams.set('user_id', userId);
    }

    return url.toString();
}
