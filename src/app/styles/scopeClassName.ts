/**
 * The class name a plugin-safe host (Backstage) scopes its ServiceLog
 * stylesheet under -- see plugins/servicelog/src/styles/servicelog-plugin.css
 * and STORY 2.3 checkpoint B1. Exported from @servicelog/core so every
 * element that needs to participate in that CSS scope (the host's wrapper,
 * and this package's own portal roots -- see components/primitives/Dialog.tsx)
 * uses the exact same literal, rather than two packages independently
 * hardcoding a string that could silently drift apart.
 *
 * Applying this class is a no-op in the standalone host: its stylesheet
 * has no rule targeting it.
 */
export const SERVICELOG_SCOPE_CLASS_NAME = 'servicelog-scope';
