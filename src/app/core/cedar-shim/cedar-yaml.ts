// SHIM: Lightweight JSON → YAML converter for the CEDAR model subset.
// Handles: strings, numbers, booleans, null, arrays, plain objects.
// No dependency on js-yaml or similar libraries.
// Replace with a proper YAML library or the cedar-ts serialize.toYaml() call
// when migrating away from this shim.

/**
 * Converts any JSON-serializable value to a YAML string.
 *
 * SHIM: Replace with serialize.toYaml(cedarTpl) from @metadatacenter/cedar-model
 * once that API is available.
 */
export function toCedarYaml(value: unknown, indent = 0): string {
  const pad = '  '.repeat(indent);

  if (value === null || value === undefined) {
    return 'null';
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'string') {
    return yamlString(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return value
      .map((item) => `${pad}- ${toCedarYaml(item, indent + 1).trimStart()}`)
      .join('\n');
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    return entries
      .map(([k, v]) => {
        const key = yamlKey(k);
        if (v === null || v === undefined) return `${pad}${key}: null`;
        if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v as object).length === 0) {
          return `${pad}${key}: {}`;
        }
        if (Array.isArray(v) && v.length === 0) {
          return `${pad}${key}: []`;
        }
        if (typeof v === 'object') {
          return `${pad}${key}:\n${toCedarYaml(v, indent + 1)}`;
        }
        return `${pad}${key}: ${toCedarYaml(v, indent + 1)}`;
      })
      .join('\n');
  }

  return String(value);
}

/** Wraps a YAML key in quotes if it contains special characters */
function yamlKey(key: string): string {
  // Quote keys that contain YAML-special chars or start with special chars
  if (/[:#\[\]{},&*?|<>=!%@`]/.test(key) || /^\s|\s$/.test(key) || key === '') {
    return `"${key.replace(/"/g, '\\"')}"`;
  }
  return key;
}

/** Serializes a string value for YAML — quotes if multiline or contains special chars */
function yamlString(s: string): string {
  if (s === '') return "''";

  // Multiline: use literal block scalar
  if (s.includes('\n')) {
    const lines = s.split('\n').map((l) => `  ${l}`).join('\n');
    return `|\n${lines}`;
  }

  // Quote strings that look like YAML scalars or contain special characters
  const needsQuotes =
    /^[:\-#\[\]{},!&*?|<>=@`%]/.test(s) ||
    /^(true|false|null|yes|no|on|off)$/i.test(s) ||
    /^\d/.test(s) ||
    s.includes(': ') ||
    s.includes(' #') ||
    s.startsWith("'") ||
    s.startsWith('"');

  if (needsQuotes) {
    return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }

  return s;
}
