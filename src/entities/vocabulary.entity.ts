import { Entity, ManyToOne, Property, TextType } from '@mikro-orm/core';
import { BaseUUID } from './baseUUID.enity';
import { Lesson } from './lesson.entity';
import { CEFR } from '../common/constants/cefr-level';

@Entity({ tableName: 'vocabularies' })
export class Vocabulary extends BaseUUID {
  @ManyToOne({ entity: () => Lesson })
  lesson: Lesson;

  @Property({ nullable: false })
  word!: string;

  @Property({ nullable: false })
  meaning!: string;

  @Property({ type: TextType, nullable: false })
  synonymMeta!: string;

  @Property({ type: TextType, nullable: false })
  antonymMeta!: string;

  @Property({ type: TextType, nullable: false })
  exampleMeta!: string;

  @Property({ nullable: true })
  pronunciationAudio?: string;

  @Property({ nullable: true })
  pronunciationWritten?: string;

  @Property({ nullable: false })
  level!: CEFR;

  @Property({ nullable: true })
  functionalLabel?: string;
}
