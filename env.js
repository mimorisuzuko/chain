let { env: { NODE_ENV, WATCH } } = process;

if (!NODE_ENV) {
	NODE_ENV = 'production';
}

WATCH = WATCH === 'true';

if (!NODE_ENV) {
	NODE_ENV = 'production';
}

const isProduction = NODE_ENV === 'production';

export { NODE_ENV, WATCH, isProduction };
