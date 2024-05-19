import { CEFR } from 'src/common/constants/cefr-level';
import { GrammarByLevel } from 'src/common/constants/grammar-level';

export const hightlightWordsPrompt = (paragraph: string, level: CEFR) => {
  return `
  Given:
  ${paragraph}
  Return me list of words that ${level} students should learn in json
  Example response:
  {
  words: ["excuse", "blame", "happen"]
  }`;
};

export const recommendGrammarsPrompt = (sentences: string[], level: CEFR) => {
  const grammarsByLevel = GrammarByLevel[level];

  return `
  Given: 
  Sentences: [${sentences}]
  Grammar list of level ${level}: ${grammarsByLevel}
  Return me list of grammar of each sentence, example in json
  Example response:
  [
  {
  "sentence": "Sentence 1.",
   "grammars": ["Present Simple","Present Simple"]
  },
  {
  "sentence": "Sentence 2.",
  "grammars": ["Past Simple"]
  }
  ]`;
};
