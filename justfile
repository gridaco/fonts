# https://just.systems

default:
	echo 'Hello, world!'

# Copy Apple emoji PNG files to public directory (renames emoji_u*.png to *.png)
www-copy-apple-emoji:
	rsync -a --include="*/" --include="emoji_u*.png" --exclude="*" vendor/apple-emoji-linux/png/160/ www/public/apple/emoji/160/
	cd www/public/apple/emoji/160/ && for f in emoji_u*.png; do mv "$f" "${f#emoji_u}"; done

# Clean Apple emoji PNG files from public directory
www-clean-apple-emoji:
	rm -rf www/public/apple/emoji/
