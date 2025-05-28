# Custom Components

Add your custom components here. They will be automatically registered.

## Example:

```javascript
// MyCustomComponent.js
export const MyCustomComponent = (props) => {
  const element = document.createElement('div');
  element.className = 'my-custom-component';
  element.innerHTML = `<h2>${props.title}</h2>`;
  
  return {
    getElement: () => element,
    update: (newProps) => {
      element.querySelector('h2').textContent = newProps.title;
    },
    destroy: () => {
      element.remove();
    }
  };
};
```
