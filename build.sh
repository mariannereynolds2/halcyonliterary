#!/usr/bin/env bash
# Cloudflare Pages build: turns the content edited in /admin into the website.
set -e
pip install --quiet -r requirements.txt || echo "pip install failed, building without optional packages"
HL_OUT=public python3 build.py
HL_OUT=public python3 translate_build.py
