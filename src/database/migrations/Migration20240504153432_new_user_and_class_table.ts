import { Migration } from '@mikro-orm/migrations';

export class Migration20240504153432_new_user_and_class_table extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table `users` (`id` varchar(255) not null, `created_at` datetime not null, `updated_at` datetime not null, `deleted_at` datetime null, `auth_id` varchar(255) not null, `email` varchar(255) not null, `name` varchar(255) not null, `role` varchar(255) not null, `photo` varchar(255) null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;',
    );
    this.addSql(
      'alter table `users` add unique `users_auth_id_unique`(`auth_id`);',
    );
    this.addSql(
      'alter table `users` add unique `users_email_unique`(`email`);',
    );

    this.addSql(
      'create table `classes` (`id` varchar(255) not null, `created_at` datetime not null, `updated_at` datetime not null, `deleted_at` datetime null, `name` varchar(255) not null, `description` varchar(255) null, `google_course_id` varchar(255) not null, `owner_id` varchar(255) not null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;',
    );
    this.addSql(
      'alter table `classes` add unique `classes_description_unique`(`description`);',
    );
    this.addSql(
      'alter table `classes` add index `classes_owner_id_index`(`owner_id`);',
    );

    this.addSql(
      'alter table `classes` add constraint `classes_owner_id_foreign` foreign key (`owner_id`) references `users` (`id`) on update cascade on delete cascade;',
    );
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table `classes` drop foreign key `classes_owner_id_foreign`;',
    );

    this.addSql('drop table if exists `users`;');

    this.addSql('drop table if exists `classes`;');
  }
}
