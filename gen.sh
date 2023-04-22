#!/usr/bin/env bash

mkdir dist
cp package.json dist
touch index.js
cat << EOF > "index.js"
export default () => console.log('hey');
EOF
mv index.js dist