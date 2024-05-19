import { Migration } from '@mikro-orm/migrations';

export class Migration20240519111925_alter_vocabulary_table extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `vocabularies` add `functional_label` varchar(255) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `vocabularies` drop `functional_label`;');
  }

}
