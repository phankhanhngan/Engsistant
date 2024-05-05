import { Migration } from '@mikro-orm/migrations';

export class Migration20240505045032_make_authId_nullable extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `users` modify `auth_id` varchar(255) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `users` modify `auth_id` varchar(255) not null;');
  }

}
