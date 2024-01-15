# Model Adaptors

StringTemplate lets you access the properties of injected attributes, but only if they follow a specific naming pattern (`hasXXX`, `getXXX`, `isXXX`) or are publicly visible fields. This works well if you control the attribute class definitions, but falls apart for some models.

Some models, though, don't follow the getter method naming convention and so template expressions cannot access properties. To get around this, we need a model adaptor that makes external models look like the kind StringTemplate needs. If object `o` is of type `T`, we register a model adaptor object, `a`, for `T` that converts property references on `o`. Given `<o.foo>`, StringTemplate will ask `a` to get the value of property `foo`. As with renderers, `a` is a suitable adaptor if "`o` is instance of `a`'s associated type".

This is the adaptor interfaces:

```typescript
export interface ModelAdaptor<T> {
    getProperty(interp: IInterpreter, self: IST, model: T, property: unknown, propertyName: string): unknown;
}
```

|Property name type|
|------------------|
|Property names are usually strings but they don't have to be. For example, if `o` is a dictionary, the property could be of any key type. The string value of the property name is always passed to the renderer by StringTemplate.|

## Example 1
 
```typescript
class UserAdaptor implements ModelAdaptor<User> {
    public  getProperty(interpreter: IInterpreter, self: IST, model: User, property: unknown, propertyName: string): unknown {
        if (propertyName === "id") {
            return model.id;
        }
        if (propertyName === "name") {
            return model.theName();
        }
        throw new STNoSuchPropertyException(null, "User." + propertyName);
    }
}

class User {
    private id: number; // ST can't see; it's private
    private name: string;
    public constructor(id: number, name: string) { this.id = id; this.name = name; }
    public theName(): string { return name; } // doesn't follow naming conventions
}
```

```typescript
const template = "foo(x) ::= \"<x.id>: <x.name>\"\n";
const g = new STGroupString(template);
g.registerModelAdaptor(User, new UserAdaptor());
const st = g.getInstanceOf("foo");
st?.add("x", new User(100, "parrt"));
const expecting = "100: parrt";
const result = st?.render();
```

|Inheriting from `ObjectModelAdaptor`|
|---|
|You can inherit your ModelAdaptor from `ObjectModelAdaptor<T>` to leverage its ability to handle "normal" attributes. You can choose to override the results of any given property or to handle properties that would not normally be handled by the default `ObjectModelAdaptor<T>`.|

## Example 2
 
```typescript
class UserAdaptor extends ObjectModelAdaptor<User> {
    public getProperty(interpreter: IInterpreter, self: IST, model: User, property: unknown, propertyName: string): unknown {
        // intercept handling of "name" property and capitalize first character
        if (propertyName === "name") {
            return model.name[0].toUpperCase() + model.name.substring(1);
        }
        
        // respond to "description" property by composing desired result
        if (propertyName === "description") {
            return "User object with id:" + model.id;
        }
        
        // let "id" be handled by ObjectModelAdaptor
        return super.getProperty(interpreter, self, model, property, propertyName);
    }
}

class User {
    public id: number; // ST can see this and we'll let ObjectModelAdaptor handle it
    public name: string;  // ST can see this, but we'll override to capitalize
    public constructor(id: number, name: string) { this.id = id; this.name = name; }
}
```
 
```typescript
const template = "foo(x) ::= \"<x.id>: <x.name> (<x.description>)\"\n";
const g = new STGroupString(template);
g.registerModelAdaptor(User, new UserAdaptor());
const st = g.getInstanceOf("foo");
st?.add("x", new User(100, "parrt"));
const expecting = "100: Parrt (User object with id:100)";
const result = st?.render();
```
