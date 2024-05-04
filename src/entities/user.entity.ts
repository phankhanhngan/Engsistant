import { Entity, Enum, Property, Unique } from '@mikro-orm/core';
import { IsEmail } from 'class-validator';
import { Role } from '../common/enum/common.enum';
import { BaseUUID } from './baseUUID.enity';

@Entity({ tableName: 'users' })
export class User extends BaseUUID {
  @Unique()
  @Property({ nullable: false })
  authId!: string;

  @Unique()
  @Property({ nullable: false })
  @IsEmail()
  email!: string;

  @Property({ nullable: false })
  name!: string;

  @Property({ nullable: false })
  @Enum({ items: () => Role })
  role: Role;

  @Property({ nullable: true })
  photo?: string;
}
