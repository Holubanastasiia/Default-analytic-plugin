export function getQueryVariable(variable) {
    const value = new URLSearchParams(window.location.search).get(variable);

    return value === null ? false : value;
}
