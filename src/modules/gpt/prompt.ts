import { CEFR } from 'src/common/constants/cefr-level';
import { GrammarByLevel } from 'src/common/constants/grammar-level';
import {
  MAX_NUMBER_OF_THESAURUS,
  NUMBER_OF_EXAMPLES,
} from '../../common/constants/common';
import { VocabularyGenerateMetaDto } from './dtos/VocabularyGenerateMetaDto.dto';

export const highlightWordsPrompt = (paragraph: string, level: CEFR) => {
  return `
  You are a teacher, you want to teach your student with level ${level} new vocabularies from the paragraph.
  Given the paragraph:
  ${paragraph}
  Return me list of words that ${level} students should learn in json. The response should only contain the json, no other information.
  Example response:
  {words: ["excuse", "blame", "happen"]}`;
};

export const recommendGrammarsPrompt = (sentences: string[], level: CEFR) => {
  const grammarsByLevel = GrammarByLevel[level];

  return `
  You are a teacher, you want to teach your student with level ${level} new grammars from the paragraph.
  Given: 
  Sentences: [${sentences}]
  List grammar of level ${level}: ${grammarsByLevel}
  Return me list of grammar of each sentence in json, if sentence is not meaningful skip that sentence. If sentence does not have any grammars in list, skip.
  The response should only contain the json, no other information. The json response should be valid.
  Example response:
  [{"sentence": sentences[0],"grammars": ["Present Simple","Adverbs of frequency", ...]},{"sentence": sentences[1],"grammars": ["Past Simple"]}
]`;
};

export const grammarMetaPrompt = (level: CEFR, grammars: string[]) => {
  return `
  You are a teacher, you want to  teach your students the usage of each grammar in the list.
  Given: 
  Grammars: [${grammars}]
  Return me the usage of each grammar, ${NUMBER_OF_EXAMPLES} examples with more than 15 words and less than 50 words that students level ${level} can understand, and the usage must be detailed and clear in JSON.
  The response should be a valid json, no other information. The json response should also contain \\n to split the long usage.
  Example response: [{"grammar": "Alternative Comparative forms","usage": "Use and Form: These structures can be used to compare two things. They are alternatives to the comparative form (-er / more ...).\\n1) Some phrases can be used to show that two things are identical.\\n2) Some phrases can be used to show that two things are the same or nearly the same.\\n3) Common Mistakes: Some students try to use the–er / more comparative form to make negative comparisons. However, not as … as is more common. \\nI’m not taller than you. => I’m not as tall as you.","examples": ["His results are a bit different from ours.", "Julia is just as sociable as Maria is."]},{"grammar": "Future perfect continuous","usage": "Use: \\n- Use the future perfect continuous to talk about an event that will be in progress for some time before a specified time in the future.\\n- It can be used to make predictions about event that will be in progress before a specified time in the future.\\n- It can be used to predict what was happening in the past.\\n- Both the fixed future time and the length of time of are often mentioned in future perfect continuous sentences.\\nForm: \\n- Positive and Negative: S + will have/won’t have + been + verb-ing\\n- Questions: Will/Won’t + S + have + been + verb-ing?","examples": ["Don’t worry. They will have been unpacking boxes.", "Anne will be in a bad mood at the party this evening because she’ll have been doing housework.."]}]"
`;
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
  Give me meaning, function label, maximum ${MAX_NUMBER_OF_THESAURUS} synonyms, maximum ${MAX_NUMBER_OF_THESAURUS} antonyms of each word in the given sentence context, and ${NUMBER_OF_EXAMPLES} examples with more than 15 words and less than 50 words that students level ${level} can understand in json.
  The response should only contain the json, no other information.
  Example response:
  [{"word": "leave", "meaning": "go away from", "functionalLabel": "verb", "synonyms": ["depart from", "go from", ...], "antonyms": ["arrive", "come", "stay", ...], "examples": ["she left New York on June 6"", ...]}]`;
};
