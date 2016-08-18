import test from 'ava';
import './fixtures/maws';
import m from '../';

test('error', t => {
	t.throws(() => m(), 'Expected `props` to be of type `Array`, got `undefined`');
	t.throws(() => m(['foo']), 'Expected `encryptionContext` option to be of type `object`, `function` or `Array`, got `undefined`');
});

test('no `__cipher` prop available', t => {
	const ctx = {
		body: {
			foo: 'bar',
			unicorn: 'rainbow'
		}
	};

	const fn = m(['unicorn'], {encryptionContext: ['foo']});

	fn(ctx);

	t.deepEqual(ctx.body, {
		foo: 'bar',
		unicorn: 'rainbow'
	});
});

test('body is a promise', async t => {
	const ctx = {
		body: Promise.resolve({
			foo: 'bar',
			unicorn: 'rainbow'
		})
	};

	const fn = m(['unicorn'], {encryptionContext: ['foo']});

	fn(ctx);

	t.deepEqual(await ctx.body, {
		foo: 'bar',
		unicorn: 'rainbow'
	});
});

test('decrypt body', async t => {
	const ctx = {
		body: {
			foo: 'bar',
			unicorn: '6ca5fc8c1b0c9f2b4e549bbfb55dc63ca850c2919f862c',
			__cipher: 'Zm9vYmFy'
		}
	};

	const fn = m(['unicorn'], {encryptionContext: ['foo']});

	fn(ctx);

	t.deepEqual(await ctx.body, {
		foo: 'bar',
		unicorn: 'rainbow',
		__cipher: 'Zm9vYmFy'
	});
});

test('decrypt promise body', async t => {
	const ctx = {
		body: Promise.resolve({
			foo: 'bar',
			unicorn: '6ca5fc8c1b0c9f2b4e549bbfb55dc63ca850c2919f862c',
			__cipher: 'Zm9vYmFy'
		})
	};

	const fn = m(['unicorn'], {encryptionContext: ['foo']});

	fn(ctx);

	t.deepEqual(await ctx.body, {
		foo: 'bar',
		unicorn: 'rainbow',
		__cipher: 'Zm9vYmFy'
	});
});

test('do nothing if properties do not exist', async t => {
	const ctx = {
		body: {
			foo: 'bar',
			__cipher: 'Zm9vYmFy'
		}
	};

	const fn = m(['unicorn'], {encryptionContext: ['foo']});

	fn(ctx);

	t.deepEqual(await ctx.body, {
		foo: 'bar',
		__cipher: 'Zm9vYmFy'
	});
});

test('encryptionContext as a function throws error on wrong result', async t => {
	const ctx = {
		body: {
			foo: 'bar',
			unicorn: '6ca5fc8c1b0c9f2b4e549bbfb55dc63ca850c2919f862c',
			__cipher: 'Zm9vYmFy'
		}
	};

	const fn = m(['unicorn'], {encryptionContext: () => 'foo'});

	t.throws(() => fn(ctx), 'Expected the `EncryptionContext` function to generate an `object` or an `Array`, got `string`');
});

test('encryptionContext as a function', async t => {
	const ctx = {
		body: Promise.resolve({
			foo: 'bar',
			unicorn: '6ca5fc8c1b0c9f2b4e549bbfb55dc63ca850c2919f862c',
			__cipher: 'Zm9vYmFy'
		})
	};

	const fn = m(['unicorn'], {encryptionContext: () => ['foo']});

	fn(ctx);

	t.deepEqual(await ctx.body, {
		foo: 'bar',
		unicorn: 'rainbow',
		__cipher: 'Zm9vYmFy'
	});
});
