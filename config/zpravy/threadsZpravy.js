const { Message, ThreadAutoArchiveDuration } = require("discord.js");
const foxnews = require("../../services/modules/zpravy/foxnews");

/*

"channelName": {
    scriptName: {
        option: {
            name: "",
            autoArchiteDuration: ThreadAutoArchiveDuration,
            reason: ""
        },
        description: {
            sources: [],
            main_color: DECIMAL // HEX (#XXXXX) to DECIMAL: https://www.mathsisfun.com/hexadecimal-decimal-colors.html
        }
    }
}

*/

module.exports = {
	"čr": {
        aktualne: {
            option: {
                name: 'Aktuálně.cz',
                autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
                reason: 'Novej threads pro web Aktuálně.cz'
            },
            description: {
                sources: [
                    "https://zpravy.aktualne.cz/",
                    "https://zpravy.aktualne.cz/domaci/"
                ],
                main_color: 1796543 // "#1b69bf"
            }
        },
        ceskatelevize: {
            option: {
                name: 'ČT24.cz',
                autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
                reason: 'Novej threads pro web ČT24.cz'
            },
            description: {
                sources: [
                    "https://ct24.ceskatelevize.cz/"
                ],
                main_color: 10380 // "#00288c"
            }
        },
        denik: {
            option: {
                name: 'Deník.cz',
                autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
                reason: 'Novej threads pro web Deník.cz'
            },
            description: {
                sources: [
                    "https://www.denik.cz/"
                ],
                main_color: 27833 // "#006CB9"
            }
        },
        idnes: {
            option: {
                name: 'Idnes.cz',
                autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
                reason: 'Novej threads pro web Idnes.cz'
            },
            description: {
                sources: [
                    "https://www.idnes.cz/"
                ],
                main_color: 15091763 // "#E64833"
            }
        },
        irozhlas: {
            option: {
                name: 'iRozhlas.cz',
                autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
                reason: 'Novej threads pro web iRozhlas.cz'
            },
            description: {
                sources: [
                    "https://www.irozhlas.cz",
                    "https://www.irozhlas.cz/zpravy-domov"
                ],
                main_color: 15227471 // "#E85A4F"
            }
        },
    },
	"svět": {
        bbc: {
            option: {
                name: 'BBC.com',
                autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
                reason: 'Novej threads pro web BBC.com'
            },
            description: {
                sources: [
                    "https://www.bbc.com"
                ],
                main_color: 0 // #000000ff
            }
        },
        foxnews: {
            option: {
                name: 'Fox News.com',
                autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
                reason: 'Novej threads pro web Fox News.com'
            },
            description: {
                sources: [
                    "https://www.foxnews.com"
                ],
                main_color: 13158 // #003366
            }
        },
    },
	"věda": {
        nature: {
            option: {
                name: 'Nature.com',
                autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
                reason: 'Novej threads pro web Nature.com'
            },
            description: {
                sources: [
                    "https://www.nature.com",
                    "https://www.nature.com/news"
                ],
                main_color: 1645599
            }
        },
        ceskatelevizeveda: {
            option: {
                name: 'Věda ČT24.cz',
                autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
                reason: 'Novej threads pro web ČT24.cz'
            },
            description: {
                sources: [
                    "https://ct24.ceskatelevize.cz/rubrika/veda-25"
                ],
                main_color: 10380 // #00288C
            }
        },

    },
	"sport": {
        sportaktualne: {
            option: {
                name: 'Sport Aktuálně.cz',
                autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
                reason: 'Novej threads pro web Sport Aktuálně.cz'
            },
            description: {
                sources: [
                    "https://sport.aktualne.cz/"
                ],
                main_color: 1796543 // "#1b69bf"
            }
        },
        /* idnessport: {
            option: {
                name: 'Sport Idnes.cz',
                autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
                reason: 'Novej threads pro web Sport Idnes.cz'
            },
            description: {
                sources: [
                    "https://www.idnes.cz/sport"
                ],
                main_color: 15091763 // "#E64833"
            }
        }, */

    },
	"počasí": {
        ct24ceskatelevize: {
            option: {
                name: 'Počasí ČT24.cz',
                autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
                reason: 'Novej threads pro web Počasí ČT24.cz'
            },
            description: {
                sources: [
                    "https://ct24.ceskatelevize.cz/rubrika/pocasi-27"
                ],
                main_color: 1796543 // "#1b69bf"
            }
        },
    },
	"covid": {

    },
	"twitter": {

    },
	"youtube": {

    },

	"test": {

    },
}