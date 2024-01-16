# Attribute Renderers

The atomic element of a template is a simple attribute (any value) that is rendered to text. For example, an number object is converted to text as a sequence of characters representing the numeric value. 

What if we want commas to separate the 1000's places like 1,000,000? What if we want commas and sometimes periods depending on the locale? For more, see [The Internationalization and Localization of Web Applications](https://www.cs.usfca.edu/~parrt/papers/i18n.pdf).

StringTemplate lets you register objects that know how to format or otherwise render attributes to text appropriately.
There is one registered renderer per type per group. The interface to describe these renderers:
 
```typescript
export interface IAttributeRendererOptions {
    format?: string;
    locale?: Intl.Locale;
    timeZone?: string;
}

export interface AttributeRenderer<T> {
    toString(value: T, options: IAttributeRendererOptions): string;
}

```

This implemenation differs somewhat from the Java variant. Because all of the options are optional we better use an interface that can specify any of the options in any order (or not). In Java these options are individual parameters. 

This approach allows us also to add parameters that are not useful for all renderers, like the `timeZone` field, which is relevant only for the `DateRender`.
 
To render expression `<e>`, StringTemplate looks for a renderer associated with the object type of `e`, say, *t*. 
If *t* is associated with a registered renderer, *r*, it is suitable and StringTemplate invokes the renderer method:
 
| Expression syntax | How interpreter invokes renderer r |
|-------------------|------------------------------------|
| `<e>`             | `r.toString(e, { locale })`      |
| `<e; format="f">` | `r.toString(e, { format: "f", locale })`       |

StringTemplate supplies either the default locale and time zone, or whatever locale/time zone was set by the programmer. If the format string passed to the renderer is not recognized then the renderer should simply call the usual string evaluation method.

To register a renderer, we tell the group to associate an object type with a renderer object. Here's an example that tells StringTemplate to render Date with an instance of DateRenderer using the Portuguese locale (taken from the unit tests):
 
```typescript
const input = "<date; format=\"dd 'de' MMMM 'de' yyyy\">";
const group = new STGroup();
group.registerRenderer(Date, new DateRenderer());
const st = new ST(group, input);

const date = new Date(2012, 5, 12); // Months are 0-based.
st?.add("date", date);

const expected = "12 de junho de 2012";
assertEquals(expected, st?.render(new Intl.Locale("pt")));
```

**StringTemplate4TypeScript matches the types of expressions with the renderers using a manual prototype chain walk.**
As in this example, we registered a renderer for dates and StringTemplate used it for any subclass derived from a Date. 

StringTemplate comes with three predefined renderers: `DateRenderer`, `StringRenderer`, and `NumberRenderer`.
