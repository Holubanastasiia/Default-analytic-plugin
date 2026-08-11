import { os } from './define-browser.js';

export function handleIntentRedirect(link) {
    const url = new URL(link, window.location.origin);
    const cleanURL = url.hostname + url.pathname + url.search;

    if (os.name === 'Android') {
        window.location.href = `intent://${cleanURL}#Intent;package=com.android.chrome;scheme=https;end`;
    } else if (os.name === 'iOS') {
        window.location.href = atob('eC1zYWZhcmktaHR0cHM6Ly8=') + cleanURL;
    } else {
        window.location.href = 'https://' + cleanURL;
    }
}
