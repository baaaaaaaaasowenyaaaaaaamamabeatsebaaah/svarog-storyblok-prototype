// File: src/types/jsdoc.js
/**
 * JSDoc type definitions for the Svarog-UI + Storyblok integration
 * Updated with actual svarog-ui exports
 */

/**
 * @typedef {Object} SvarogComponent
 * @property {Function} getElement - Returns DOM element
 * @property {Function} [update] - Updates component state
 * @property {Function} destroy - Cleanup function
 */

/**
 * @typedef {Function} SvarogComponentFactory
 * @param {Object} props - Component properties
 * @returns {SvarogComponent} Component instance
 */

/**
 * Svarog UI Component Factories (based on actual exports)
 * @typedef {Object} SvarogUIComponents
 * @property {SvarogComponentFactory} BlogCard
 * @property {SvarogComponentFactory} BlogDetail
 * @property {SvarogComponentFactory} BlogList
 * @property {SvarogComponentFactory} Button
 * @property {SvarogComponentFactory} Card
 * @property {SvarogComponentFactory} Checkbox
 * @property {SvarogComponentFactory} CollapsibleHeader
 * @property {SvarogComponentFactory} ConditionSelector
 * @property {SvarogComponentFactory} ContactInfo
 * @property {SvarogComponentFactory} Content
 * @property {SvarogComponentFactory} Footer
 * @property {SvarogComponentFactory} Form
 * @property {SvarogComponentFactory} FormActions
 * @property {SvarogComponentFactory} FormGroup
 * @property {SvarogComponentFactory} FormSection
 * @property {SvarogComponentFactory} Forms
 * @property {SvarogComponentFactory} Grid
 * @property {SvarogComponentFactory} Head
 * @property {SvarogComponentFactory} Header
 * @property {SvarogComponentFactory} Hero
 * @property {SvarogComponentFactory} Image
 * @property {SvarogComponentFactory} Input
 * @property {SvarogComponentFactory} Layout
 * @property {SvarogComponentFactory} Link
 * @property {SvarogComponentFactory} Logo
 * @property {SvarogComponentFactory} Map
 * @property {SvarogComponentFactory} MuchandyHero
 * @property {SvarogComponentFactory} Nav
 * @property {SvarogComponentFactory} Navigation
 * @property {SvarogComponentFactory} Page
 * @property {SvarogComponentFactory} Pagination
 * @property {SvarogComponentFactory} PhoneRepairForm
 * @property {SvarogComponentFactory} PhoneRepairFormContainer
 * @property {SvarogComponentFactory} PriceDisplay
 * @property {SvarogComponentFactory} ProductCard
 * @property {SvarogComponentFactory} Radio
 * @property {SvarogComponentFactory} RadioGroup
 * @property {SvarogComponentFactory} Rating
 * @property {SvarogComponentFactory} Section
 * @property {SvarogComponentFactory} Select
 * @property {SvarogComponentFactory} StepsIndicator
 * @property {SvarogComponentFactory} StickyContactIcons
 * @property {SvarogComponentFactory} Tabs
 * @property {SvarogComponentFactory} Typography - Text component for content
 * @property {SvarogComponentFactory} UI
 * @property {SvarogComponentFactory} UsedPhonePriceForm
 * @property {SvarogComponentFactory} UsedPhonePriceFormContainer
 * @property {SvarogComponentFactory} Utils
 * @property {Function} getCurrentTheme - Get current theme name
 * @property {Function} setThemeVariable - Set theme CSS variable
 * @property {Function} switchTheme - Switch to different theme
 * @property {Object} themeManager - Theme management utilities
 */

/**
 * @typedef {Object} StoryblokComponent
 * @property {string} component - Component type identifier
 * @property {string} [_uid] - Unique identifier
 * @property {string} [_editable] - Editable metadata for visual editor
 */

/**
 * @typedef {Object} StoryblokStory
 * @property {number} id - Story ID
 * @property {string} name - Story name
 * @property {string} slug - URL slug
 * @property {string} full_slug - Full URL path
 * @property {StoryblokContent} content - Story content
 * @property {string} created_at - Creation timestamp
 * @property {string} published_at - Publication timestamp
 * @property {string} [uuid] - Unique identifier
 */

/**
 * @typedef {Object} StoryblokContent
 * @property {string} [title] - Page title
 * @property {string} [description] - Page description
 * @property {Array<StoryblokComponent>} body - Page body components
 */

/**
 * @typedef {Object} StoryblokAsset
 * @property {string} filename - Asset URL
 * @property {string} [alt] - Alternative text
 * @property {string} [title] - Asset title
 * @property {number} [id] - Asset ID
 */

/**
 * @typedef {Object} StoryblokRichText
 * @property {string} type - Content type (usually 'doc')
 * @property {Array<RichTextNode>} content - Rich text nodes
 */

/**
 * @typedef {Object} RichTextNode
 * @property {string} type - Node type
 * @property {Object} [attrs] - Node attributes
 * @property {Array<RichTextNode>} [content] - Child nodes
 * @property {string} [text] - Text content
 * @property {Array<RichTextMark>} [marks] - Text marks
 */

/**
 * @typedef {Object} RichTextMark
 * @property {string} type - Mark type (bold, italic, link, etc.)
 * @property {Object} [attrs] - Mark attributes
 */

/**
 * @typedef {Object} SvarogButtonProps
 * @property {string} text - Button text
 * @property {string} [href] - Link URL
 * @property {string} [variant='primary'] - Button variant
 * @property {string} [size='medium'] - Button size
 * @property {boolean} [disabled=false] - Disabled state
 * @property {Function} [onClick] - Click handler
 * @property {string} [theme='default'] - Theme name
 */

/**
 * @typedef {Object} SvarogTypographyProps
 * @property {string} content - Typography content (HTML or text)
 * @property {string} [variant='body'] - Typography variant
 * @property {string} [alignment='left'] - Text alignment
 * @property {string} [theme='default'] - Theme name
 * @property {string} [tag='p'] - HTML tag to use
 */

/**
 * @typedef {Object} SvarogHeroProps
 * @property {string} title - Hero title
 * @property {string} [subtitle] - Hero subtitle
 * @property {string} [backgroundImage] - Background image URL
 * @property {Object} [ctaButton] - CTA button configuration
 * @property {string} [theme='default'] - Theme name
 */

/**
 * @typedef {Object} SvarogCardProps
 * @property {string} title - Card title
 * @property {string} [content] - Card content
 * @property {string} [image] - Image URL
 * @property {Object} [link] - Link configuration
 * @property {string} [variant='default'] - Card variant
 * @property {string} [theme='default'] - Theme name
 */

/**
 * @typedef {Object} AppConfig
 * @property {HTMLElement} container - DOM container
 * @property {string} [theme='default'] - Initial theme
 * @property {boolean} [enableLivePreview=false] - Enable Storyblok preview
 */

/**
 * @typedef {Object} App
 * @property {Function} init - Initialize application
 * @property {Function} navigateToRoute - Navigate to route
 * @property {Function} changeTheme - Change theme
 * @property {Function} getStatus - Get app status
 * @property {Function} destroy - Cleanup application
 */

/**
 * @typedef {Object} AppStatus
 * @property {boolean} ready - App ready state
 * @property {string} currentRoute - Current route path
 * @property {string} currentTheme - Current theme name
 * @property {Object} cacheStats - Cache statistics
 * @property {boolean} storyLoaded - Story loaded state
 */

/**
 * @typedef {Object} StoryblokClientConfig
 * @property {string} accessToken - API access token
 * @property {string} [version='published'] - Content version
 * @property {boolean} [cache=true] - Enable caching
 * @property {string} [region='eu'] - API region
 */

/**
 * @typedef {Object} StoryblokClient
 * @property {Function} getStoryWithComponents - Fetch story with components
 * @property {Function} getStoriesWithComponents - Fetch multiple stories
 * @property {Function} renderStoryToContainer - Render story to DOM
 * @property {Function} refreshStory - Refresh story content
 * @property {Function} clearCache - Clear all caches
 * @property {Function} getCacheStats - Get cache statistics
 * @property {Function} enableLivePreview - Enable visual editor
 */

/**
 * @typedef {Object} ComponentValidationSchema
 * @property {string} type - Data type
 * @property {boolean} [required=false] - Required field
 * @property {*} [default] - Default value
 * @property {number} [maxLength] - Max string length
 * @property {number} [minLength] - Min string length
 * @property {number} [min] - Min number value
 * @property {number} [max] - Max number value
 * @property {Array<string>} [enum] - Allowed values
 * @property {string} [pattern] - Regex pattern
 * @property {Object} [properties] - Object properties schema
 */

/**
 * @typedef {Object} PerformanceMetrics
 * @property {number} LCP - Largest Contentful Paint
 * @property {number} FID - First Input Delay
 * @property {number} CLS - Cumulative Layout Shift
 * @property {number} TTFB - Time to First Byte
 */

/**
 * @typedef {Object} CacheStats
 * @property {number} componentCacheSize - Component cache size
 * @property {number|string} storyblokCacheSize - Storyblok cache size
 */

/**
 * @typedef {Object} ValidationError
 * @property {string} name - Error name
 * @property {string} message - Error message
 * @property {string} [field] - Field that failed validation
 */

// Export types for IDE support
export default {};
