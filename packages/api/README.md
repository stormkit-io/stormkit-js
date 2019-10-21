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
  sk.user({ segment: "my-segment" });

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
