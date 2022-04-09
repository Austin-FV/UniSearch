DIRS = client courseutility parser

.PHONY: build clean $(DIRS)

build: clean $(DIRS)
	mkdir dist
	for dir in $(DIRS); do cp -rf $${dir}/dist dist/$${dir}; done

$(DIRS):
	$(MAKE) -C $@ build

clean:
	rm -rf dist/
