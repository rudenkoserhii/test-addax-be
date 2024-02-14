import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { CoreEntity, User, Label } from 'common/entities';

@Entity()
export class Task extends CoreEntity {
  @Column({ type: 'varchar', name: 'title', default: '' })
  title: string;

  @Column({ type: 'varchar', name: 'content', default: '' })
  content: string;

  @Column({ type: 'varchar', name: 'order', default: '' })
  order: string;

  @OneToMany(() => Label, (label) => label.task, { onDelete: 'CASCADE' })
  labels: Label[];

  @ManyToOne(() => User, (user) => user.tasks)
  user: User;
}
