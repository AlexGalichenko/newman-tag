const path = require('path');
const { program } = require('commander');
const parse = require('cucumber-tag-expressions').default;

program
  .option('-t, --tags <tags>', 'tag expression')
  .option('-c, --collection <collection>', 'collection json')
  .parse(process.argv);

const json = require(path.resolve(program.collection));
const tags = parse(program.tags);
const taggedJson = filter(json, tags, []);

console.log(JSON.stringify(taggedJson));

function filter(node, tags, topLevelTags = []) {
  const description = node.request && node.request.description ? node.request.description : node.description;
  const currentItemTags = [...topLevelTags, ...extractTags(description)];
  if (node.item) {
    for (let i = 0; i < node.item.length; i++) {
      if (!filter(node.item[i], tags, currentItemTags)) {
        node.item.splice(i, 1);
      }
    }
    return node
  } else if (node.request) {
    return tags.evaluate(currentItemTags) ? node : null
  }
}

function extractTags(description = "") {
  const TAGS_REGEXP = /tags\[(.+)]/;
  const SPLIT_REGEXP = /\s*,\s*/;
  const match = description.match(TAGS_REGEXP);
  return match && match[1] ? match[1].split(SPLIT_REGEXP) : [];
}