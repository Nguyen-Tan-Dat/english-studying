import { ApiError } from "./api-error";

export function requireString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw ApiError.badRequest(`${fieldName} is required`);
  }

  return value.trim();
}

export function optionalString(
  value: unknown,
  fieldName: string,
): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw ApiError.badRequest(`${fieldName} must be a string`);
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

export function requireIntegerInRange(
  value: unknown,
  fieldName: string,
  minimum: number,
  maximum: number,
): number {
  const numberValue = typeof value === "number" ? value : Number(value);

  if (
    !Number.isInteger(numberValue) ||
    numberValue < minimum ||
    numberValue > maximum
  ) {
    throw ApiError.badRequest(
      `${fieldName} must be an integer between ${minimum} and ${maximum}`,
    );
  }

  return numberValue;
}

export function optionalPositiveInteger(
  value: unknown,
  fieldName: string,
  fallback: number,
  maximum: number,
): number {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return requireIntegerInRange(value, fieldName, 1, maximum);
}

export function optionalNullableString(
  value: unknown,
  fieldName: string,
): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw ApiError.badRequest(`${fieldName} must be a string or null`);
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

export function requireStringArray(
  value: unknown,
  fieldName: string,
): string[] {
  if (!Array.isArray(value)) {
    throw ApiError.badRequest(`${fieldName} must be an array of strings`);
  }

  const normalizedValues = value.map((item, index) => {
    if (typeof item !== "string" || item.trim().length === 0) {
      throw ApiError.badRequest(
        `${fieldName}[${index}] must be a non-empty string`,
      );
    }

    return item.trim();
  });

  return [...new Set(normalizedValues)];
}
