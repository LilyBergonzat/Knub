import { PermissionLevels } from "../config/configTypes";
import {
  AnyPluginBlueprint,
  GlobalPluginBlueprint,
  GuildPluginBlueprint,
  PluginBlueprintPublicInterface,
  ResolvedPluginBlueprintPublicInterface,
} from "./PluginBlueprint";
import { AnyContext, GlobalContext, GuildContext, GuildPluginMap } from "../types";
import { KeyOfMap } from "../utils";
import { APIInteractionGuildMember, Guild, GuildMember, PartialGuildMember } from "discord.js";

export function getMemberRoles(member: GuildMember | PartialGuildMember | APIInteractionGuildMember): string[] {
  return Array.isArray(member.roles)
    ? member.roles
    : Array.from(member.roles.cache.values()).map(r => r.id);
}

export function getMemberLevel(
  levels: PermissionLevels,
  member: GuildMember | PartialGuildMember | APIInteractionGuildMember,
  guild: Guild
): number {
  const memberId = ("id" in member) ? member.id : member.user.id;
  if (guild.ownerId === memberId) {
    return 99999;
  }

  const roles = getMemberRoles(member);
  for (const [id, level] of Object.entries(levels)) {
    if (memberId === id || roles.includes(id)) {
      return level;
    }
  }

  return 0;
}

export function isGuildContext(ctx: AnyContext): ctx is GuildContext {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return (ctx as any).guildId != null;
}

export function isGlobalContext(ctx: AnyContext): ctx is GuildContext {
  return !isGuildContext(ctx);
}

export function isGuildBlueprintByContext(
  _ctx: GuildContext,
  _blueprint: AnyPluginBlueprint
): _blueprint is GuildPluginBlueprint<any> {
  return true;
}

export function isGlobalBlueprintByContext(
  _ctx: GlobalContext,
  _blueprint: AnyPluginBlueprint
): _blueprint is GlobalPluginBlueprint<any> {
  return true;
}

export type PluginPublicInterface<T extends AnyPluginBlueprint> =
  T["public"] extends PluginBlueprintPublicInterface<any> ? ResolvedPluginBlueprintPublicInterface<T["public"]> : null;

/**
 * By default, return an empty config for all guilds and the global config
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function defaultGetConfig() {
  return {};
}

/**
 * By default, load all available guild plugins
 */
export function defaultGetEnabledGuildPlugins(
  ctx: AnyContext,
  guildPlugins: GuildPluginMap
): Array<KeyOfMap<GuildPluginMap>> {
  return Array.from(guildPlugins.keys());
}
