# [Stormkit SDK](https://www.stormkit.io/)

The api package is a javascript SDK written for Stormkit applications.

## Installation

You can install this package through yarn or npm:

```bash
yarn add @stormkit/api
```

or

```
npm install @stormkit/api
```

### API

#### - Stormkit.context

```
Stormkit.context(ctx, request)
```

Sets the context for the current user. It accepts an object as the first argument, and the NodeJS request object on server side environments as a second argument.

The ctx argument is an object that accepts the `segment` and `version` properties. `segment` is a string value defined at your will, and `version` is a number value.

#### - Stormkit.config

```
Stormkit.config(request, response)
```

Retrieves a remote configuration parameter. The only arguments are the NodeJS request and response objects.
On client-side calls these parameters are omitted.

This function returns a `Config` class that exports the `get` method. You can use it to retrieve
the parameter value. See examples below.

### Remote Configuration

In order to use the remote configuration, you will have to create an application on [Stormkit](https://www.stormkit.io).

You can create a remote configuration for each environment that the application owns. Please refer to the [docs](https://www.stormkit.io/docs/remote-config) to see how a remote configuration is created.

Once you have created a remote configuration for your application, you can use it by importing this package and calling the `config` method:

```js
import sk from "@stormkit/api";

console.log(sk.config().get("my-key"));
```

If you need to use the remote configuration on a server environment, you'll need to pass the request and response object:

```js
import sk from "@stormkit/api";

export default (req, res) => {
  console.log(sk.config(req, res).get("my-key"));
};
```

If you need to display a configuration only to a segment of your user base, you will need to identify the user first. To do so, you can use `user` method.

```js
import sk from "@stormkit/api";

export default (req, res) => {
  // Identify the user
  sk.context({ segment: "my-segment" });

  // For client-side calls the request and response objects are omitted
  console.log(sk.config(req, res).get("my-key"));
};
```

If `my-key`, which defined in the Stormkit UI, has a value with a condition to match `my-segment`, the above example will print the value. Otherwise it will print the other
value that matches (if any).

The `user` method accepts the following object as an argument:

```js
{
    segment: "<string>: Any string that specifies a segment for user.",
    version: "<number>: A version number that will be used to match the app version."
}
```

## Documentation

You can read the [docs](https://www.stormkit.io/docs) from the official website. They also contain some examples.
