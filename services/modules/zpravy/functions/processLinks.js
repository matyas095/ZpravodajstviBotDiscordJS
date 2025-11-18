function buildFullLink(link, urlToInsert) {
    return link.startsWith("https://")
        ? link
        : urlToInsert + link;
}

module.exports = function processLinks(
    uniq,
    channels,
    toReCheck,
    arrayQueryToCheckUrl,
    func_tion,
    isValidLink,
    urlToInsert,
    isExempt
) {
    return uniq
        .filter(isValidLink)
        .map(link =>
            func_tion(buildFullLink(link, urlToInsert), channels, toReCheck, arrayQueryToCheckUrl, isExempt)
        );
};
