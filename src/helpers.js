export const PROXY_PREFIX = '\0commonjs-proxy:';
export const EXTERNAL_PREFIX = '\0commonjs-external:';
export const DYNAMIC_REGISTER_PREFIX = '\0commonjs-dynamic-register:';
export const DYNAMIC_JSON_PREFIX = '\0commonjs-dynamic-json:';
export const DYNAMIC_PACKAGES_ID = '\0commonjs-dynamic-packages';
export const HELPERS_ID = '\0commonjsHelpers';

export const HELPERS = `
export var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !==
'undefined' ? self : {};

export function commonjsRegister (path, loader) {
	DYNAMIC_REQUIRE_LOADERS[path] = loader;
}

export function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x.default : x;
}

export function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

export function getCjsExportFromNamespace (n) {
	return n && n.default || n;
}

const DYNAMIC_REQUIRE_LOADERS = Object.create(null);
const DYNAMIC_REQUIRE_CACHE = Object.create(null);
const DEFAULT_PARENT_MODULE = {
	id: '<' + 'rollup>', exports: {}, parent: undefined, filename: null, loaded: false, children: [], paths: []
};
const CHECKED_EXTENSIONS = ['', '.js', '.json'];

function normalize (path) {
	path = path.replace(/\\\\/g, '/');
	const parts = path.split('/');
	const resolvedParts = [parts[0]];
	for (let i = 1; i < parts.length; i++) {
	  const part = parts[i];
	  if (part === '..' && resolvedParts.length > 1 && resolvedParts[resolvedParts.length - 1] !== '..') {
	    resolvedParts.pop();
	  } else if (part && part !== '.') {
	    resolvedParts.push(part);
	  }
	}
	return resolvedParts.join('/');
}

export function commonjsRequire (path, originalModuleDir) {
	const isRelative = path[0] === '.' || path[0] === '/';
	path = normalize(path);
	let relPath;
	while (true) {
		if (isRelative) {
			relPath = originalModuleDir ? normalize(originalModuleDir + '/' + path) : path;
		} else if (originalModuleDir) {
			relPath = normalize(originalModuleDir + '/node_modules/' + path);
		} else {
		  throw new Error('Missing test case');
			// relPath = pathModule.normalize(pathModule.join('node_modules', path));
		}
		for (let extensionIndex = 0; extensionIndex < CHECKED_EXTENSIONS.length; extensionIndex++) {
			const resolvedPath = relPath + CHECKED_EXTENSIONS[extensionIndex];
			let cachedModule = DYNAMIC_REQUIRE_CACHE[resolvedPath];
			if (cachedModule) return cachedModule.exports;
			const loader = DYNAMIC_REQUIRE_LOADERS[resolvedPath];
			if (loader) {
				DYNAMIC_REQUIRE_CACHE[resolvedPath] = cachedModule = {
					id: resolvedPath,
					filename: resolvedPath,
					exports: {},
					parent: DEFAULT_PARENT_MODULE,
					loaded: false,
					children: [],
					paths: []
				};
				try {
					loader.call(commonjsGlobal, cachedModule, cachedModule.exports);
				} catch (error) {
					delete DYNAMIC_REQUIRE_CACHE[resolvedPath];
					throw error;
				}
				cachedModule.loaded = true;
				return cachedModule.exports;
			};
		}
		if (isRelative) break;
		const nextDir = normalize(originalModuleDir + '/..');
		if (nextDir === originalModuleDir) break;
		originalModuleDir = nextDir;
	}

	return require(path);
}

commonjsRequire.cache = DYNAMIC_REQUIRE_CACHE;`;
