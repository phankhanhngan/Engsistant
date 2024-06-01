import { CEFR } from 'src/common/constants/cefr-level';
import { GrammarByLevel } from 'src/common/constants/grammar-level';
import {
  MAX_NUMBER_OF_THESAURUS,
  NUMBER_OF_EXAMPLES,
} from '../../common/constants/common';
import { VocabularyGenerateMetaDto } from './dtos/VocabularyGenerateMetaDto.dto';

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
  [{"sentence": sentences[0],"grammars": ["Present Simple","Adverbs of frequency", ...]},{"sentence": sentences[1],"grammars": ["Past Simple"]}
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

export const generateVocabularyMetaPrompt = (
  level: CEFR,
  meta: VocabularyGenerateMetaDto[],
) => {
  const metaJson = JSON.stringify(meta);
  return `
  You are a teacher, you want to teach students with level ${level} vocabularies from list of sentences and word indexes. In case if many words have the same meaning, just keep 1.
  Given: 
  Sentences and word indexes: ${metaJson}
  Give me meaning, function label, maximum ${MAX_NUMBER_OF_THESAURUS} synonyms, maximum ${MAX_NUMBER_OF_THESAURUS} antonyms of each word in the given sentence context, and ${NUMBER_OF_EXAMPLES} examples with more than 15 words and less than 50 words that students level ${level} can understand in json
  Example response:
  [{"word": "leave", "meaning": "go away from", "functionalLabel": "verb", "synonyms": ["depart from", "go from", ...], "antonyms": ["arrive", "come", "stay", ...], "examples": ["she left New York on June 6"", ...]}]`;
};
