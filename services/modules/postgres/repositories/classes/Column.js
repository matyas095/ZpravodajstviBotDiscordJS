const returnColumns = require("../functions/returnColumns.js");

class Column {
    constructor(RepoClass, repository, properties) {
        this.superClass = RepoClass;
        this.repository = repository;
        this.properties = properties;
        
        this.name = properties.name;
        this.properName = properties.properName;

        return;

        for(const key of Object.keys(properties)) {
            this[key] = {
                trueKey: this.columnsJSON[key],
                updated: false,

                get: () => {
                    return this.content[this[key].trueKey];
                },
                set: (value) => {
                    this[key].updated = true;
                    this.content[this[key].trueKey] = value;

                    return this;
                }
            };
        };
    };
};

module.exports = Column;