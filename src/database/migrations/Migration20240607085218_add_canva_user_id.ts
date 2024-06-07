import { Migration } from '@mikro-orm/migrations';

export class Migration20240607085218_add_canva_user_id extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `users` add `canva_user_id` varchar(255) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `users` drop `canva_user_id`;');
  }

}
