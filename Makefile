.PHONY: build clean install

build: clean
	$(MAKE) -C src
	mkdir -p dist/
	cp -r src/dist/* src/coursesite.service src/greg src/install.sh src/prerequisites.sh src/run.sh src/pw.sh src/nginx.sh dist/

clean:
	rm -rf dist/