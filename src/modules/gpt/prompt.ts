import { CEFR } from 'src/common/constants/cefr-level';
import { GrammarByLevel } from 'src/common/constants/grammar-level';
import { NUMBER_OF_EXAMPLES } from '../../common/constants/common';

export const highlightWordsPrompt = (paragraph: string, level: CEFR) => {
  return `
  Given:
  ${paragraph}
  Return me list of words that ${level} students should learn in json
  Example response:
  {words: ["excuse", "blame", "happen"]}`;
};

export const recommendGrammarsPrompt = (sentences: string[], level: CEFR) => {
  const grammarsByLevel = GrammarByLevel[level];

  return `
  Given: 
  Sentences: [${sentences}]
  Grammar list of level ${level}: ${grammarsByLevel}
  Return me list of grammar of each sentence in json, if sentence is not meaningful skip that sentence
  Example response:
  [{"sentence": sentences[0],"grammars": ["Present Simple","Present Simple"]},{"sentence": sentences[1],"grammars": ["Past Simple"]}
]`;
};

export const grammarMetaPrompt = (level: CEFR, grammars: string[]) => {
  return `
  You are a teacher, you want to know the usage of each grammar in the list to teach your students.
  Given: 
  Grammars: [${grammars}]
  Return me the usage of each grammar, ${NUMBER_OF_EXAMPLES} examples with more than 15 words and less than 50 words that students level ${level} can understand in json
  Example response:
  [{"grammar": grammars[0],"usage": "Present Simple is used to describe actions that happen regularly","examples": ["I go to school every day", ...]}]`;
};

export const generateExampleForVocabularyPrompt = (
  level: CEFR,
  words: string[],
) => {
  return `
  You are a teacher, you want to know the example of each word in the list to teach your students.
  Given: 
  Words: [${words}]
  Return me the example of each word, ${NUMBER_OF_EXAMPLES} examples with more than 15 words and less than 50 words that students level ${level} can understand in json
  Example response:
  [{"word": words[0],"examples": ["I am sorry, but I have to leave now", ...]}]`;
};
