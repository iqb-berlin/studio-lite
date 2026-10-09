import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { ReviewConfigDto } from '@studio-lite-lib/api-dto';

/** Metadata key under which {@link ReviewConfigRequired} stores its settings for the guard to read. */
export const REVIEW_CONFIG_REQUIRED_KEY = 'reviewConfigRequired';

/** A switch of the review's configuration that a route can depend on. */
export type ReviewConfigSetting = keyof ReviewConfigDto;

/**
 * Marks a route under `reviews/:review_id` that answers only when the review has all the named
 * settings switched on -- commenting, or showing the coding or the comments of others. The studio
 * hides what a setting switches off; with this marking the API refuses it as well, for everyone
 * who opens the review (#1784). {@link ReviewConfigGuard} reads it.
 */
export const ReviewConfigRequired = (...settings: ReviewConfigSetting[]): CustomDecorator => SetMetadata(
  REVIEW_CONFIG_REQUIRED_KEY,
  settings
);
