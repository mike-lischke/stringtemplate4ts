# Error listeners

To get notified when StringTemplate detects a problem during compilation of templates or, at runtime, when interpreting templates, provide StringTemplate with an error listener. The default listener sends messages to the console, which is generally not what you want in a larger application. Here is the listener definition:
 
```typescript
export interface STErrorListener {
    compileTimeError(msg: STMessage): void;
    runTimeError(msg: STMessage): void;
    iOError(msg: STMessage): void;
    internalError(msg: STMessage): void;
}
```
 
The STMessage instances include information such as the ErrorType and any arguments. Evaluating the message to a string, as appropriate for the port language, yields a suitable message or you can pull it apart yourself.

You can specify a listener per group or per execution of the interpreter. To catch compile errors, make sure to set the listener before you trigger an action that processes the group file or loads templates:

```typescript
// listener per group
const g = new STGroup(...);
g.setListener(myListener);
g.getInstance("foo");
...
```

If you want to track interpretation errors with a particular listener, use the appropriate ST.write() method:

```typescript
// listener per rendering
const g = new STGroup(...);
const st = g.getInstance("foo");
st?.write(myWriter, myListener);
```

Imported groups automatically use the listener of the importing group.
