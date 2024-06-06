import { Migration } from '@mikro-orm/migrations';

export class Migration20240606040113_change_grammar_table extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `grammars` modify `usage` text not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `grammars` modify `usage` varchar(255) not null;');
  }

}
