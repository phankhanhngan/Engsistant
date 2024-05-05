import { Migration } from '@mikro-orm/migrations';

export class Migration20240505041747_update_relation_of_user_and_class extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `users_classes` (`user_id` varchar(255) not null, `class_id` varchar(255) not null, primary key (`user_id`, `class_id`)) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `users_classes` add index `users_classes_user_id_index`(`user_id`);');
    this.addSql('alter table `users_classes` add index `users_classes_class_id_index`(`class_id`);');

    this.addSql('alter table `users_classes` add constraint `users_classes_user_id_foreign` foreign key (`user_id`) references `users` (`id`) on update cascade on delete cascade;');
    this.addSql('alter table `users_classes` add constraint `users_classes_class_id_foreign` foreign key (`class_id`) references `classes` (`id`) on update cascade on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists `users_classes`;');
  }

}
