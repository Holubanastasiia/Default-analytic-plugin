export function getTransformedUTMSource(osName, utmSource, dynamicSource) {
    if (!dynamicSource?.enabled) {
        return utmSource;
    }

    const sources = (osName === 'iOS' || osName === 'macOS')
        ? dynamicSource.ios
        : dynamicSource.android;

    if (!Array.isArray(sources)) {
        return utmSource;
    }

    for (const item of sources) {
        if (item.source_we_have === utmSource) {
            return item.source_we_pass_on || utmSource;
        }
    }

    return utmSource;
}

export function applyPlatformPrefixToUTM(utmSource, osName, category, dynamicSource) {
    const isCasual = category === 'CASUAL';
    const shouldApply = isCasual && utmSource && dynamicSource?.add_prefix;

    if (!shouldApply) {
        return utmSource;
    }

    const prefix = (osName === 'iOS' || osName === 'macOS') ? 'ios_' : 'and_';

    return utmSource.startsWith(prefix) ? utmSource : prefix + utmSource;
}
