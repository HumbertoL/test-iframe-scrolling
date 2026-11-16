import type { HideHeaderVariant, IncludeAction, SsoKind } from '../data/routes';

export interface UrlParams {
  envId: string;
  customOrigin: string;
  routeId: string;
  conversationId: string;
  phoneNumber: string;
  textNumberId: string;
  includeEnabled: boolean;
  include: IncludeAction[];
  hideHeader: HideHeaderVariant;
  inboxTextNumberId: string;
  inboxBroadcastId: string;
  inboxIsDone: boolean;
  inboxAutoOptOut: boolean;
  ssoKind: SsoKind;
  ssoValue: string;
  ssoDestinationHome: boolean;
  ssoHideHeader: boolean;
  customPath: string;
  joinHostId: string;
  joinKeyword: string;
  joinType: string;
  extraQuery: string;
}

export type ContainerMode =
  | 'inline'
  | 'drawer'
  | 'modal'
  | 'split'
  | 'compare'
  | 'popup'
  | 'tab';

export type HostScroll = 'page' | 'none';

export interface ContainerConfig {
  mode: ContainerMode;
  width: number;
  height: number;
  /** Drawer/split panel width as % of the stage; the iframe keeps its own width. */
  panelPct: number;
  drawerAnchor: 'right' | 'left';
  scrolling: 'auto' | 'no';
  hostShell: boolean;
  zoom: number;
  sandbox: boolean;
  sandboxTokens: string[];
  allow: string;
  referrerPolicy: ReferrerPolicy;
  compareWidths: number[];
  showRulers: boolean;
}

export interface Scenario {
  url: UrlParams;
  container: ContainerConfig;
}
