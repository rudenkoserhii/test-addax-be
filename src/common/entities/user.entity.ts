import { Column, Entity, OneToMany } from 'typeorm';

import { CoreEntity, Task } from 'common/entities';
@Entity()
export class User extends CoreEntity {
  @Column({ type: 'varchar', name: 'email', default: '' })
  email: string;

  @Column({ type: 'varchar', name: 'password', default: '' })
  password: string;

  @Column({ type: 'varchar', name: 'name', default: '' })
  name: string;

  @Column({ type: 'varchar', name: 'country', default: '' })
  country: string;

  @OneToMany(() => Task, (task) => task.user, { onDelete: 'CASCADE' })
  tasks: Task[];
}
