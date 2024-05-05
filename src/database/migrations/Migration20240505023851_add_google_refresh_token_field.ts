import { Migration } from '@mikro-orm/migrations';

export class Migration20240505023851_add_google_refresh_token_field extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `users` add `google_refresh_token` varchar(255) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `users` drop `google_refresh_token`;');
  }

}
