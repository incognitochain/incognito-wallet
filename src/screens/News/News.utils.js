import { TYPE } from './News.constant';

export const handleShouldRenderCategory = (category, userId) => {
  const { type, listNews } = category;
  if (type !== TYPE.news) {
    return true;
  }
  const result = listNews
    .map((listNews) => listNews?.listUserNews)
    .some((list) => {
      const user = list.find((user) => user?.userId === userId);
      return user?.isRead !== -1;
    });
  return result;
};
