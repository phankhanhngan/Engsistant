import { Migration } from '@mikro-orm/migrations';

export class Migration20240601095804_add_user_item_table extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table `user_items` (`id` varchar(255) not null, `created_at` datetime not null, `updated_at` datetime not null, `deleted_at` datetime null, `user_id` varchar(255) not null, `item_id` varchar(255) not null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;',
    );

    this.addSql('alter table `grammars` drop `starred`;');

    this.addSql('alter table `vocabularies` drop `starred`;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists `user_items`;');

    this.addSql(
      'alter table `grammars` add `starred` tinyint(1) not null default false;',
    );

    this.addSql(
      'alter table `vocabularies` add `starred` tinyint(1) not null default false;',
    );
  }
}
