export const getSearchParam = (param) => new URLSearchParams(window.location.search).get(param);

export const hasSearchParam = (param) => new URLSearchParams(window.location.search).has(param);
