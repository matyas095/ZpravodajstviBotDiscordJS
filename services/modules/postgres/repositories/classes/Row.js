class Row {
    constructor(superClass, repository, content, columns) {
        this.superClass = superClass;
        this.repository = repository;
        this.content = content;

        for(const key of Object.values(columns)) {
            this[key.name] = {
                updated: false,
                get: () => {
                    return this.content[key.properName];
                },
                set: (value) => {
                    this[key.name].updated = true;
                    this.content[key.properName] = value;

                    return this;
                }
            };
        };
    };
};


module.exports = Row;