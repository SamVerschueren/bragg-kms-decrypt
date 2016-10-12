'use strict';
const dotProp = require('dot-prop');

const validateElement = (input, opts) => {
	return typeof input === 'object' && input[opts.key];
};

exports.validateInput = (input, props, opts) => {
	if (Array.isArray(input)) {
		return input.every(x => validateElement(x, opts));
	}

	return validateElement(input, opts);
};

exports.validateProps = (input, props) => {
	return props.some(x => dotProp.has(input, x));
};
