import { FeedStrategy } from './feed';
import { appRepository } from '../repository/app-repository';

export const topSubmissions: FeedStrategy = ({ limit, offset }) => {
  return appRepository.findTop(limit, offset);
};
