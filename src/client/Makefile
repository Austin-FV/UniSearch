.PHONY: build clean

build: clean
	npm install
	export NODE_OPTIONS=--max-old-space-size=2048 && npm run build
	mv build/ dist/

clean:
	rm -rf dist/