.PHONY: download help

download:
	./scripts/download-releases.sh $(ARGS)

help:
	@echo "Usage:  make download ARGS='[options]'"
	@echo ""
	@echo "Options:"
	@echo "  -s, --short          Download short.mp4 only (default: all assets)"
	@echo "  -c, --count N        Number of latest releases (default: 20)"
	@echo "  -t, --time HOURS     Only releases from the last N hours"
	@echo "  -o, --outdir DIR     Output directory (default: out)"
	@echo ""
	@echo "Examples:"
	@echo "  make download ARGS='-s -c 20'        # latest 20 shorts"
	@echo "  make download ARGS='-s -t 12'         # shorts from last 12h"
	@echo "  make download ARGS='-s -c 10 -t 24'   # latest 10 shorts from last 24h"
	@echo "  make download                          # all assets, latest 20"
