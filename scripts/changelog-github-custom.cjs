'use strict';
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
	for (var name in all) __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
	if ((from && typeof from === 'object') || typeof from === 'function') {
		for (let key of __getOwnPropNames(from))
			if (!__hasOwnProp.call(to, key) && key !== except)
				__defProp(to, key, {
					get: () => from[key],
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
	}
	return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, '__esModule', { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
	default: () => src_default
});
module.exports = __toCommonJS(src_exports);
var import_dotenv = require('dotenv');
var import_get_github_info = require('@changesets/get-github-info');
(0, import_dotenv.config)();
function validate(options) {
	if (!options || !options.repo) {
		throw new Error(
			'Please provide a repo to this changelog generator like this:\n"changelog": ["@changesets/changelog-github", { "repo": "org/repo" }]'
		);
	}
}
var changelogFunctions = {
	getDependencyReleaseLine: async (changesets, dependenciesUpdated, options) => {
		validate(options);
		if (dependenciesUpdated.length === 0) return '';
		const changesetLink = `- Updated dependencies [${(
			await Promise.all(
				changesets.map(async (cs) => {
					if (cs.commit) {
						const { links } = await (0, import_get_github_info.getInfo)({
							repo: options.repo,
							commit: cs.commit
						});
						return links.commit;
					}
				})
			)
		)
			.filter((_) => _)
			.join(', ')}]:`;
		const updatedDepenenciesList = dependenciesUpdated.map(
			(dependency) => `  - ${dependency.name}@${dependency.newVersion}`
		);
		return [changesetLink, ...updatedDepenenciesList].join('\n');
	},
	getReleaseLine: async (changeset, type, options) => {
		validate(options);
		const repo = options.repo;
		let prFromSummary;
		let commitFromSummary;
		const replacedChangelog = changeset.summary
			.replace(/^\s*(?:pr|pull|pull\s+request):\s*#?(\d+)/im, (_, pr) => {
				const num = Number(pr);
				if (!isNaN(num)) prFromSummary = num;
				return '';
			})
			.replace(/^\s*commit:\s*([^\s]+)/im, (_, commit) => {
				commitFromSummary = commit;
				return '';
			})
			.replace(/^\s*(?:author|user):\s*@?([^\s]+)/gim, '')
			.trim();
		const linkifyIssueHints = (line) =>
			line.replace(/(?<=\( ?(?:fix|fixes|see) )(#\d+)(?= ?\))/g, (issueHash) => {
				return `[${issueHash}](https://github.com/${repo}/issues/${issueHash.substring(
					1
				)})`;
			});
		const [firstLine, ...futureLines] = replacedChangelog
			.split('\n')
			.map((l) => linkifyIssueHints(l.trimRight()));
		const links = await (async () => {
			if (prFromSummary !== void 0) {
				let { links: links2 } = await (0, import_get_github_info.getInfoFromPullRequest)({
					repo,
					pull: prFromSummary
				});
				if (commitFromSummary) {
					links2 = {
						...links2,
						commit: `[\`${commitFromSummary}\`](https://github.com/${repo}/commit/${commitFromSummary})`
					};
				}
				return links2;
			}
			const commitToFetchFrom = commitFromSummary || changeset.commit;
			if (commitToFetchFrom) {
				const { links: links2 } = await (0, import_get_github_info.getInfo)({
					repo,
					commit: commitToFetchFrom
				});
				return links2;
			}
			return {
				commit: null,
				pull: null,
				user: null
			};
		})();
		const suffix = links.pull ? ` (${links.pull})` : links.commit ? ` (${links.commit})` : '';
		return `
- ${firstLine}${suffix}
${futureLines.map((l) => `  ${l}`).join('\n')}`;
	}
};
var src_default = changelogFunctions;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
