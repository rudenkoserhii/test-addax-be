type TaskResponseType = {
  id: string;
  date: string;
  title: string;
  content: string;
  labels: { id: string; color: string; text: string; order: number }[] | [];
  order: number;
};

export { type TaskResponseType };
