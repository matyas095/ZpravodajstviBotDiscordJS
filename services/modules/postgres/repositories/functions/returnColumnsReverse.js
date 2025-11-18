/**
 * Reverses the returnColumns(...) function.
 * @function
 * @param {String} sqlLine               - User to DM
 * @returns {Array}                      - Array $1 - Columns; $2 - Values
 */
module.exports = function(sqlLine) {
    const COLUMNs = Object.keys(sqlLine).map(f => {
        for(const i in f) {
            if(f[i] == f[i].toUpperCase()) return (f.substring(0, i) + "_" + f.substring(i)).toLowerCase();
        }
        return f.toLowerCase();
    });
    const VALUEs = Object.values(sqlLine);

    return [COLUMNs, VALUEs];
};