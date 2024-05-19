import { Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import OpenAI from 'openai';
import 'dotenv/config';
import { hightlightWordsPrompt } from './prompt';
import { CEFR } from 'src/common/constants/cefr-level';
import { GrammarRecommendSwaggerDto } from 'src/common/swagger_types/swagger-type.dto';

@Injectable()
export class GptService {
  private gptClient: OpenAI;
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.gptClient = new OpenAI();
  }

  async getHighlightedWords(paragraph: string, level: CEFR): Promise<string[]> {
    try {
      //   const response = await this.gptClient.chat.completions.create({
      //     model: 'gpt-3.5-turbo',
      //     messages: [
      //       {
      //         role: 'system',
      //         content: hightlightWordsPrompt(paragraph, level),
      //       },
      //     ],
      //   });

      return ['excuse', 'blame', 'happen'];
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
      const sentencesWithLevel = sentences.map((sentence) => {
        return {
          sentence,
          level: this.randomEnumValue(CEFR),
        };
      });
      // If detected level is higher or equals than level, call gpt to get grammar features/ usage, example
      const filteredSentences = sentencesWithLevel.filter(
        (sentence) => sentence.level == level || sentence.level == level + 1,
      );

      //   const response = await this.gptClient.chat.completions.create({
      //     model: 'gpt-3.5-turbo',
      //     messages: [
      //       {
      //         role: 'system',
      //         content: recommendGrammarsPrompt(filteredSentences, level),
      //       },
      //     ],
      //   });

      return [
        {
          sentence:
            'A moment of silence is a common way to remember tragedies.',
          grammars: ['Present Simple', 'Infinitive'],
        },
        {
          sentence:
            'In drinking water, the higher the turbidity level, the higher the risk that people may develop diseases.',
          grammars: [
            'Comparatives',
            'Present Simple',
            'Modals - might, may, will, probably',
          ],
        },
      ];
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

  randomEnumValue = (enumeration) => {
    const values = Object.keys(enumeration);
    const enumKey = values[Math.floor(Math.random() * values.length)];
    return enumeration[enumKey];
  };
}
