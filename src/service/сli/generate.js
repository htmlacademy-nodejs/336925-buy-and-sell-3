"use strict";

const fs = require(`fs`).promises;
const chalk = require(`chalk`);
const {nanoid} = require(`nanoid`);

const {MAX_ID_LENGTH} = require(`../../constants`);

const {
  getRandomInt,
  shuffle,
} = require(`../../utils`);

const DEFAULT_COUNT = 1;
const MAX_COUNT = 1000;
const FILE_NAME = `mock.json`;
const FILE_SENTENCES_PATH = `./data/sentences.txt`;
const FILE_TITLES_PATH = `./data/titles.txt`;
const FILE_CATEGORIES_PATH = `./data/categories.txt`;
const COMMENTS_PATH = `./data/comments.txt`;

const OfferType = {
  offer: `offer`,
  sale: `sale`
};

const SumRestrict = {
  min: 1000,
  max: 100000
};

const PictureRestrict = {
  min: 1,
  max: 16,
};

const getPictureFileName = (number) => {
  return number > 9 ? `item${number}.jpg` : `item0${number}.jpg`;
};

const readContent = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, `utf-8`);
    return content.split(`\n`);
  } catch (err) {
    console.error(chalk.red(err));
    return [];
  }
};


const generateOffers = (count, titles, categories, sentences, comments) => (
  Array(count).fill({}).map(() => ({
    id: nanoid(MAX_ID_LENGTH),
    category: [categories[getRandomInt(0, categories.length - 1)]],
    description: shuffle(sentences).slice(1, 5).join(` `),
    picture: getPictureFileName(getRandomInt(PictureRestrict.min, PictureRestrict.max)),
    title: titles[getRandomInt(0, titles.length - 1)],
    type: Object.keys(OfferType)[Math.floor(Math.random() * Object.keys(OfferType).length)],
    sum: getRandomInt(SumRestrict.min, SumRestrict.max),
    comments: Array(getRandomInt(1, 30)).fill({}).map(() => ({
      id: nanoid(MAX_ID_LENGTH),
      text: shuffle(comments).slice(0, getRandomInt(1, comments.length - 1)).join(` `),
    }))
  }))
);

module.exports = {
  name: `--generate`,
  run(args) {
    const [count] = args;

    let countOffer = Number.parseInt(count, 10) || DEFAULT_COUNT;
    if (countOffer > MAX_COUNT) {
      countOffer = MAX_COUNT;
    }

    const sentencesPromise = readContent(FILE_SENTENCES_PATH);
    const titlesPromise = readContent(FILE_TITLES_PATH);
    const categoriesPromise = readContent(FILE_CATEGORIES_PATH);
    const commentsPromise = readContent(COMMENTS_PATH);

    const promiseMocks = Promise.all([sentencesPromise, titlesPromise, categoriesPromise, commentsPromise]);

    promiseMocks
      .then(([sentences, titles, categories, comments]) => JSON.stringify(generateOffers(countOffer, titles, categories, sentences, comments))
      )
      .then(async (content) => {
        try {
          await fs.writeFile(FILE_NAME, content);
          console.info(chalk.green(`Operation success. File created.`));
        } catch (error) {
          console.error(chalk.red(`Can't write data to file...`));
        }
      });
  }
};
