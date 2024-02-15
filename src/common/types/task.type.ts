import { LabelType } from 'common/types';

type TaskType = {
  id?: string;
  date?: string;
  title?: string;
  content?: string;
  label?: LabelType[];
  order?: string;
};

export { type TaskType };
