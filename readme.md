A library to do requests to wikidata in a simple way. 
## Install

```
$ npm i wikidatanpm
```

## Usage

```
const wkd = require('wikidatanpm');
```

### Get Wikidata Id from search text

All the library functions uses wikidata ids, so if you don't have the id of the element you want to query the first step is get it.

```
await wkd.getWikiId('Miguel de Cervantes')
```

Response:
```
Q5682
```

### Get capital of a country
```
await wkd.countryCapital('Q29','en')
```
Response:
```
{ 
    id: 'Q2807',
    name: 'Madrid' 
}
```
### Get city flag
```
await wkd.cityFlag('Q11959')
```

Response:
```
http://commons.wikimedia.org/wiki/Special:FilePath/Bandera%20d%27Alacant.svg
```
### Get city population
```
await wkd.cityPopulation('Q11959')
```

Response:
```
337482
```

### Get city location
```
await wkd.cityMap('Q11959')
```

Response:
```
http://commons.wikimedia.org/wiki/Special:FilePath/Localitzaci%C3%B3%20d%27Alacant%20respecte%20el%20Pa%C3%ADs%20Valenci%C3%A0.png
```

### Get literaly authors from a country
```
await wkd.getAuthorsByCountry('Q29','female','en');
```

Second parameter refers to gender, it can be: **'male'**,**'female'** or **'all'**

Response:

```
[
    { name: 'Carme Miquel i Diego', id: 'Q16976806' },
    { name: 'Ángela Grassi', id: 'Q5650072' },
    { name: 'Fernán Caballero', id: 'Q291397' },
     ...
]
```


### Get literaly authors from a city
```
await wkd.getAuthorsByCity('Q11959','male','en');
```

Second parameter refers to gender, it can be: **'male'**,**'female'** or **'all'**

Response:

```
[
    { name: 'Diego Álvarez Chanca', id: 'Q5274892' },
    { name: 'Luis Cernuda', id: 'Q439578' },
    { name: 'Gaius Julius Hyginus', id: 'Q298376' },
    ...
]
```

### Get literaly authors from a movement
```
await wkd.authorsByMovement('Q575691','all','Q29','en');
```

Second parameter refers to gender, it can be: **'male'**,**'female'** or **'all'**
Third parameter refers to country, it can be null to request any country

Response:

```
[
    { name: 'Diego Álvarez Chanca', id: 'Q5274892' },
    { name: 'Luis Cernuda', id: 'Q439578' },
    { name: 'Gaius Julius Hyginus', id: 'Q298376' },
    ...
]
```

### Get an image from a person

```
await wkd.getPersonImage('Q5682','en')
```

Response:

```
http://commons.wikimedia.org/wiki/Special:FilePath/Cervantes%20J%C3%A1uregui.jpg
```

### Get the birthday of a person
```
await wkd.getPersonBirth('Q5682','en')
```

Response:

```
{
 name: 'Miguel de Cervantes',
 date: '1547-01-01T00:00:00Z',
 datePrecision: '11',
 place: 'Alcalá de Henares',
 placeId: 'Q46940'
}
```

datePrecision refers to the date precision format stored in Wikidata, see https://www.wikidata.org/wiki/Help:Dates#Precision

### Get the death information of a person
```
await wkd.getPersonDeath('Q5682','en')
```

Response:

```
{
  name: 'Miguel de Cervantes',
  date: '1616-04-22T00:00:00Z',
  datePrecision: '11',
  place: 'Madrid',
  placeId: 'Q2807',
  cause: 'natural causes'
}
```

datePrecision refers to the date precision format stored in Wikidata, see https://www.wikidata.org/wiki/Help:Dates#Precision

### Get family information of a person
```
await wkd.getPersonFamily('Q5682','en')
```

Response:

```
{
  name: 'Miguel de Cervantes',
  dad: 'Rodrigo de Cervantes',
  mom: 'Leonor de Cortinas',
  spouse: 'Catalina de Salazar y Palacios',
  childrenNum: undefined,
  children: 'Isabel de Saavedra'
}
```

### Get the signature of a person
```
await wkd.getPersonSignature('Q5682','en')
```

Response:

```
{
  thumb: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Miguel_de_Cervantes_signature.svg/650px-Miguel_de_Cervantes_signature.svg.png',
  signature: 'http://commons.wikimedia.org/wiki/Special:FilePath/Miguel%20de%20Cervantes%20signature.svg'
}
```

### Get awards won by a person
```
await wkd.getAwards('Q155106','en')
```

Response:

```
[
  'Latino Book Awards',
  'Grand Cross of Naval Merit with white badge',
  'honorary doctorate of the Polytechnic University of Cartagena',
  'silver Medal of the Community of Madrid',
  'Don Quijote Journalism Prize',
  'Cartagenero del Año'
]
```

### Get pseudonym of an author
```
await wkd.getAuthorPseudonym('Q185085','en')
```

Response:

```
Exóristo
```

### Get nickname of an author
```
await wkd.getAuthorNickname('Q5682','en')
```

Response:

```
El manco de Lepanto
```

### Get literary movement of an author
```
await wkd.getAwards('Q185085','en')
```

Response:

```
Generation of '98
```

### Get author notable work
```
await wkd.getAuthorNotableWork('Q5682', 2, 'en')
```

Response:

```
[
  {
    name: 'Exemplary Novels',
    genre: 'novella short story',
    publication_date: '1613-01-01T00:00:00Z'
  },
  {
    name: 'Don Quixote',
    genre: 'chivalric romance chivalric romance novela naturalista novela naturalista adventure novel adventure novel',
    publication_date: '1605-01-01T00:00:00Z'
  }
]
```

Second parameter refers to the maximum of works amount to return

### Get books published by an author
```
await wkd.getAuthorBooks('Q5682', 10, 'en')
```

Response:

```
[
  {
    name: 'The Flanders Panel',
    genre: 'crime novel',
    publication_date: '1990-01-01T00:00:00Z'
  },
  {
    name: 'Eva',
    genre: 'novel',
    publication_date: '2017-01-01T00:00:00Z'
  },
  {
    name: 'The Sun over Breda',
    genre: 'novel',
    publication_date: '1998-01-01T00:00:00Z'
  },
  ...
]
```

Second parameter refers to the maximum of works amount to return

### Get the author of a book
```
await wkd.getBookAuthor('Q559667', 'en')
```

Response:

```
Joanot Martorell
```

### Get the characters of a book
```
await wkd.getBookCharacters('Q559667', 'en')
```

Response:

```
[
  { name: 'Tirant lo Blanc' },
  { name: 'Carmesina' },
  { name: 'Plaerdemavida' }
]
```

### Get random books by genre
```
await wkd.getRandomBooks(10, 'Q208505', 'en')
```

Response:
```
[
  {
    name: 'The Flanders Panel',
    author: 'Arturo Pérez-Reverte',
    genre: 'crime novel'
  },
  {
    name: 'The Fencing Master',
    author: 'Arturo Pérez-Reverte',
    genre: 'crime novel'
  },
  {
    name: 'Chronicle of a Death Foretold',
    author: 'Gabriel García Márquez',
    genre: 'crime novel'
  },
  ...
]
```

### Get twiiter and instagram accounts of a person
```
await wkd.getTwitterAccount('Q615')
```

Response:
```
{ 
    twitter: 'fundacionmessi',
    instagram: 'leomessi'
}
```

### Run a custom query
```
await wkd.customQuery('YOUR SPARQL QUERY')
```




