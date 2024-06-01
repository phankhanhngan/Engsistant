import { Entity, Property } from '@mikro-orm/core';
import { BaseUUID } from './baseUUID.enity';

@Entity({ tableName: 'user_items' })
export class UserItem extends BaseUUID {
  @Property({ nullable: false })
  userId: string;

  @Property({ nullable: false })
  itemId!: string;
}
