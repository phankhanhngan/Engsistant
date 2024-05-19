import { Entity, ManyToOne, Property, TextType } from '@mikro-orm/core';
import { BaseUUID } from './baseUUID.enity';
import { Class } from './class.entity';
import { CEFR } from '../common/constants/cefr-level';

@Entity({ tableName: 'lessons' })
export class Lesson extends BaseUUID {
  @Property({ nullable: true })
  sharedLink?: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ nullable: false })
  name!: string;

  @Property({ nullable: false })
  level: CEFR;

  @ManyToOne({
    entity: () => Class,
  })
  class: Class;
}
