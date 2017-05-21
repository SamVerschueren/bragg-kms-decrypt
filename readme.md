# bragg-kms-decrypt [![Build Status](https://travis-ci.org/SamVerschueren/bragg-kms-decrypt.svg?branch=master)](https://travis-ci.org/SamVerschueren/bragg-kms-decrypt)

> [Bragg](https://github.com/SamVerschueren/bragg) middleware to decrypt properties from the response object

The `aws-sdk` is not a dependency and has to be installed separately. The reason for this is that the SDK is automatically available in AWS Lambda functions. This way, we reduce the size of the deployment package drastically.


## Install

```
$ npm install --save bragg-kms-decrypt
```


## Usage

```js
const app = require('bragg')();
const router = require('bragg-router')();
const decrypt = require('bragg-kms-decrypt');
const safeGuard = require('bragg-safe-guard');

const findUser = ctx => {
	ctx.body = {
		firstName: 'Foo',
		name: 'Bar',
		email: 'c560c4ee28bc35e21416e',
		__cipher: 'AQEDAHjWAoeHvrOIoPB+D9i61iyhfgDwsm1dEoL7qURAK8w=='
	};
};

router.get('/user', findUser, decrypt(['email'], {encryptionContext: ['firstName', 'name']}));

app.use(router.routes());

// Prevent `__cipher` to be leaking outside the function
app.use(safeGuard(['__cipher']));

app.use(ctx => {
	console.log(ctx.body);
	//=> {firstName: 'Foo', name: 'Bar', email: 'foo@bar.com'}
});

exports.handler = app.listen();
```


## API

### decrypt(props, options)

#### props

Type: `string[]`

Properties of the body that should be decrypted.

#### options

##### encryptionContext

Type: `Array<string | object>` `object` `function`<br>
*Required*

The properties or the object that should be used as encryption context. The [encryption context](http://docs.aws.amazon.com/kms/latest/developerguide/encryption-context.html) is used
to generate the cipher key and the same context should be used to decrypt it again.

Here are some examples for parsing the encryption context. Let's assume `generate` generates the encryption context for the provided input.

```js
const input = {
	firstName: 'Foo',
	name: 'Bar'
};

generate(input, ['firstName', 'name']);
//=> {firstName: 'Foo', name: 'Bar'}


generate(input, ['firstName', 'name', {foo: 'bar'}]);
//=> {firstName: 'Foo', name: 'Bar', foo: 'bar'}

generate(input, {foo: 'bar'});
//=> {foo: 'bar}
```

###### EncryptionContext as a function

It's also possible to provide a function as `encryptionContext`. This function will be called with the `Bragg` context object and should return
an array with strings and/or objects, or an object. You should use this when the encryption context depends on request parameters.

```js
const calculate = ctx => {
	return [
		'firstName',
		'name',
		{
			id: ctx.request.params.id
		}
	];
};

router.get('/user', findUser, decrypt(['email'], {encryptionContext: calculate}));
```

##### maxAge

Type: `number`<br>
Default: `0`

Milliseconds to cache the decrypted cipher key.

#### key

Type: `string`<br>
Default: `__cipher`

Name of the property that holds the encrypted cipher key.

#### encoding

Type: `string`<br>
Default: `base64`

Encoding type of the encrypted cipher key.


## Encryption

The middleware decrypts the data with [jovi](https://github.com/SamVerschueren/jovi) which uses `AES-256-CTR` to encrypt and decrypt data. The library generates an
`IV` and a `hash` for the provided data and `key`. The `key` is the decrypted KMS cipher key of which the encrypted version should be stored per record.

The data is expected to be stored as a concatenation of the hex value of the `IV` and the `hash`. For instance, let's assume

```js
const jovi = require('jovi');

// Decrypted with KMS
const key = '5a8b3aa11b6047c967ba7c66fd02b2f851c95da80e0218f0aa6088db50565753';

// Encrypt `unicorn` with the key
const ret = jovi.encrypt('unicorn', key);

const value = ret.iv.toString('hex') + ret.hash.toString('hex');
// => 6ca5fc8c1b0c9f2b4e549bbfb55dc63ca850c2919f862c
```

The value should be stored as the value of the property in the database together with the encrypted `key`. The middleware will extract the `IV` and the `hash` for you.


## Related

- [bragg](https://github.com/SamVerschueren/bragg) - AWS λ web framework.
- [bragg-safe-guard](https://github.com/SamVerschueren/bragg-safe-guard) - Prevents leaking information outside the bragg context.
- [jovi](https://github.com/SamVerschueren/jovi) - Encrypt and decrypt data with AES-256-CTR.


## License

MIT © [Sam Verschueren](https://github.com/SamVerschueren)
