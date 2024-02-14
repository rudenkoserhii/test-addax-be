import { LabelType } from 'common/types';

type TaskType = {
  id?: string;
  date?: string;
  title?: string;
  content?: string;
  owner?: { id: string };
  label?: LabelType[];
  order?: number;
};

export { type TaskType };
