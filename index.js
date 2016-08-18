'use strict';
const isPromise = require('is-promise');
const decrypt = require('./lib/decrypt');

module.exports = (props, opts) => {
	opts = Object.assign({
		maxAge: 0,
		key: '__cipher',
		encoding: 'base64'
	}, opts);

	if (!Array.isArray(props)) {
		throw new TypeError(`Expected \`props\` to be of type \`Array\`, got \`${typeof props}\``);
	}

	if (!Array.isArray(opts.encryptionContext) && typeof opts.encryptionContext !== 'object' && typeof opts.encryptionContext !== 'function') {
		throw new TypeError(`Expected \`encryptionContext\` option to be of type \`object\`, \`function\` or \`Array\`, got \`${typeof opts.encryptionContext}\``);
	}

	return ctx => {
		if (isPromise(ctx.body)) {
			ctx.body = ctx.body.then(result => decrypt(ctx, result, props, opts));
		} else {
			ctx.body = decrypt(ctx, ctx.body, props, opts);
		}
	};
};
