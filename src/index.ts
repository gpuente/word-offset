import fs from 'fs';
import path from 'path';
import inquirer, { DistinctQuestion } from 'inquirer';

const getOffsetIndex = (index: number, offset: number, length: number): number => (index + offset) % length;

const lists = fs.readdirSync(path.join(__dirname, process.env.LIST_DIR as string));

const questions: DistinctQuestion[] = [
  {
    type: 'list',
    name: 'filename',
    message: 'Select a file with the list of words',
    choices: lists,
  },
  {
    type: 'input',
    name: 'offset',
    message: 'Please provide the offset to apply',
    filter: Number,
    validate: (value) => {
      const valid = !isNaN(parseFloat(value));
      return valid || 'Please enter a number';
    },
  },
  {
    type: 'input',
    name: 'words',
    message: 'Please provide a list of words separated by space',
  },
];

type Answers = {
  filename: string;
  offset: number;
  words: string;
};

inquirer.prompt(questions).then((answers) => {
  const { filename, offset, words } = answers as Answers;

  const data = fs.readFileSync(path.join(__dirname, process.env.LIST_DIR as string, filename), 'utf-8');
  const wordsList = data.split(/\s/);
  const userWords = words.split(/\s/);

  const listLength = wordsList.length;

  const calculatedWords = userWords.map((userWord) => {
    const userWordIndex = wordsList.indexOf(userWord);
    if (userWordIndex < 0) throw new Error(`word: "${userWord}" does not exist in the list: "${filename}"`);

    const newIndex = getOffsetIndex(userWordIndex, offset, listLength);
    return wordsList.at(newIndex);
  });

  console.log(`Your new words are: ${calculatedWords.join(' ')}`)
});
