echo "lines:      " `find ./ -name '*.js' ! -name "*_test.js" -exec cat {} \; | wc -l`
echo "semicolons: " `find ./ -name '*.js' ! -name "*_test.js" -exec cat {} \; | grep ';' | wc -l`