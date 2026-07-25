export type MessageTree = { [key: string]: string | MessageTree };

/**
 * Client-safe message lookup. Never import Node APIs into this module.
 */
export function translateKey(
  messages: Record<string, MessageTree>,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const [ns, ...rest] = key.split(".");
  if (!ns || !rest.length) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[i18n] Invalid key: ${key}`);
    }
    return key;
  }
  let node: string | MessageTree | undefined = messages[ns];
  for (const part of rest) {
    if (!node || typeof node === "string") {
      node = undefined;
      break;
    }
    node = node[part];
  }
  if (typeof node !== "string") {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[i18n] Missing key: ${key}`);
    }
    return messages.errors &&
      typeof (messages.errors as MessageTree).missingTranslation === "string"
      ? ((messages.errors as MessageTree).missingTranslation as string)
      : key;
  }
  return node.replace(/\{(\w+)\}/g, (_, name: string) =>
    vars && name in vars ? String(vars[name]) : `{${name}}`,
  );
}
