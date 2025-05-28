# Component Reference

Complete guide to all available components.

## Layout Components

### Grid
```javascript
{
  component: 'grid',
  columns: 12,
  gap: 'medium',
  children: [...]
}
```

### Section
```javascript
{
  component: 'section',
  variant: 'default',
  padding: 'large',
  children: [...]
}
```

## Content Components

### Hero Section
```javascript
{
  component: 'hero_section',
  title: 'Welcome',
  subtitle: 'Build amazing websites',
  background_image: { filename: '...' },
  cta_button: { ... }
}
```

### Text Block
```javascript
{
  component: 'text_block',
  content: { type: 'doc', content: [...] },
  variant: 'body',
  alignment: 'left'
}
```

### Card
```javascript
{
  component: 'card',
  title: 'Card Title',
  content: 'Card content',
  image: { filename: '...' },
  link: { text: 'Learn More', url: '#' }
}
```

## UI Components

### Button
```javascript
{
  component: 'button',
  text: 'Click Me',
  url: '#',
  variant: 'primary',
  size: 'medium'
}
```

## Form Components

### Input
```javascript
{
  component: 'input',
  type: 'text',
  name: 'email',
  label: 'Email Address',
  placeholder: 'you@example.com',
  required: true
}
```

## Creating Custom Components

See [CUSTOMIZATION.md](./CUSTOMIZATION.md) for details on creating your own components.
