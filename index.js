const axios = require('axios');
const baseURL =
    'https://query.wikidata.org/sparql?format=json&query=';

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

const getAuthorMovement = (id, language) => {
    const lang = language || 'es';
    const query = `
    SELECT ?movementLabel
    WHERE 
    {
      VALUES ?item { wd:${id} }
      ?item wdt:P135 ?movement
      
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
        .then((res) => res.data.results.bindings[0].image.value);
};

const getPersonBirth = (id, language) => {
    const lang = language || 'es';
    const query = `
    SELECT ?item ?itemLabel ?place ?placeLabel ?date
    WHERE
    {
        ?item wdt:P31 wd:Q5 .
        VALUES ?item { wd:${id} } . 
        ?item wdt:P569 ?date .
        ?item wdt:P19 ?place .

        SERVICE wikibase:label { bd:serviceParam wikibase:language "${lang}". }
    }
    `;
    return axios.get(baseURL + encodeURI(query)).then((res) => {
        return {
            name: res.data.results.bindings[0].itemLabel.value,
            date: res.data.results.bindings[0].date.value,
            place: res.data.results.bindings[0].placeLabel.value,
            placeId: res.data.results.bindings[0].place.value.replace(
                'http://www.wikidata.org/entity/',
                '',
            ),
        };
    });
};

const getPersonDeath = (id, language) => {
    const lang = language || 'es';
    const query = `
    SELECT ?item ?itemLabel ?place ?placeLabel ?date ?causeLabel
    WHERE
    {
        ?item wdt:P31 wd:Q5 .
        VALUES ?item { wd:${id} }
        OPTIONAL { ?item wdt:P20 ?place .}
        OPTIONAL { ?item wdt:P570 ?date .}
        OPTIONAL { ?item wdt:P1196 ?cause }

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
                    res.data.results.bindings[0].date &&
                    res.data.results.bindings[0].date.value
                        ? res.data.results.bindings[0].date.value
                        : null,
                place:
                    res.data.results.bindings[0].placeLabel &&
                    res.data.results.bindings[0].placeLabel.value
                        ? res.data.results.bindings[0].placeLabel
                              .value
                        : null,
                placeId: res.data.results.bindings[0].place.value.replace(
                    'http://www.wikidata.org/entity/',
                    '',
                ),
                cause:
                    res.data.results.bindings[0].causeLabel &&
                    res.data.results.bindings[0].causeLabel.value
                        ? res.data.results.bindings[0].causeLabel
                              .value
                        : null,
            };
        else return 'Sigue vivo';
    });
};

const getPersonSignature = (id, language) => {
    const lang = language || 'es';
    const query = `
    SELECT ?item ?itemLabel ?signature
    WHERE
    {
        ?item wdt:P31 wd:Q5 .
        VALUES ?item { wd:${id} }
        ?item wdt:P109 ?signature .

        SERVICE wikibase:label { bd:serviceParam wikibase:language "${lang}". }
    }
    `;
    return axios.get(baseURL + encodeURI(query)).then((res) => {
        if (
            res.data.results.bindings &&
            res.data.results.bindings.length > 0
        )
            return res.data.results.bindings[0].signature.value;
        else return 'No hay firma';
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
        if (err) return 'not found';

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
            : 'Not found';
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
        .then((res) => res.data.results.bindings[0].population.value);
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
        .then((res) => res.data.results.bindings[0].map.value);
};

// Actually only works for Spain
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
        .then((res) => res.data.results.bindings[0].flag.value);
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

const getAuthorsByCountry = async (country, language) => {
    const lang = language || 'es';
    const countryId = await getWikiId(country, lang);
    const query = `
    SELECT distinct ?id ?autor ?label
    WHERE {
        ?autor wdt:P2799 ?id .
        ?autor wdt:P27 wd:${country} .
        ?autor rdfs:label ?label.
        FILTER (lang(?label) = '${lang}').
    }
    `;
    return axios.get(baseURL + encodeURI(query)).then((res) => {
        const authors = res.data.results.bindings;
        const authorsList = [];
        for (const author of authors) {
            authorsList.push({
                name: author.label.value,
                id: author.autor.value.replace(
                    'http://www.wikidata.org/entity/',
                    '',
                ),
            });
        }
        return authorsList;
    });
};

const getAuthorsByCity = async (country, language) => {
    const lang = language || 'es';
    const cityId = await getWikiId(country, lang);
    const query = `
    SELECT distinct ?id ?autor ?label
    WHERE {
        ?autor wdt:P2799 ?id .
        ?autor wdt:P19 wd:${cityId} .
        ?autor rdfs:label ?label.
        FILTER (lang(?label) = '${lang}').
    }
    `;
    return axios.get(baseURL + encodeURI(query)).then((res) => {
        const authors = res.data.results.bindings;
        const authorsList = [];
        for (const author of authors) {
            authorsList.push({
                name: author.label.value,
                id: author.autor.value.replace(
                    'http://www.wikidata.org/entity/',
                    '',
                ),
            });
        }
        return authorsList;
    });
};

const authorsByMovement = (movement, language) => {
    const lang = language || 'es';

    const query = `
    SELECT ?author ?authorLabel
    WHERE 
    {
      ?author wdt:P31 wd:Q5 .  
      ?author wdt:P135 wd:${movement}
      
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],${lang}". }
    }
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
    console.log(query);
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
    getAuthorBooks,
    getAuthorNotableWork,
    getAuthorPseudonym,
    getAuthorNickname,
    getAuthorMovement,
    getPersonImage,
    getPersonBirth,
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
