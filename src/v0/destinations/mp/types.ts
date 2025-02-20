import { Destination, RouterTransformationRequestData } from '../../../types';

/**
 * Configuration interface for Mixpanel destination
 */
type MixpanelConfig = {
  /** API key for authentication */
  apiKey?: string;
  /** Token for Mixpanel project */
  token?: string;
  /** Enable funnel tracking */
  enableFunnels?: boolean;
  /** Properties to be included in people profiles */
  peopleProperties?: string[];
  /** Properties to be included in all events */
  superProperties?: string[];
  /** Properties that should only be set once */
  setOnce?: string[];
  /** Mapping of event names from source to destination */
  eventMap?: Record<string, string>;
  /** Mapping of property names from source to destination */
  propMap?: Record<string, string>;
  /** Settings for group analytics */
  groupKeySettings?: {
    groupKey: string;
    groupKeyId: string;
  }[];
  /** Consolidate page calls into a single event */
  consolidatedPageCalls?: boolean;
  /** Track categorized pages */
  trackCategorizedPages?: boolean;
  /** Track named pages */
  trackNamedPages?: boolean;
  /** Source name for event tracking */
  sourceName?: string;
  /** Data residency setting ('eu' for EU data center) */
  dataResidency?: 'eu' | string;
  /** Token for GDPR API access */
  gdprApiToken?: string;
  /** API to use for user deletion ('task' for deletion task) */
  userDeletionApi?: 'task' | string;
  /** API to use for identity merging */
  identityMergeApi?: 'simplified' | string;
  /** Whether to drop traits in track events */
  dropTraitsInTrackEvent?: boolean;
  /** Use new mapping format */
  useNewMapping?: boolean;
  /** Enable strict mode */
  strictMode?: boolean;
  /** Service account username */
  serviceAccountUserName?: string;
  /** Service account secret */
  serviceAccountSecret?: string;
  /** Project ID */
  projectId?: string;
  /** Properties to increment */
  propIncrements?: { property: string }[];
  /** Use custom page event names */
  useUserDefinedPageEventName?: boolean;
  /** Template for custom page event names */
  userDefinedPageEventTemplate?: string;
  /** Use custom screen event names */
  useUserDefinedScreenEventName?: boolean;
  /** Template for custom screen event names */
  userDefinedScreenEventTemplate?: string;
  /** Properties to be set only once */
  setOnceProperties?: {
    property: string;
  }[];
};

/**
 * Interface representing a Rudder event
 */
interface RudderEvent {
  message: {
    /** Type of the event */
    type: string;
    /** Event name */
    event?: string;
    /** User ID */
    userId?: string;
    /** Anonymous ID */
    anonymousId?: string;
    /** Context information */
    context?: {
      /** IP address */
      ip?: string;
      /** User traits */
      traits?: Record<string, any>;
      [key: string]: any;
    };
    /** Event properties */
    properties?: Record<string, any>;
    /** User traits */
    traits?: Record<string, any>;
    /** Event timestamp */
    timestamp?: string;
    [key: string]: any;
  };
  destination: {
    /** Destination configuration */
    Config: MixpanelConfig;
  };
}

/**
 * Interface for user attribute validation
 */
interface UserAttributeValidation {
  /** User ID */
  userId?: string;
  /** User email */
  email?: string;
  /** User phone */
  phone?: string;
}

export type MPMessageType = {
  /** Type of the event */
  type: string;
  /** Event name */
  event?: string;
  /** User ID */
  userId?: string;
  /** Anonymous ID */
  anonymousId?: string;
  /** Context information */
  context?: {
    /** IP address */
    ip?: string;
    /** User traits */
    traits?: Record<string, any>;
    [key: string]: any;
  };
  /** Event properties */
  properties?: Record<string, any>;
  /** User traits */
  traits?: Record<string, any>;
  /** Event timestamp */
  timestamp?: string;
  [key: string]: any;
};
export type MPDestination = Destination<MixpanelConfig>;

export type MPRouterRequestType = RouterTransformationRequestData<MPMessageType, MPDestination>;

export { RudderEvent, MixpanelConfig, UserAttributeValidation };
