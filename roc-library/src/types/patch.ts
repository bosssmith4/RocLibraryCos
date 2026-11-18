export interface PatchItemsDto {
  unidentifiedDisplayName: string;
  unidentifiedResourceName: string;
  unidentifiedDescriptionName: string[];
  identifiedDisplayName: string;
  identifiedResourceName: string;
  identifiedDescriptionName: string[];
  slotCount: number;
  ClassNum: number;
  costume: boolean;
  /** Whether the patch brings the item for the first time or changes an existing one. */
  patchType?: "new" | "modified";
}
