/**
 * Identity helpers matching Sanity Studio `defineType` / `defineField` /
 * `defineArrayMember`. Studio lives outside this app; these keep schema
 * files typed and copy-pasteable into a Sanity workspace.
 */
export function defineType<const T>(schema: T): T {
  return schema;
}

export function defineField<const T>(field: T): T {
  return field;
}

export function defineArrayMember<const T>(member: T): T {
  return member;
}
