import 'dotenv/config';

export enum SyncedObjectType {
  FILE_STORAGE = "File Storage",
  DOCUMENTS = "Documents",
  CRM = "CRM"
}

export const FILE_STORAGE_INTEGRATIONS = process.env.NEXT_PUBLIC_FILE_STORAGE_INTEGRATIONS?.split(',');
export const CRM_INTEGRATIONS = process.env.NEXT_PUBLIC_CRM_INTEGRATIONS?.split(',');
