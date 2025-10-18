export function thumbnail(imagePath: string): string {
  return `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${imagePath}`
}
