export const MessagesEntity = {
  ERR_FILE_INVALID_EXTENSION: 'err invalid extension file',
  ERR_FILE_SYSTEM: 'err in file system',
  ERR_DATABASE: 'err in data base',
  ERR_ID_ALREADY_EXISTS: 'id already exists',
  ERR_ID_NOT_FOUND: 'id not found',
  BAD_CREDENTIALS: 'user or password is wrong',
  genErrFieldNotFound: (field: string) => `${field} not found`,
  genErrFieldRequired: (field: string) => `${field} file is required`,
  genErrFieldAlreadyExist: (field: string) => `${field} already exists`,
  genErrFieldHasRelationship: (field: string, parent: string) => `${field} has a relationship with ${parent}`,
}
