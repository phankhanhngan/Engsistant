import { Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import OpenAI from 'openai';
import 'dotenv/config';
import {
  generateVocabularyMetaPrompt,
  grammarMetaPrompt,
  highlightWordsPrompt,
  recommendGrammarsPrompt,
} from './prompt';
import { CEFR } from 'src/common/constants/cefr-level';
import { GrammarRecommendSwaggerDto } from 'src/common/swagger_types/swagger-type.dto';
import { detectLevel } from '../detect/detect.service';
import { GrammarMetaDto } from './dtos/GrammarMeta.dto';
import { VocabMetaDto } from './dtos/VocabMeta.dto';
import { VocabularyGenerateMetaDto } from './dtos/VocabularyGenerateMetaDto.dto';

@Injectable()
export class GptService {
  private gptClient: OpenAI;
  private model = 'gpt-3.5-turbo';
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.gptClient = new OpenAI();
  }

  async getHighlightedWords(paragraph: string, level: CEFR): Promise<string[]> {
    try {
      const response = await this.gptClient.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: highlightWordsPrompt(paragraph, level),
          },
        ],
      });
      let words = [];
      if (response.choices.length == 0) {
        return words;
      }
      try {
        words = words.concat(
          JSON.parse(response.choices[0].message.content).words,
        );
      } catch (error) {
        console.log('error', error);
      }
      return words;
    } catch (error) {
      this.logger.error(
        'Calling getHighlightedWords()',
        error,
        GptService.name,
      );
      throw new Error(
        'Failed to get highlighted words due to error= ' + error.message,
      );
    }
  }

  async getGrammarsFromSentences(
    sentences: string[],
    level: CEFR,
  ): Promise<GrammarRecommendSwaggerDto[]> {
    try {
      // For each sentence, call model to detect level
      const sentencesWithLevel = await detectLevel(sentences);
      // If detected level is higher or equals than level, call gpt to get grammar features/ usage, example
      const filteredSentences = sentencesWithLevel
        .filter(
          (sentence) => sentence.cefr == level || sentence.cefr == level + 1,
        )
        .map((sentence) => sentence.sentence);

      if (filteredSentences.length == 0) {
        return [];
      }
      const grammarPrompt = recommendGrammarsPrompt(filteredSentences, level);
      const response = await this.gptClient.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: grammarPrompt,
          },
        ],
      });
      let grammars = [];

      if (response.choices.length == 0) {
        return grammars;
      }

      try {
        const res = JSON.parse(response.choices[0].message.content);
        res.forEach((element) => {
          grammars = grammars.concat({
            sentence: element.sentence,
            grammars: element.grammars,
          });
        });
      } catch (error) {
        console.log('error', error);
      }
      return grammars;
    } catch (error) {
      this.logger.error(
        'Calling getHighlightedWords()',
        error,
        GptService.name,
      );
      throw new Error(
        'Failed to get highlighted words due to error= ' + error.message,
      );
    }
  }

  async getGrammarMeta(
    level: CEFR,
    grammars: string[],
  ): Promise<GrammarMetaDto[]> {
    try {
      console.log('Start get grammar meta');
      if (grammars.length == 0) return [];
      const prompt = grammarMetaPrompt(level, grammars);

      const response = await this.gptClient.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: prompt,
          },
        ],
      });
      let grammarMeta = [];
      if (response.choices.length == 0) {
        return grammarMeta;
      }
      grammarMeta = JSON.parse(response.choices[0].message.content);
      if (grammarMeta.length == 0) return [];
      console.log('Done get grammar meta');

      return grammarMeta.map((el) => ({
        grammar: el.grammar,
        usage: el.usage,
        example: el.examples ?? [],
      }));
    } catch (error) {
      this.logger.error('Calling getGrammarMeta()', error, GptService.name);
      throw new Error(
        'Failed to get grammar meta due to error= ' + error.message,
      );
    }
  }

  async generateVocabulary(
    level: CEFR,
    sentencesAndIndexes: VocabularyGenerateMetaDto[],
  ): Promise<VocabMetaDto[]> {
    try {
      console.log('Start get vocabulary meta');

      if (sentencesAndIndexes.length == 0) {
        return [];
      }
      const response = await this.gptClient.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: generateVocabularyMetaPrompt(level, sentencesAndIndexes),
          },
        ],
      });
      let vocabularyMeta = [];
      if (response.choices.length == 0) {
        return vocabularyMeta;
      }
      vocabularyMeta = JSON.parse(response.choices[0].message.content);
      if (vocabularyMeta.length == 0) return [];
      console.log('Done get vocabulary meta');

      return vocabularyMeta.map((el) => ({
        word: el.word,
        meaning: el.meaning,
        functionalLabel: el.functionalLabel,
        synonyms: el.synonyms,
        antonyms: el.antonyms,
        examples: el.examples,
      }));
    } catch (error) {
      this.logger.error(
        'Calling getVocabularyExample()',
        error,
        GptService.name,
      );
      throw new Error(
        'Failed to get vocabulary example due to error= ' + error.message,
      );
    }
  }
}
