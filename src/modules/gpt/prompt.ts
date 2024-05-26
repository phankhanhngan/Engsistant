import { CEFR } from 'src/common/constants/cefr-level';
import { GrammarByLevel } from 'src/common/constants/grammar-level';

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
  Return me list of grammar of each sentence, example in json, if the sentence is not meaningful, return empty list for that sentence
  Example response:
  [{"sentence": sentences[0],"grammars": ["Present Simple","Present Simple"]},{"sentence": sentences[1],"grammars": ["Past Simple"]}
]`;
};

export const grammarMetaPrompt = (grammars: string[]) => {
  return `
  You are a teacher, you want to know the usage of each grammar in the list to teach your students.
  Given: 
  Grammars: [${grammars}]
  Return me the usage of each grammar, example for the grammar in json
  Example response:
  [{"grammar": grammars[0],"usage": "Present Simple is used to describe actions that happen regularly","example": "I go to school every day"}]`;
};

export const generateExampleForVocabularyPrompt = (words: string[]) => {
  return `
  You are a teacher, you want to know the example of each word in the list to teach your students.
  Given: 
  Words: [${words}]
  Return me the example of each word, example for the word in json
  Example response:
  [{"word": words[0],"example": "I am sorry, but I have to leave now"}]`;
};
