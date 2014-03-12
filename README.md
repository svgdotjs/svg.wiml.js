# svg.wiml.js

This is a plugin for the [svg.js](http://svgjs.com) library adding the wiml markup language to the text element.

Svg.wiml.js is licensed under the terms of the MIT License.

## Introduction
The WIML markup language tries to ease the pain of manually building styled text by providing a more comprehensible and concise syntax. Additionally it provides support for interpolation with variables and conditions on fragments of content. It is loosely inspired on the textile syntax.

## Usage
Include this plugin after including the svg.js library in your html document.

### Markup
To be able to use the WIML markup language you need to know how text elements are structured in SVG. Basically text elements can contain text nodes or tspan elements.

```haml
Just some %{fill:#f06}styled% text
```

Note that you will always have to open and close nodes. Opening the tspan will be done by the first `%` and closing again by the second `%`.

### Adding tspans
In its easiest form, a text element contains just a plain text node:

```xml
<text>Just some plain text</text>
```

The WIML equivalent would be:

```haml
Just some plain text
```

Parts of the text content can be wrapped in tspans:

```xml
<text>Just some <tspan fill="#f06">styled</tspan> text</text>
```

The WIML equivalent would be:

```haml
Just some %{fill:#f06}styled% text
```

Basically every existing SVG attribute can be passed on there, not unlike CSS:

```haml
Just some %{fill:#f06;stroke-opacity:0;dy:-40}styled% text
```

### Generating elements
Generating text elements with WIML markup is much like generating regular text elements. By far the easiest way is to call the `wiml()` method on the parent element:

```javascript
draw.wiml('Just some %{fill:#f06}styled% text') // returns a text element
```

This will generate a text element with the desired markup.

Another way is to call the `wiml()` method on an existing text element:

```javascript
var text = draw.text('Plain text')
var wiml = text.wiml('Just some %{fill:#f06}styled% text') // returns an instance of SVG.WIML
```


### Variables
Now this is where it starts getting interesting. WIML provides functionality for inline variables which are interpolated with a javascript object. In the WIML syntax variables are defined with a `=` symbol:

```haml
Just some %=description% text
```

In practice this would work as follows:

```javascript
draw.wiml('Just some %=description% text', { description: 'fabulous' })
```

Of course styling can be added to the varibale section as well:

```javascript
draw.wiml('Just some %{fill:#f06}=description% text', { description: 'fabulous' })
// => Just some <span fill="#ff0066">fabulous</span> text
```


### Conditional text fragments
To go a step further, conditions on the presence of variables can be added to WIML instances.

As an example, if the `description` value has been provide that part will be rendered:

```javascript
draw.wiml('Just %{if:description}some% %=description% text', { description: 'fabulous' })
// => Just some fabulous text
```

But if it is not provided it won't render:

```javascript
draw.wiml('Just %{if:description}some% %=description% text', { house: 'mastaba' })
// => Just text
```

This also works for the requirement of muliple variables:

```javascript
draw.wiml('Just %{if:description+content}some% %=description% %=content% content!', { description: 'fabulous', content: 'text' })
// => Just some fabulous text content!
```

If just one variable is not present, "some" won't be rendered:

```javascript
draw.wiml('Just %{if:description+content}some% %=description% %=content% content!', { description: 'fabulous' })
// => Just fabulous content!
```

By separating the required variables with a `+`, they will all be required.

And this also works in the other direction when variabels are separated by a `,`:

```javascript
draw.wiml('Just %{if:description,content}some% %=description% %=content% content!', { description: 'fabulous' })
// => Just some fabulous content!
```

To conclude, `if:description+content` requires all variables to be present, `if:description,content` requires just one variable to be present to add the encapsulated content.

Of course there also is the opposite situation where some content should not be rendered if certain values are present. In that case `unless` should be used instead of `if`:

```javascript
draw.wiml('Just %{unless:description}some% %=description% text', { description: 'fabulous' })
// => Just fabulous text
```

As you might expect this works exacly like `if` with multiple conditions, but in the opposite direction:

```javascript
draw.wiml('Just %{unless:description+content}some% %=description% %=content% content!', { description: 'fabulous', content: 'text' })
// => Just fabulous text content!
```

## Important

### Nested tspans
With the current syntax nested tspans are not possible.

### Using % inside a WIML tspan
Can be done by escaping the `%` sign inside the WIML tspan:

```haml
I am %{fill:#f06}about 100\% sure% it will work.
```

