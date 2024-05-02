# react-native-ts-identity-orchestration

React Native wrapper for Transmit Security IDO SDK

## Installation

```sh
npm install react-native-ts-identity-orchestration
```

## Usage

```js
import { multiply } from 'react-native-ts-identity-orchestration';

// ...

const result = await multiply(3, 7);
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)



add transmit plist file to ios and json file/manifest for android
must set response handler


Android
=======
Add to app/build.gradle

repositories {
  google()
  maven {
    url('https://transmit.jfrog.io/artifactory/transmit-security-gradle-release-local/')
  }
}