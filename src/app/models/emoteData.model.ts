import {RangePairModel} from './range-pair.model';

export interface EmoteDataModel {
  emoteId: string;
  rangePairs: RangePairModel[];
  replaceString: string;
}
