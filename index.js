const axios = require('axios');
const baseURL =
    'https://query.wikidata.org/sparql?format=json&query=';

const getRandomBooks = (amount, genre, language) => {
    const lang = language || 'es';

    const query = `
    SELECT ?item ?itemLabel ?genreLabel ?authorLabel WHERE {
        ?item wdt:P31 ?instance .
        ?item wdt:P407 wd:Q1321 .
        ?item wdt:P50 ?author .
        ?item wdt:P136 ?genre .
       
        ${genre ? `FILTER( ?genre = wd:${genre}) .` : ''}
        FILTER(?instance = wd:Q8261 || ?instance = wd:Q7725634)
        BIND(SHA512(CONCAT(STR(RAND()), STR(?item))) AS ?random) .
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE], ${lang}" . }
     } ORDER BY ?random
     LIMIT ${amount}
     # Random clean wikidata cache ${Math.random().toString(36)}`;

    return axios.get(baseURL + encodeURI(query)).then((res) => {
        const books = res.data.results.bindings;
        const booksList = [];
        for (const book of books) {
            booksList.push({
                name: book.itemLabel.value,
                author: book.authorLabel.value,
                genre: book.genreLabel.value,
            });
        }
        return booksList;
    });
};

const getAuthorBooks = (authorId, limit, language) => {
    const lang = language || 'es';
    const query = `
    SELECT distinct ?bookLabel (GROUP_CONCAT(?genre_label) as ?genres) (MIN(?publicationDate) as ?firstPublication)
    WHERE
    {
        ?book wdt:P50 wd:${authorId}.
        OPTIONAL {
            ?book wdt:P136 ?genre .
            ?genre rdfs:label ?genre_label filter (lang(?genre_label) = "${lang}").
            ?book wdt:P577 ?publicationDate .
        }

        FILTER ( NOT EXISTS {?book wdt:P31 wd:Q3331189}  )

    SERVICE wikibase:label {
        bd:serviceParam wikibase:language "${lang}" .
    }
    } group by ?book ?bookLabel ?authorLabel
    LIMIT ${limit}
    `;
    return axios.get(baseURL + encodeURI(query)).then((res) => {
        const books = res.data.results.bindings;
        const booksList = [];
        for (const book of books) {
            let publication = book.firstPublication
                ? book.firstPublication.value
                : null;
            booksList.push({
                name: book.bookLabel.value,
                genre: book.genres.value,
                publication_date: publication,
            });
        }
        return booksList;
    });
};

const getAuthorNotableWork = (id, limit, language) => {
    const lang = language || 'es';
    const query = `
    SELECT distinct ?bookLabel (GROUP_CONCAT(?genre_label) as ?genres) (MIN(?publicationDate) as ?firstPublication)
    WHERE
    {   
        VALUES ?author { wd:${id} }
        ?author wdt:P800 ?book.
        OPTIONAL {
            ?book wdt:P136 ?genre .
            ?genre rdfs:label ?genre_label filter (lang(?genre_label) = "${lang}").
            ?book wdt:P577 ?publicationDate .
        }

        FILTER ( NOT EXISTS {?book wdt:P31 wd:Q3331189}  )

    SERVICE wikibase:label {
        bd:serviceParam wikibase:language "${lang}" .
    }
    } group by ?book ?bookLabel ?authorLabel
    LIMIT ${limit}
    `;
    return axios.get(baseURL + encodeURI(query)).then((res) => {
        const books = res.data.results.bindings;
        const booksList = [];
        for (const book of books) {
            let publication = book.firstPublication
                ? book.firstPublication.value
                : null;
            booksList.push({
                name: book.bookLabel.value,
                genre: book.genres.value,
                publication_date: publication,
            });
        }
        return booksList;
    });
};

const getBookCharacters = (id, language) => {
    const lang = language || 'es';
    const query = `
    SELECT distinct ?charactersLabel
    WHERE 
    {
      VALUES ?item { wd:${id} }
      ?item wdt:P674 ?characters
      
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],${lang}". }
    }`;
    return axios.get(baseURL + encodeURI(query)).then((res) => {
        const characters = res.data.results.bindings;
        const charactersList = [];
        for (const character of characters) {
            charactersList.push({
                name: character.charactersLabel.value,
            });
        }
        return charactersList;
    });
};

const getBookAuthor = (id, language) => {
    const lang = language || 'es';
    const query = `
    SELECT distinct ?authorLabel
    WHERE 
    {
      VALUES ?item { wd:${id} }
      ?item wdt:P50 ?author

      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],${lang}". }
    }`;

    return axios
        .get(baseURL + encodeURI(query))
        .then(
            (res) => res.data.results.bindings[0]?.authorLabel?.value,
        );
};

const getAuthorPseudonym = (id, language) => {
    const lang = language || 'es';
    const query = `
    SELECT ?pseudonym
    WHERE 
    {
      VALUES ?item { wd:${id} }
      ?item wdt:P742 ?pseudonym
      
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],${lang}". }
    }
    `;

    return axios
        .get(baseURL + encodeURI(query))
        .then((res) =>
            res.data.results.bindings[0] &&
            res.data.results.bindings[0].pseudonym &&
            res.data.results.bindings[0].pseudonym.value
                ? res.data.results.bindings[0].pseudonym.value
                : null,
        );
};

const getAuthorNickname = (id, language) => {
    const lang = language || 'es';
    const query = `
    SELECT ?nickname
    WHERE 
    {
      VALUES ?item { wd:${id} }
      ?item wdt:P1449 ?nickname
      
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],${lang}". }
    }
    `;

    return axios
        .get(baseURL + encodeURI(query))
        .then((res) =>
            res.data.results.bindings[0] &&
            res.data.results.bindings[0].nickname &&
            res.data.results.bindings[0].nickname.value
                ? res.data.results.bindings[0].nickname.value
                : null,
        );
};

const getAuthorMovement = (id, language, country) => {
    const lang = language || 'es';
    const query = `
    SELECT ?movementLabel
    WHERE 
    {
      VALUES ?item { wd:${id} }
      ?item wdt:P135 ?movement
      ${
          country
              ? `wdt:P27 ?country 
      FILTER(?country = wd:${country}).`
              : ''
      }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],${lang}". }
    }
    `;

    return axios
        .get(baseURL + encodeURI(query))
        .then((res) =>
            res.data.results.bindings[0] &&
            res.data.results.bindings[0].movementLabel &&
            res.data.results.bindings[0].movementLabel.value
                ? res.data.results.bindings[0].movementLabel.value
                : null,
        );
};

const getAwards = (id, language) => {
    const lang = language || 'es';
    const query = `
    SELECT ?awardsLabel
    WHERE 
    {
      VALUES ?item { wd:${id} }
      ?item wdt:P166 ?awards
      
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],${lang}". }
    }
    `;

    return axios.get(baseURL + encodeURI(query)).then((res) => {
        const awards = res.data.results.bindings;
        const awardsList = [];
        for (const award of awards) {
            awardsList.push(award.awardsLabel.value);
        }
        return awardsList;
    });
};

const getPersonImage = (id, language) => {
    const lang = language || 'es';
    const query = `
    SELECT ?image
    WHERE 
    {
      VALUES ?item { wd:${id} }
      ?item wdt:P18 ?image
      
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],${lang}". }
    }
    `;

    return axios
        .get(baseURL + encodeURI(query))
        .then((res) => res.data.results.bindings[0]?.image.value);
};

const getPersonBirth = (id, language) => {
    const lang = language || 'es';
    const query = `
    SELECT ?item ?itemLabel ?place ?placeLabel ?date ?timeprecision
    WHERE
    {
        ?item wdt:P31 wd:Q5 .
        VALUES ?item { wd:${id} } .
        ?item p:P569/psv:P569 ?timenode .
        ?timenode wikibase:timePrecision ?timeprecision. 
        ?item wdt:P569 ?date .
        ?item wdt:P19 ?place .

        SERVICE wikibase:label { bd:serviceParam wikibase:language "${lang}". }
    }
    `;
    return axios.get(baseURL + encodeURI(query)).then((res) => {
        return {
            name: res.data.results.bindings[0]?.itemLabel.value,
            date: res.data.results.bindings[0]?.date.value,
            datePrecision:
                res.data.results.bindings[0]?.timeprecision.value,
            place: res.data.results.bindings[0]?.placeLabel.value,
            placeId:
                res.data.results.bindings[0]?.place.value.replace(
                    'http://www.wikidata.org/entity/',
                    '',
                ),
        };
    });
};

const getPersonFamily = (id, language) => {
    const lang = language || 'es';
    const query = `
    SELECT ?item ?itemLabel ?dadLabel ?momLabel ?spouseLabel ?childrenLabel ?childrenNum
    WHERE
    {
        ?item wdt:P31 wd:Q5 .
        VALUES ?item { wd:${id} } . 
        OPTIONAL {?item wdt:P22 ?dad} .
        OPTIONAL{?item wdt:P25 ?mom} .
        OPTIONAL{?item wdt:P26 ?spouse} .
        OPTIONAL{?item wdt:P40 ?children} .
        OPTIONAL{?item wdt:P1971 ?childrenNum} .

        SERVICE wikibase:label { bd:serviceParam wikibase:language "${lang}". }
    }
    `;
    return axios.get(baseURL + encodeURI(query)).then((res) => {
        return {
            name: res.data.results.bindings[0]?.itemLabel?.value,
            dad: res.data.results.bindings[0]?.dadLabel?.value,
            mom: res.data.results.bindings[0]?.momLabel?.value,
            spouse: res.data.results.bindings[0]?.spouseLabel?.value,
            childrenNum:
                res.data.results.bindings[0]?.childrenNum?.value,
            children:
                res.data.results.bindings[0]?.childrenLabel?.value,
        };
    });
};

const getPersonDeath = (id, language) => {
    const lang = language || 'es';
    const query = `
    SELECT ?item ?itemLabel ?place ?placeLabel ?date ?timeprecision ?causeLabel 
    WHERE
    {
        ?item wdt:P31 wd:Q5 .
        VALUES ?item { wd:${id} }
        ?item p:P570/psv:P570 ?timenode .
        ?timenode wikibase:timePrecision ?timeprecision.
        OPTIONAL { ?item wdt:P20 ?place .}
        OPTIONAL { ?item wdt:P570 ?date .}
        OPTIONAL { ?item wdt:P1196 ?cause }
        OPTIONAL { ?item wdt:P509 ?cause }

        SERVICE wikibase:label { bd:serviceParam wikibase:language "${lang}". }
    }
    `;
    return axios.get(baseURL + encodeURI(query)).then((res) => {
        if (
            res.data.results.bindings &&
            res.data.results.bindings.length > 0
        )
            return {
                name: res.data.results.bindings[0].itemLabel.value,
                date:
                    res.data.results.bindings[0]?.date.value || null,
                datePrecision:
                    res.data.results.bindings[0]?.timeprecision.value,
                place:
                    res.data.results.bindings[0]?.placeLabel.value ||
                    null,
                placeId:
                    res?.data?.results?.bindings[0]?.place?.value.replace(
                        'http://www.wikidata.org/entity/',
                        '',
                    ) || null,
                cause:
                    res.data.results.bindings[0]?.causeLabel?.value ||
                    null,
            };
        else return 'Still alive';
    });
};

const getPersonSignature = (id, language) => {
    const lang = language || 'es';
    const query = `
    SELECT ?item ?itemLabel ?thumb ?signature
    WHERE
    {
        ?item wdt:P31 wd:Q5 .
        VALUES ?item { wd:${id} }
        ?item wdt:P109 ?signature .

        BIND(REPLACE(wikibase:decodeUri(STR(?signature)), "http://commons.wikimedia.org/wiki/Special:FilePath/", "") as ?fileName) .
        BIND(REPLACE(?fileName, " ", "_") as ?safeFileName)
        BIND(MD5(?safeFileName) as ?fileNameMD5) .
        BIND(CONCAT("https://upload.wikimedia.org/wikipedia/commons/thumb/", SUBSTR(?fileNameMD5, 1, 1), "/", SUBSTR(?fileNameMD5, 1, 2), "/", ?safeFileName, "/650px-", ?safeFileName, ".png") as ?thumb)

        SERVICE wikibase:label { bd:serviceParam wikibase:language "${lang}". }
    }
    `;
    return axios.get(baseURL + encodeURI(query)).then((res) => {
        if (
            res.data.results.bindings &&
            res.data.results.bindings.length > 0
        )
            return {
                thumb: res.data.results.bindings[0]?.thumb.value,
                signature:
                    res.data.results.bindings[0].signature.value,
            };
        else return null;
    });
};

const customQuery = async (query) => {
    return axios
        .post(baseURL + encodeURI(query))
        .then((res) => res.data.results.bindings);
};

const getWikiId = (search, language) => {
    const lang = language || 'es';
    const query = `
    SELECT * WHERE {
        SERVICE wikibase:mwapi {
            bd:serviceParam wikibase:endpoint "www.wikidata.org";
                            wikibase:api "EntitySearch";
                            mwapi:search "${search}";
                            mwapi:language "${lang}".
            ?item wikibase:apiOutputItem mwapi:item.
            ?num wikibase:apiOrdinal true.
        }
        ?item (wdt:P279|wdt:P31) ?type
      } ORDER BY ASC(?num) LIMIT 1
    `;

    return axios.get(baseURL + encodeURI(query)).then((res, err) => {
        if (err) return null;

        return res &&
            res.data &&
            res.data.results.bindings &&
            res.data.results.bindings[0] &&
            res.data.results.bindings[0].item &&
            res.data.results.bindings[0].item.value
            ? res.data.results.bindings[0].item.value.replace(
                  'http://www.wikidata.org/entity/',
                  '',
              )
            : null;
    });
};

// Actually only works for Spain
const cityPopulation = (city) => {
    const query = `
    SELECT ?population
    WHERE
    {
        VALUES ?item { wd:${city} }
        ?item wdt:P1082 ?population
    }
    `;
    return axios
        .get(baseURL + encodeURI(query))
        .then(
            (res) => res.data.results.bindings[0]?.population.value,
        );
};

// Actually only works for Spain
const cityMap = (city) => {
    const query = `
    SELECT ?map
    WHERE
    {
        VALUES ?item { wd:${city} }
        ?item wdt:P242 ?map
    }
    `;
    return axios
        .get(baseURL + encodeURI(query))
        .then((res) => res.data.results.bindings[0]?.map.value);
};

const cityFlag = (city) => {
    const query = `
    SELECT ?flag
    WHERE
    {
        VALUES ?item { wd:${city} }
        ?item wdt:P41 ?flag
    }
    `;
    return axios
        .get(baseURL + encodeURI(query))
        .then((res) => res.data.results.bindings[0]?.flag.value);
};

const countryCapital = (countryId, language) => {
    const lang = language || 'es';
    const query = `
    SELECT ?capital ?capitalLabel
    WHERE
    {
        VALUES ?item { wd:${countryId} }
        ?item wdt:P36 ?capital
        SERVICE wikibase:label { bd:serviceParam wikibase:language "${lang}". }
    }
    `;
    return axios.get(baseURL + encodeURI(query)).then((res) => {
        return {
            id: res.data.results.bindings[0].capital.value.replace(
                'http://www.wikidata.org/entity/',
                '',
            ),
            name: res.data.results.bindings[0].capitalLabel.value,
        };
    });
};

const getAuthorsByCountry = async (country, gender, language) => {
    const lang = language || 'es';
    const query = `
    SELECT distinct ?author ?label
    WHERE {
        ?author wdt:P2799 ?id .
        ${
            gender && (gender === 'female' || gender === 'male')
                ? `?author wdt:P21 wd:${
                      gender === 'female' ? 'Q6581072' : 'Q6581097'
                  } .`
                : ''
        }
        ?author wdt:P27 wd:${country} .
        ?author wdt:P106 ?occupation .
  
        FILTER ( ?occupation = wd:Q28389 || ?occupation = wd:Q4853732 || ?occupation = wd:Q482980 || ?occupation = wd:Q49757 || ?occupation = wd:Q6625963 || ?occupation = wd:Q214917 || ?occupation = wd:Q36180 || ?occupation = wd:Q11774202) .
 
        ?author rdfs:label ?label.
        FILTER (lang(?label) = '${lang}').
    }
    `;
    return axios.get(baseURL + encodeURI(query)).then((res) => {
        const authors = res.data.results.bindings;
        const authorsList = [];
        for (const author of authors) {
            authorsList.push({
                name: author.label.value,
                id: author.author.value.replace(
                    'http://www.wikidata.org/entity/',
                    '',
                ),
            });
        }
        return authorsList;
    });
};

const getAuthorsByCity = async (country, gender, language) => {
    const lang = language || 'es';
    const cityId = await getWikiId(country, lang);
    const query = `
    SELECT distinct ?id ?author ?label
    WHERE {
        ?author wdt:P31 wd:Q5 .
        ${
            gender && (gender === 'female' || gender === 'male')
                ? `?author wdt:P21 wd:${
                      gender === 'female' ? 'Q6581072' : 'Q6581097'
                  } .`
                : ''
        }
        ?author wdt:P2799 ?id .
        ?author wdt:P19 wd:${cityId} .
        ?author wdt:P106 ?occupation .
  
        FILTER ( ?occupation = wd:Q28389 || ?occupation = wd:Q4853732 || ?occupation = wd:Q482980 || ?occupation = wd:Q49757 || ?occupation = wd:Q6625963 || ?occupation = wd:Q214917 || ?occupation = wd:Q36180 || ?occupation = wd:Q11774202) .
 
        ?author rdfs:label ?label.
        FILTER (lang(?label) = '${lang}').
    }
    `;
    return axios.get(baseURL + encodeURI(query)).then((res) => {
        const authors = res.data.results.bindings;
        const authorsList = [];
        for (const author of authors) {
            authorsList.push({
                name: author.label.value,
                id: author.author.value.replace(
                    'http://www.wikidata.org/entity/',
                    '',
                ),
            });
        }
        return authorsList;
    });
};

const authorsByMovement = (movement, gender, countryId, language) => {
    const lang = language || 'es';

    const query = `
    SELECT ?author ?authorLabel
    WHERE 
    {
      ?author wdt:P31 wd:Q5 .  
      ${
          gender && (gender === 'female' || gender === 'male')
              ? `?author wdt:P21 wd:${
                    gender === 'female' ? 'Q6581072' : 'Q6581097'
                } .`
              : ''
      }
      ?author wdt:P135 wd:${movement} ;
      ${
          countryId
              ? `wdt:P27 ?country
                FILTER(?country = wd:${countryId}).`
              : ''
      }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],${lang}". }
    }
    ORDER BY DESC(?author)
    `;
    return axios.get(baseURL + encodeURI(query)).then((res) => {
        const authors = res.data.results.bindings;
        const authorsList = [];
        for (const author of authors) {
            authorsList.push({
                name: author.authorLabel.value,
                id: author.author.value.replace(
                    'http://www.wikidata.org/entity/',
                    '',
                ),
            });
        }
        return authorsList;
    });
};

const getTwitterAccount = (person) => {
    const query = `
    SELECT ?item ?twitter ?instagram
    WHERE {
        VALUES ?item { wd:${person} }
        OPTIONAL{
            ?item wdt:P2002 ?twitter .
            ?item wdt:P2003 ?instagram .
        }
    }
    `;
    return axios.get(baseURL + encodeURI(query)).then((res) => {
        return {
            twitter: res.data.results.bindings[0].twitter
                ? res.data.results.bindings[0].twitter.value
                : null,
            instagram: res.data.results.bindings[0].instagram
                ? res.data.results.bindings[0].instagram.value
                : null,
        };
    });
};

module.exports = {
    getRandomBooks,
    getAuthorBooks,
    getAuthorNotableWork,
    getBookCharacters,
    getBookAuthor,
    getAuthorPseudonym,
    getAuthorNickname,
    getAuthorMovement,
    getAwards,
    getPersonImage,
    getPersonBirth,
    getPersonFamily,
    getPersonDeath,
    getPersonSignature,
    getTwitterAccount,
    customQuery,
    getWikiId,
    cityPopulation,
    cityMap,
    cityFlag,
    countryCapital,
    getAuthorsByCountry,
    getAuthorsByCity,
    authorsByMovement,
};
