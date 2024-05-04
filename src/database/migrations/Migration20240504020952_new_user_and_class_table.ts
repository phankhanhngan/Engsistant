import { Migration } from '@mikro-orm/migrations';

export class Migration20240504020952_new_user_and_class_table extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `users` add `photo` varchar(255) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `users` drop `photo`;');
  }

}
