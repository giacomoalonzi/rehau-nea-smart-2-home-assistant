/**
 * REHAU API Response Parsers
 * 
 * This module provides standalone parsers for REHAU API responses.
 * These parsers can be used independently in different projects to parse
 * API response dumps for debugging, support, and development purposes.
 */

export {
  UserDataParser,
  type UserDataApiResponse,
  type ParsedUserData,
  type ParsedInstallationInfo,
} from './user-data-parser';

export {
  UserDataParserV2,
  type UserDataApiResponseV2,
  type IUserData,
  type IInstallationInfo as IUserInstallationInfo,
  type IGeofencing as IUserGeofencing,
  type IGeofencingInstall,
  type IPrograms,
  type IDailyProgram,
  type IWeeklyProgram,
  type IProgramTimeSlot,
  type IAssociation,
  type IAssociatedUser,
  type IAbsenceMode,
  type IVacation,
  type IPartyMode,
} from './user-data-parser-v2';

export {
  InstallationDataParser,
  type InstallationDataApiResponse,
  type ParsedInstallationData,
  type ParsedTemperature,
  type ParsedChannel,
  type ParsedZone,
  type ParsedGroup,
  type ParsedController,
  type ParsedMixedCircuit,
} from './installation-data-parser';

export {
  InstallationDataParserV2,
  type InstallationDataApiResponseV2,
  type IUser,
  type IInstall,
  type IGroup,
  type IZone,
  type IChannel,
  type IController,
  type IMixedCircuit,
  type IPump,
  type IDi,
  type IDo,
  type ITemperature,
  type IOperationMode,
  type IChannelConfig,
  type ISetpoints,
  type IGeofencing,
  type IUserSettings,
  type IInstallerSettings,
} from './installation-data-parser-v2';
