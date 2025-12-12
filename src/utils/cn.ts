import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names with Tailwind CSS conflict resolution.
 * Combines clsx for conditional classes and tailwind-merge for deduplication.
 *
 * @example
 * cn('px-4 py-2', 'px-6') // => 'py-2 px-6'
 * cn('text-red-500', condition && 'text-blue-500')
 * cn({ 'bg-red-500': isError, 'bg-green-500': isSuccess })
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
