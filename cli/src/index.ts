/**
 * CLI parser package placeholder.
 * Submodules: ios15, iosxe.
 */
export const CLI_PACKAGE_NAME = "@netsimtri/cli";
export const SUPPORTED_DIALECTS = ["ios15", "iosxe"] as const;
export type SupportedDialect = (typeof SUPPORTED_DIALECTS)[number];
