import { Entity, ManyToOne, Property, TextType } from '@mikro-orm/core';
import { BaseUUID } from './baseUUID.enity';
import { Lesson } from './lesson.entity';

@Entity({ tableName: 'grammars' })
export class Grammar extends BaseUUID {
  @ManyToOne({ entity: () => Lesson })
  lesson: Lesson;

  @Property({ nullable: false })
  name!: string;

  @Property({ nullable: false, type: TextType })
  usage!: string;

  @Property({ type: TextType, nullable: false })
  exampleMeta!: string;
}
