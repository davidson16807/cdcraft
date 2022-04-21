echo "lines:      " `find ./scripts -name '*.js' ! -name "*_test.js" -exec cat {} \; | wc -l`
echo "semicolons: " `find ./scripts -name '*.js' ! -name "*_test.js" -exec cat {} \; | grep ';' | wc -l`